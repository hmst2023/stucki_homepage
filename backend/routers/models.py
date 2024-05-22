from dataclasses import dataclass
from pydantic import BaseModel, Field
from pydantic_core import core_schema
from fastapi import Form, UploadFile
from bson import ObjectId
from typing import Optional,List, Any, Callable, Annotated, Union
from enum import Enum
from datetime import datetime


@dataclass
class PostEntry:
    title: str = Form(None)
    text: str = Form(None)
    url: str = Form(None)
    media_file: Union[str, UploadFile] = Form(None)
    group_painting: str = Form(None)
    group_sequenz: str = Form(None)


class _ObjectIdPydanticAnnotation:
    # Based on https://docs.pydantic.dev/latest/usage/types/custom/#handling-third-party-types.

    @classmethod
    def __get_pydantic_core_schema__(
        cls,
        _source_type: Any,
        _handler: Callable[[Any], core_schema.CoreSchema],
    ) -> core_schema.CoreSchema:
        def validate_from_str(input_value: str) -> ObjectId:
            return ObjectId(input_value)

        return core_schema.union_schema(
            [
                # check if it's an instance first before doing any further work
                core_schema.is_instance_schema(ObjectId),
                core_schema.no_info_plain_validator_function(validate_from_str),
            ],
            serialization=core_schema.to_string_ser_schema(),
        )


PyObjectId = Annotated[
    ObjectId, _ObjectIdPydanticAnnotation
]


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


class MongoBaseModel(BaseModel):
    id:PyObjectId = Field(alias="_id")

    class Config:
        jsonable_encoder = {ObjectId:str}


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
