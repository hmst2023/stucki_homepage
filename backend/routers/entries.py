from io import BytesIO
from fastapi import APIRouter, Depends, status, Body, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from cloudinary.uploader import upload, destroy
from PIL import Image, ImageOps
from datetime import datetime
from typing import Optional, List
from .authentification import Authorization
from .models import PostEntry, GetEntry, PostGroup
from bson import ObjectId


router = APIRouter()
auth_handler = Authorization()


@router.post("/")
def post_new_entry(request:Request, entry: PostEntry = Depends()) -> JSONResponse:
    if all(i is None for i in (entry.img, entry.text)):
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content='empty request')

    database_entry = {'timestamp': datetime.now()}

    if entry.text:
        database_entry['text'] = entry.text

    if entry.img:
        img = Image.open(entry.img.file)
        exif = img.getexif()
        output_img = BytesIO()

        if exif:
            database_entry['timestamp'] = datetime.strptime(exif[306], '%Y:%m:%d %H:%M:%S')
            img.getexif().clear()

        img.save(output_img,"JPEG")
        output_img.seek(0)
        result = upload(output_img)
        print(result)
        database_entry['img'] = result.get('url')
        database_entry['img_id'] = result.get('public_id')

    new_msg = request.app.db['entries'].insert_one(database_entry)

    if entry.group_painting:
        group_id = request.app.db['groups'].find_one({'name': entry.group_painting})['_id']
        request.app.db['groups'].update_one({"_id": group_id},{'$push':{'members': new_msg.inserted_id}})
        request.app.db['groups'].find_one({"_id": group_id})
        request.app.db['entries'].update_one({"_id": new_msg.inserted_id}, {
            '$set': {'group_painting': group_id}})

    if entry.group_sequenz:
        group_id = request.app.db['groups'].find_one({'name': entry.group_sequenz})['_id']
        request.app.db['groups'].update_one({"_id": group_id},{'$push':{'members': new_msg.inserted_id}})
        request.app.db['groups'].find_one({"_id": group_id})
        request.app.db['entries'].update_one({"_id": new_msg.inserted_id}, {
            '$set': {'group_sequenz': group_id}})

    created_msg = request.app.db['entries'].find_one({"_id": new_msg.inserted_id})
    return JSONResponse(status_code=status.HTTP_201_CREATED, content=str(created_msg))


@router.get("/")
def get_test_entry(request:Request) -> List[GetEntry]:
    entries = []
    for entry in request.app.db['entries'].find():
        entries.append(GetEntry(**entry))
    return entries


@router.get("/{entry_id}", response_description="Get a single entry")
def show_single_entry(entry_id: str, request: Request) -> GetEntry:
    entry = request.app.db['entries'].find_one({"_id": ObjectId(entry_id)})
    if entry:
        return GetEntry(**entry)
    raise HTTPException(status_code=404, detail=f"Entry with {entry_id} not found")


@router.delete("/{entry_id}", response_description="delete a single entry")
def delete_single_entry(entry_id:str, request: Request) -> JSONResponse:
    modified_arrays = 0
    deleted_pics = 0
    if entry := request.app.db['entries'].find_one({"_id": ObjectId(entry_id)}):
        if 'group_painting' in entry:
            msg = request.app.db['groups'].update_one({"_id": entry['group_painting']},
                                                      {'$pull':{'members':ObjectId(entry_id)}})
            modified_arrays += msg.modified_count

        if 'group_sequenz' in entry:
            msg = request.app.db['groups'].update_one({"_id": entry['group_sequenz']},
                                                      {'$pull':{'members': ObjectId(entry_id)}})
            modified_arrays += msg.modified_count

        if 'img' in entry:
            cloudinary_response = destroy(entry['img_id'])
            if cloudinary_response['result'] == "ok":
                deleted_pics += 1

        msg = request.app.db['entries'].delete_one({"_id": ObjectId(entry_id)})

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content=f"Deleted {str(msg.deleted_count)} Entry and {deleted_pics} pics "
                    f"and modified { str(modified_arrays)} Groups"
        )

    raise HTTPException(status_code=404, detail=f"Entry with {entry_id} not found")
