from fastapi import APIRouter, Depends, status, Body, HTTPException
from fastapi.responses import JSONResponse
from typing import List
from .authentification import Authorization
from bson import ObjectId
from .models import GetGroup, PostGroup, GetOneGroup, GetEntries
from datetime import datetime
from access_db import database

router = APIRouter()
auth_handler = Authorization()


@router.get("/")
def get_test_entry(db=Depends(database)) -> List[GetGroup]:
    groups = []
    for entry in db['groups'].find():
        groups.append(GetGroup(**entry))
    return groups


@router.post("/")
def post_new_group(db=Depends(database), group: PostGroup = Body(...), user_id=Depends(auth_handler.auth_wrapper)) -> JSONResponse:
    if not (db['groups'].find_one({'name': group.name})):
        new_group = db['groups'].insert_one({
            'name': group.name,
            'group_type': group.group_type,
            'members': [],
            'timestamp': datetime.now()
        })
        msg_group_creation = db['groups'].find_one({"_id": new_group.inserted_id})
    else:
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content="group already exists")

    return JSONResponse(status_code=status.HTTP_201_CREATED, content=str(msg_group_creation))


@router.get("/{group_type}/{group_id}", response_description="Get a single Group")
def get_entries_from_single_group(group_type:str, group_id: str, db=Depends(database)) -> List[GetEntries]:
    group = db['entries'].find({'group_'+group_type: ObjectId(group_id)})
    if group:
        return_value = []
        for entry in group:
            return_value.append(GetEntries(**entry))
        return return_value
    raise HTTPException(status_code=404, detail=f"Group with {group_id} not found")


@router.delete("/{group_id}", response_description="delete a group")
def delete_single_group(group_id: str, db=Depends(database), user_id=Depends(auth_handler.auth_wrapper)) -> JSONResponse:
    if group := db['groups'].find_one({"_id": ObjectId(group_id)}):
        if group['members']:
            raise HTTPException(status_code=406, detail=f"Group not empty")
        else:
            msg = db['groups'].delete_one({"_id": ObjectId(group_id)})
            return JSONResponse(status_code=status.HTTP_200_OK, content=f"Deleted {str(msg.deleted_count)} Group")
    raise HTTPException(status_code=404, detail=f"Group with {group_id} not found")
