from dataclasses import dataclass
from fastapi import Depends, FastAPI, Form, UploadFile, HTTPException, Body, status
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from pymongo import MongoClient
from typing import Optional
from cloudinary.uploader import upload
import cloudinary
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from authentification import Authorization

cloudinary.config(
        cloud_name="***REMOVED***",
        api_key="***REMOVED***",
        api_secret="***REMOVED***",
        secure=True
    )
app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"],
                   allow_headers=["*"])

auth_handler = Authorization()


@app.on_event("startup")
def startup():
    app.client = MongoClient('***REMOVED***')
    DB = "testfeld"
    app.db = app.client[DB]


@app.on_event("shutdown")
async def shutdown():
    app.client.close()


@dataclass
class SimpleTest:
    text: str = Form(...)
    img: UploadFile = Form(None)


class SendEntry(BaseModel):
    url: Optional[str]
    text:str


class LoginBase(BaseModel):
    username: str
    password: str


class UserBase(BaseModel):
    username:str
    password:str


@app.post("/")
def post_new_entry(entry: SimpleTest = Depends()):
    test = {'text': entry.text}
    if entry.img:
        result = upload(entry.img.file)
        test['url'] = result.get('url')
    app.db['entries'].insert_one(test)
    return entry


@app.get("/")
def get_test_entry():
    entries = []
    for entry in app.db['entries'].find():
        entries.append(SendEntry(**entry))
    return entries


# for testing depends
# async def common_parameters(q: str, skip: int = 0, limit: int = 100):
#     if q=="hello":
#         return "Not authentivatd"
#     return {"q": q, "skip": skip, "limit": limit}
#
#
# @app.get("/testung")
# def tryout_depends(test: dict = Depends(common_parameters)):
#     token = auth_handler.encode_token("123")
#     print(token)
#     return test

@app.get("/testung2", dependencies=[Depends(auth_handler.auth_wrapper)])
def tryout_depends():
    print(auth_handler.encode_token("hello"))
    return "blubb"

@app.get("/actual_token")
def tryout_depends():
    print(auth_handler.encode_token("my_name_is"))
    return
# end testing depends


@app.post('/login', response_description='login user')
def login(login_user: LoginBase = Body(...)):
    msg_collection = app.db['Users']
    user = msg_collection.find_one({'username': login_user.username})
    if (user is None) or (not auth_handler.verify_password(login_user.password, user['password'])):
        raise HTTPException(status_code=401, detail='wrong password')
    token = auth_handler.encode_token(str(user["_id"]))
    response = JSONResponse(content={"token":token})
    return response

# @app.post('/register', response_description='Register user')
# def register(new_user:UserBase = Body(...)):
#     new_user.password = auth_handler.get_password_hasch(new_user.password)
#     msg_collection = app.db['Users']
#     new_user = jsonable_encoder(new_user)
#     user = msg_collection.insert_one(new_user)
#     created_user = msg_collection.find_one({"_id": user.inserted_id})
#     return JSONResponse(status_code=status.HTTP_201_CREATED, content=str(created_user))


if __name__ == "__main__":
    uvicorn.run(
        "pymongo_cloudinary:app",
        host="0.0.0.0", port=8000,
        reload=True)

