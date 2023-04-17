from dataclasses import dataclass
from pydantic import BaseModel, Field
from fastapi import Form, UploadFile
from bson import ObjectId
from typing import Optional,List
from enum import Enum
from datetime import datetime


@dataclass
class PostEntry:
    text: str = Form(None)
    img: UploadFile = Form(None)
    group_painting: str = Form(None)
    group_sequenz: str = Form(None)


class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError('invalid objectid')
        return str(v)

    @classmethod
    def __modify_schema__(cls,field_schema):
        field_schema.update(type='string')


class GroupTypes(str, Enum):
    painting = 'painting'
    sequenz = 'sequenz'


class MongoBaseModel(BaseModel):
    id:PyObjectId = Field(default_factory=PyObjectId, alias="_id")

    class Config:
        jsonable_encoder = {ObjectId:str}


class GetEntry(MongoBaseModel):
    text: Optional[str]
    img: Optional[str]
    timestamp: datetime
    group_painting: Optional[PyObjectId]
    group_sequenz: Optional[PyObjectId]


class GetGroup(MongoBaseModel):
    group_type: GroupTypes
    name: str


class GetOneGroup(MongoBaseModel):
    group_type: GroupTypes
    name: str
    members: List[PyObjectId]
    timestamp: datetime


class PostGroup(BaseModel):
    group_type: GroupTypes
    name: str


class LoginBase(BaseModel):
    username: str
    password: str


class UserBase(BaseModel):
    username:str
    password:str

