from fastapi import APIRouter, Depends, status, HTTPException
from fastapi.responses import JSONResponse
from cloudinary.uploader import destroy
from datetime import datetime
from typing import List
from bson import ObjectId
from .authentification import Authorization
from .models import PostEntry, GetSingleEntry, GetEntries
from access_db import database


router = APIRouter()
auth_handler = Authorization()


@router.post("/")
def post_reworked(entry:PostEntry, user_id=Depends(auth_handler.auth_wrapper), db=Depends(database)):
    if all(i is None for i in (entry.media_file, entry.text)):
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content='empty request')

    database_entry = {'timestamp': datetime.now()}
    if entry.title:
        database_entry['title'] = entry.title

    if entry.text:
        database_entry['text'] = entry.text

    if entry.url:
        database_entry['url'] = entry.url

    if entry.url2:
        database_entry['url2'] = entry.url2

    if entry.material:
        database_entry['material'] = [i for i,j in entry.material.items() if j]

    if entry.media_file:
        if entry.media_file['resource_type'] == 'image':
            database_entry['img'] = entry.media_file['secure_url']
            database_entry['img_id'] = entry.media_file['public_id']
        if entry.media_file['resource_type'] == 'video':
            database_entry['video'] = entry.media_file['secure_url']
            database_entry['video_id'] = entry.media_file['public_id']

    new_msg = db['entries'].insert_one(database_entry)

    if entry.group_painting:
        group_id = db['groups'].find_one({'name': entry.group_painting})['_id']
        db['groups'].find_one({"_id": group_id})
        db['entries'].update_one({"_id": new_msg.inserted_id}, {
            '$set': {'group_painting': group_id}})

    if entry.group_sequenz:
        group_id = db['groups'].find_one({'name': entry.group_sequenz})['_id']
        db['groups'].find_one({"_id": group_id})
        db['entries'].update_one({"_id": new_msg.inserted_id}, {
            '$set': {'group_sequenz': group_id}})

    created_msg = db['entries'].find_one({"_id": new_msg.inserted_id})
    return JSONResponse(status_code=status.HTTP_201_CREATED, content=str(created_msg))


@router.get("/")
def get_all_entries(db=Depends(database)) -> List[GetEntries]:
    entries = []
    collected_paintings = []
    for entry in db['entries'].find().sort("timestamp",-1):
        if 'group_painting' in entry:
            if entry['group_painting'] in collected_paintings:
                continue
            else:
                collected_paintings.append(entry['group_painting'])
        entries.append(GetEntries(**entry))
    return entries


@router.get("/material/{material}")
def list_entries_by_material(material:str, db=Depends(database)) -> List[GetEntries]:
    return [GetEntries(**entry) for entry in db['entries'].find({'material':material}).sort("timestamp",-1)]


@router.get("/{entry_id}", response_description="Get a single entry")
def show_single_entry(entry_id: str, db=Depends(database)) -> GetSingleEntry:
    entry = db['entries'].find_one({"_id": ObjectId(entry_id)})
    if entry:
        collected_entries = []
        if 'group_painting' in entry and entry['group_painting'] is not None:
            group = db['entries'].find({'group_painting': ObjectId(entry['group_painting'])}).sort("timestamp",-1)
            painting_members = []
            for group_member in group:
                if group_member['_id'] != entry['_id']:
                    painting_members.append(GetEntries(**group_member))
                    collected_entries.append(group_member['_id'])
            entry['group_painting_members'] = painting_members
            group_from_db = db['groups'].find_one({'_id': ObjectId(entry['group_painting'])})
            entry['group_painting'] = group_from_db['name']

        if 'group_sequenz' in entry and entry['group_sequenz'] is not None:
            group = db['entries'].find({'group_sequenz': ObjectId(entry['group_sequenz'])}).sort("timestamp",-1)
            sequenz_members = []
            for group_member in group:
                if group_member['_id'] != entry['_id'] and group_member['_id'] not in collected_entries:
                    sequenz_members.append(GetEntries(**group_member))
            entry['group_sequenz_members'] = sequenz_members
            group_from_db = db['groups'].find_one({'_id': ObjectId(entry['group_sequenz'])})
            entry['group_sequenz'] = group_from_db['name']

        return GetSingleEntry(**entry)
    raise HTTPException(status_code=404, detail=f"Entry with {entry_id} not found")


@router.delete("/{entry_id}", response_description="delete a single entry")
def delete_single_entry(entry_id:str, user_id=Depends(auth_handler.auth_wrapper), db=Depends(database)) -> JSONResponse:
    modified_arrays = 0
    deleted_pics = 0
    if entry := db['entries'].find_one({"_id": ObjectId(entry_id)}):
        if 'img' in entry and entry['img'] is not None:
            cloudinary_response = destroy(entry['img_id'])
            if cloudinary_response['result'] == "ok":
                deleted_pics += 1

        msg = db['entries'].delete_one({"_id": ObjectId(entry_id)})

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content=f"Deleted {str(msg.deleted_count)} Entry and {deleted_pics} pics "
                    f"and modified { str(modified_arrays)} Groups")

    raise HTTPException(status_code=404, detail=f"Entry with {entry_id} not found")


@router.patch("/{entry_id}", response_description="patch an entry")
def patch_entry(entry_id: str, entry:PostEntry, user_id=Depends(auth_handler.auth_wrapper),
                db=Depends(database)) -> None:
    update_entry = dict()
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

    if entry.url2:
        if entry.url2 == "None":
            update_entry['url2'] = None
        else:
            update_entry['url2'] = entry.url2

    if entry.material:
        update_entry['material'] = [i for i,j in entry.material.items() if j]

    if entry.media_file:
        old_entry = db['entries'].find_one({"_id":ObjectId(entry_id)})
        if delete := ('img' in old_entry and old_entry['img_id']) or ('video' in old_entry and old_entry['video_id']):
            cloudinary_response = destroy(delete)
            if cloudinary_response['result'] == "ok":
                update_entry['img'] = None
                update_entry['img_id'] = None
                update_entry['video'] = None
                update_entry['video_id'] = None

        if entry.media_file == "None":
            update_entry['img'] = None
            update_entry['img_id'] = None
            update_entry['video'] = None
            update_entry['video_id'] = None
        else:
            if entry.media_file['resource_type'] == 'image':
                update_entry['img'] = entry.media_file['secure_url']
                update_entry['img_id'] = entry.media_file['public_id']
            if entry.media_file['resource_type'] == 'video':
                update_entry['video'] = entry.media_file['secure_url']
                update_entry['video_id'] = entry.media_file['public_id']

    if entry.group_painting:
        if entry.group_painting != "None":
            group_id = db['groups'].find_one({'name': entry.group_painting})['_id']
            update_entry['group_painting'] = ObjectId(group_id)
        else:
            update_entry['group_painting'] = None

    if entry.group_sequenz:
        if entry.group_sequenz != "None":
            group_id = db['groups'].find_one({'name': entry.group_sequenz})['_id']
            update_entry['group_sequenz'] = ObjectId(group_id)
        else:
            update_entry['group_sequenz'] = None
    print(update_entry)
    if update_entry:
        db['entries'].update_one({"_id":ObjectId(entry_id)}, {"$set": update_entry})
    return
