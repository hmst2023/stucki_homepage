from pydantic import BaseModel, Field, BeforeValidator
from typing import Optional,List, Annotated
from enum import Enum
from datetime import datetime

PyObjectId = Annotated[str, BeforeValidator(str)]


class MongoBaseModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)


class PostEntry(BaseModel):
    title: Optional[str] = None
    text: Optional[str] = None
    url: Optional[str] = None
    url2: Optional[str] = None
    material: Optional[dict] = None
    group_painting: Optional[str] = Field(alias='groupPainting', default=None)
    group_sequenz: Optional[str] = Field(alias='groupSequenz', default=None)
    media_file: dict | str = None


class GroupTypes(str, Enum):
    painting = 'painting'
    sequenz = 'sequenz'


class GetEntries(MongoBaseModel):
    title: Optional[str] = None
    text: Optional[str] = None
    img: Optional[str] = None
    video: Optional[str] = None
    url: Optional[str] = None
    url2: Optional[str] = None
    material: Optional[list] = None
    timestamp: datetime
    group_painting: Optional[PyObjectId] = None
    group_sequenz: Optional[PyObjectId] = None


class GetSingleEntry(MongoBaseModel):
    title: Optional[str] = None
    text: Optional[str] = None
    img: Optional[str] = None
    video: Optional[str] = None
    url: Optional[str] = None
    url2: Optional[str] = None
    material: Optional[list] = None
    timestamp: datetime
    group_painting: Optional[str] = None
    group_sequenz: Optional[str] = None
    group_painting_members:List[GetEntries] = None
    group_sequenz_members: List[GetEntries] = None


class Group(MongoBaseModel):
    group_type: GroupTypes
    name: str


class LoginBase(BaseModel):
    email: str
    password: str

