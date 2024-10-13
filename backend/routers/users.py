from fastapi import APIRouter, Body, HTTPException, Depends
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from bson.objectid import ObjectId
from cloudinary.utils import sign_request
from .authentification import Authorization
from .models import LoginBase
from access_db import database

router = APIRouter()
auth_handler = Authorization()


@router.post('/login', response_description='login user')
def login(db=Depends(database), login_user: LoginBase = Body(...)):
    msg_collection = db['Users']
    user = msg_collection.find_one({'email': login_user.email})
    if (user is None) or (not auth_handler.verify_password(login_user.password, user['password'])):
        raise HTTPException(status_code=401, detail='wrong password')
    token = auth_handler.encode_token(str(user["_id"]))
    response = JSONResponse(content={"token":token})
    return response


@router.get('/refreshToken')
async def refresh_token(db=Depends(database), user_id=Depends(auth_handler.auth_wrapper)) -> JSONResponse:
    db_user = db['Users']
    user = db_user.find_one({'_id':ObjectId(user_id)})
    token = auth_handler.encode_token(str(user['_id']))
    return JSONResponse(content={"token": token})

#
# @router.post('/register', response_description='Register user')
# def register(new_user:LoginBase = Body(...), db=Depends(database)):
#     new_user.password = auth_handler.get_password_hash(new_user.password)
#     msg_collection = db['Users']
#     new_user = jsonable_encoder(new_user)
#     user = msg_collection.insert_one(new_user)
#     created_user = msg_collection.find_one({"_id": user.inserted_id})
#     return JSONResponse(content=str(created_user))


@router.post('/signature')
def get_cloudinary_signature(params_to_sign: dict, user_id=Depends(auth_handler.auth_wrapper), db=Depends(database)) -> dict:
    db_user = db['Users']
    user = db_user.find_one({'_id':ObjectId(user_id)})
    if user:
        signature = sign_request(params_to_sign, dict())
        return signature
    raise HTTPException(status_code=404, detail='no user')
