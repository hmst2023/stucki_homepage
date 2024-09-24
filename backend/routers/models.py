from dataclasses import dataclass
from pydantic import BaseModel, Field, BeforeValidator
from pydantic_core import core_schema
from fastapi import Form, UploadFile
from bson import ObjectId
from typing import Optional,List, Any, Callable, Annotated, Union
from enum import Enum
from datetime import datetime

PyObjectId = Annotated[str, BeforeValidator(str)]


class MongoBaseModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)


@dataclass
class PostEntry:
    title: str = Form(None)
    text: str = Form(None)
    url: str = Form(None)
    media_file: Union[str, UploadFile] = Form(None)
    group_painting: str = Form(None)
    group_sequenz: str = Form(None)


class PostEntry2(BaseModel):
    title: Optional[str] = None
    text: Optional[str] = None
    url: Optional[str] = None
    group_painting: Optional[str] = None
    group_sequenz: Optional[str] = None
    media_file: Optional[dict] = None


class GroupTypes(str, Enum):
    painting = 'painting'
    sequenz = 'sequenz'


class GetEntries(MongoBaseModel):
    title: Optional[str] = None
    text: Optional[str] = None
    img: Optional[str] = None
    video: Optional[str] = None
    url: Optional[str] = None
    timestamp: datetime
    group_painting: Optional[PyObjectId] = None
    group_sequenz: Optional[PyObjectId] = None


class GetSingleEntry(MongoBaseModel):
    title: Optional[str] = None
    text: Optional[str] = None
    img: Optional[str] = None
    video: Optional[str] = None
    url: Optional[str] = None
    timestamp: datetime
    group_painting: Optional[str] = None
    group_sequenz: Optional[str] = None
    group_painting_members:List[GetEntries] = None
    group_sequenz_members: List[GetEntries] = None


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
    email: str
    password: str


class UserBase(BaseModel):
    email:str
    password:str
