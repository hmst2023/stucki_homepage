from fastapi import APIRouter, Depends, status, HTTPException, Request
from fastapi.responses import JSONResponse
from .authentification import Authorization
from cloudinary.uploader import destroy
from bson import ObjectId
from access_db import database

router = APIRouter()
auth_handler = Authorization()


@router.delete("/{media_id}/{media_type}", response_description="delete a single media")
def delete_single_entry(media_id:str, media_type:str, user_id=Depends(auth_handler.auth_wrapper),
                        db=Depends(database)) -> JSONResponse:
    if not db['Users'].find_one({"_id": ObjectId(user_id)}):
        raise HTTPException(status_code=404, detail=f"User not found")
    cloudinary_response = destroy(media_id,resource_type=media_type)
    if cloudinary_response['result'] == "ok":
        return JSONResponse(status_code=status.HTTP_200_OK, content="Deleted")
    raise HTTPException(status_code=404, detail=f"Entry with {media_id} not found")
