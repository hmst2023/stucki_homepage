from fastapi import APIRouter, Depends, status, Body, HTTPException
from fastapi.responses import JSONResponse
from typing import List
from bson import ObjectId
from datetime import datetime
from .models import GetEntries, Group
from .authentification import Authorization
from access_db import database

router = APIRouter()
auth_handler = Authorization()


@router.get("/")
def get_test_entry(db=Depends(database)) -> List[Group]:
    groups = []
    for entry in db['groups'].find():
        groups.append(Group(**entry))
    return groups


@router.get("/{group_name}")
def list_by_group(group_name:str, db=Depends(database)) -> List[GetEntries]:
    group = db['groups'].find_one({'name': group_name})
    if not group:
        raise HTTPException(status_code=404, detail=f"Group with {group_name} not found")
    return [GetEntries(**entry) for entry in db['entries'].find({'group_sequenz': group['_id']})]


@router.post("/")
def post_new_group(db=Depends(database), group: Group = Body(...), user_id=Depends(auth_handler.auth_wrapper)) -> JSONResponse:
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
