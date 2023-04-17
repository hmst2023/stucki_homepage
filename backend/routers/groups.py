from fastapi import APIRouter, Depends, status, Body, HTTPException, Request
from fastapi.responses import JSONResponse
from typing import Optional, List
from .authentification import Authorization
from bson import ObjectId
from .models import GetGroup, PostGroup, GetOneGroup
from datetime import datetime


router = APIRouter()
auth_handler = Authorization()


@router.get("/")
def get_test_entry(request:Request) -> List[GetGroup]:
    groups = []
    for entry in request.app.db['groups'].find():
        groups.append(GetGroup(**entry))
    print(groups)
    return groups


@router.post("/")
def post_new_entry(request:Request, group: PostGroup = Body(...)) -> JSONResponse:
    if not (request.app.db['groups'].find_one({'name': group.name})):
        new_group = request.app.db['groups'].insert_one({'name': group.name,
                                                         'group_type': group.group_type,
                                                         'members': [],
                                                         'timestamp': datetime.now()})
        msg_group_creation = request.app.db['groups'].find_one({"_id": new_group.inserted_id})
    else:
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content="group already exists")

    return JSONResponse(status_code=status.HTTP_201_CREATED, content=str(msg_group_creation))


@router.get("/{group_id}", response_description="Get a single Group")
def show_single_group(group_id: str, request: Request) -> GetOneGroup:
    group = request.app.db['groups'].find_one({"_id": ObjectId(group_id)})
    if group:
        return GetOneGroup(**group)
    raise HTTPException(status_code=404, detail=f"Group with {group_id} not found")


@router.delete("/{group_id}", response_description="delete a ")
def delete_single_group(group_id: str, request: Request) -> JSONResponse:
    if group := request.app.db['groups'].find_one({"_id": ObjectId(group_id)}):
        if group['members']:
            raise HTTPException(status_code=406, detail=f"Group not empty")
        else:
            msg = request.app.db['groups'].delete_one({"_id": ObjectId(group_id)})
            return JSONResponse(status_code=status.HTTP_200_OK, content=f"Deleted {str(msg.deleted_count)} Group")
    raise HTTPException(status_code=404, detail=f"Group with {group_id} not found")
