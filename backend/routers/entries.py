from io import BytesIO
from fastapi import APIRouter, Depends, status, HTTPException, Request
from fastapi.responses import JSONResponse
from cloudinary.uploader import upload, destroy
from PIL import Image
from datetime import datetime
from typing import List
from .authentification import Authorization
from .models import PostEntry, GetSingleEntry, GetEntries
from bson import ObjectId
from mimetypes import guess_type
from tempfile import NamedTemporaryFile
import ffmpeg


router = APIRouter()
auth_handler = Authorization()


@router.post("/")
def post_new_entry(request:Request, user_id=Depends(auth_handler.auth_wrapper), entry: PostEntry = Depends()) -> JSONResponse:
    if all(i is None for i in (entry.media_file, entry.text)):
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content='empty request')

    database_entry = {'timestamp': datetime.now()}

    if entry.title:
        database_entry['title'] = entry.title

    if entry.text:
        database_entry['text'] = entry.text

    if entry.url:
        database_entry['url'] = entry.url

    if entry.media_file:
        if 'image' in guess_type(entry.media_file.filename)[0]:
            img = Image.open(entry.media_file.file)
            img = img.convert('RGB')
            exif = img.getexif()
            output_img = BytesIO()
            if exif:
                if 306 in exif:
                    database_entry['timestamp'] = datetime.strptime(exif[306], '%Y:%m:%d %H:%M:%S')
                img.getexif().clear()

            img.save(output_img,"JPEG")
            output_img.seek(0)
            result = upload(output_img)
            database_entry['img'] = result.get('url')
            database_entry['img_id'] = result.get('public_id')
        if 'video' in guess_type(entry.media_file.filename)[0]:
            temp_file = NamedTemporaryFile(delete=False)
            output_file = NamedTemporaryFile(delete=False, suffix=".mp4")
            with temp_file as f:
                f.write(entry.media_file.file.read())
            (
                ffmpeg
                .input(temp_file.name)
                .output(output_file.name, map_metadata=-1)
                .run(overwrite_output=True)
            )
            result = upload(output_file.name, resource_type="video")
            database_entry['video'] = result.get('url')
            database_entry['video_id'] = result.get('public_id')

    new_msg = request.app.db['entries'].insert_one(database_entry)

    if entry.group_painting:
        group_id = request.app.db['groups'].find_one({'name': entry.group_painting})['_id']
        request.app.db['groups'].find_one({"_id": group_id})
        request.app.db['entries'].update_one({"_id": new_msg.inserted_id}, {
            '$set': {'group_painting': group_id}})

    if entry.group_sequenz:
        group_id = request.app.db['groups'].find_one({'name': entry.group_sequenz})['_id']
        request.app.db['groups'].find_one({"_id": group_id})
        request.app.db['entries'].update_one({"_id": new_msg.inserted_id}, {
            '$set': {'group_sequenz': group_id}})

    created_msg = request.app.db['entries'].find_one({"_id": new_msg.inserted_id})
    return JSONResponse(status_code=status.HTTP_201_CREATED, content=str(created_msg))


@router.get("/")
def get_all_entries(request:Request) -> List[GetEntries]:
    entries = []
    collected_paintings = []
    for entry in request.app.db['entries'].find().sort("timestamp",-1):
        if 'group_painting' in entry:
            if entry['group_painting'] in collected_paintings:
                continue
            else:
                collected_paintings.append(entry['group_painting'])
        entries.append(GetEntries(**entry))
    return entries


@router.get("/{entry_id}", response_description="Get a single entry")
def show_single_entry(entry_id: str, request: Request) -> GetSingleEntry:
    entry = request.app.db['entries'].find_one({"_id": ObjectId(entry_id)})
    if entry:
        collected_entries = []
        if 'group_painting' in entry and entry['group_painting'] is not None:
            group = request.app.db['entries'].find({'group_painting': ObjectId(entry['group_painting'])}).sort("timestamp",-1)
            painting_members = []
            for group_member in group:
                if group_member['_id'] != entry['_id']:
                    painting_members.append(GetEntries(**group_member))
                    collected_entries.append(group_member['_id'])
            entry['group_painting_members'] = painting_members
            group_from_db = request.app.db['groups'].find_one({'_id': ObjectId(entry['group_painting'])})
            entry['group_painting'] = group_from_db['name']

        if 'group_sequenz' in entry and entry['group_sequenz'] is not None:
            group = request.app.db['entries'].find({'group_sequenz': ObjectId(entry['group_sequenz'])}).sort("timestamp",-1)
            sequenz_members = []
            for group_member in group:
                if group_member['_id'] != entry['_id'] and group_member['_id'] not in collected_entries:
                    sequenz_members.append(GetEntries(**group_member))
            entry['group_sequenz_members'] = sequenz_members
            group_from_db = request.app.db['groups'].find_one({'_id': ObjectId(entry['group_sequenz'])})
            entry['group_sequenz'] = group_from_db['name']

        return GetSingleEntry(**entry)
    raise HTTPException(status_code=404, detail=f"Entry with {entry_id} not found")


