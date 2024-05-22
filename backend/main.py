import os
from fastapi import FastAPI
from pymongo import MongoClient
import cloudinary
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from routers.entries import router as event_router
from routers.users import router as user_router
from routers.groups import router as group_router
from routers.media import router as media_router
from decouple import config
from setup import DEVELOPER_MODE
from contextlib import asynccontextmanager


if DEVELOPER_MODE:
    DB_URL = config('DB_URL', cast=str)
    DB_NAME = config('DB_NAME', cast=str)
    CLOUDINARY_CLOUD_NAME = config('CLOUDINARY_CLOUD_NAME', cast=str)
    CLOUDINARY_API_KEY = config('CLOUDINARY_API_KEY', cast=str)
    CLOUDINARY_API_SECRET = config('CLOUDINARY_API_SECRET', cast=str)
else:
    DB_URL = os.getenv("DB_URL")
    DB_NAME = os.getenv("DB_NAME")
    CLOUDINARY_CLOUD_NAME = os.getenv('CLOUDINARY_CLOUD_NAME')
    CLOUDINARY_API_KEY = os.getenv('CLOUDINARY_API_KEY')
    CLOUDINARY_API_SECRET = os.getenv('CLOUDINARY_API_SECRET')


cloudinary.config(
        cloud_name=CLOUDINARY_CLOUD_NAME,
        api_key=CLOUDINARY_API_KEY,
        api_secret=CLOUDINARY_API_SECRET,
        secure=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.client = MongoClient(DB_URL)
    app.db = app.client[DB_NAME]
    yield
    app.client.close()

app = FastAPI(lifespan=lifespan)

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"],
                   allow_headers=["*"])


app.include_router(event_router, prefix='/entries',tags=['entries'])
app.include_router(user_router, prefix='/users',tags=['users'])
app.include_router(group_router, prefix='/groups',tags=['group'])
app.include_router(media_router, prefix='/media',tags=['media'])


if DEVELOPER_MODE:
    if __name__ == "__main__":
        uvicorn.run(
            "main:app",
            host="0.0.0.0", port=8000,
            reload=True)