@router.delete("/{entry_id}", response_description="delete a single entry")
def delete_single_entry(request: Request, entry_id:str, user_id=Depends(auth_handler.auth_wrapper)) -> JSONResponse:
    modified_arrays = 0
    deleted_pics = 0
    if entry := request.app.db['entries'].find_one({"_id": ObjectId(entry_id)}):
        if 'img' in entry and entry['img'] is not None:
            cloudinary_response = destroy(entry['img_id'])
            if cloudinary_response['result'] == "ok":
                deleted_pics += 1

        msg = request.app.db['entries'].delete_one({"_id": ObjectId(entry_id)})

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content=f"Deleted {str(msg.deleted_count)} Entry and {deleted_pics} pics "
                    f"and modified { str(modified_arrays)} Groups")

    raise HTTPException(status_code=404, detail=f"Entry with {entry_id} not found")


@router.patch("/{entry_id}", response_description="patch an entry")
def patch_entry(request: Request, entry_id: str, entry:PostEntry = Depends(),
                user_id=Depends(auth_handler.auth_wrapper)) -> None:
    update_entry = dict()  # {'timestamp': datetime.now()}
    if entry.text:
        if entry.text == "None":
            update_entry['text'] = None
        else:
            update_entry['text'] = entry.text
    if entry.title:
        if entry.title == "None":
            update_entry['title'] = None
        else:
            update_entry['title'] = entry.title
    if entry.url:
        if entry.url == "None":
            update_entry['url'] = None
        else:
            update_entry['url'] = entry.url

    if entry.media_file:
        old_entry = request.app.db['entries'].find_one({"_id":ObjectId(entry_id)})
        if delete := 'img' in old_entry and old_entry['img_id'] or 'video' in old_entry and old_entry['video_id']:
            cloudinary_response = destroy(delete)
            if cloudinary_response['result'] == "ok":
                print('deleted')
                update_entry['img'] = None
                update_entry['img_id'] = None
                update_entry['video'] = None
                update_entry['img_id'] = None

        if entry.media_file == "None":
            update_entry['img'] = None
            update_entry['img_id'] = None
            update_entry['video'] = None
            update_entry['img_id'] = None

        elif 'image' in guess_type(entry.media_file.filename)[0]:
            img = Image.open(entry.media_file.file)
            img = img.convert('RGB')
            exif = img.getexif()
            output_img = BytesIO()
            if exif:
                if 306 in exif:
                    update_entry['timestamp'] = datetime.strptime(exif[306], '%Y:%m:%d %H:%M:%S')
                img.getexif().clear()

            img.save(output_img,"JPEG")
            output_img.seek(0)
            result = upload(output_img)
            update_entry['img'] = result.get('url')
            update_entry['img_id'] = result.get('public_id')

        elif 'video' in guess_type(entry.media_file.filename)[0]:
            temp_file = NamedTemporaryFile(delete=False)
            output_file = NamedTemporaryFile(delete=False, suffix=".mp4")
            with temp_file as f:
                f.write(entry.media_file.file.read())
            (
                ffmpeg
                .input(temp_file.name)
                .output(output_file.name, map_metadata=-1)
                .run(overwrite_output=True)
            )
            result = upload(output_file.name, resource_type="video")
            update_entry['video'] = result.get('url')
            update_entry['video_id'] = result.get('public_id')

    if entry.group_painting:
        if entry.group_painting != "None":
            group_id = request.app.db['groups'].find_one({'name': entry.group_painting})['_id']
            update_entry['group_painting'] = ObjectId(group_id)
        else:
            update_entry['group_painting'] = None

    if entry.group_sequenz:
        if entry.group_sequenz != "None":
            group_id = request.app.db['groups'].find_one({'name': entry.group_sequenz})['_id']
            update_entry['group_sequenz'] = ObjectId(group_id)
        else:
            update_entry['group_sequenz'] = None

    if update_entry:
        request.app.db['entries'].update_one({"_id":ObjectId(entry_id)}, {"$set": update_entry})
    return
