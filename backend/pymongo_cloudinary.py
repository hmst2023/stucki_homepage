from fastapi import FastAPI
from pymongo import MongoClient
import cloudinary
from fastapi.middleware.cors import CORSMiddleware
from routers.entries import router as event_router
from routers.users import router as user_router
from routers.groups import router as group_router
import uvicorn


cloudinary.config(
        cloud_name="***REMOVED***",
        api_key="***REMOVED***",
        api_secret="***REMOVED***",
        secure=True
    )
app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"],
                   allow_headers=["*"])

app.include_router(event_router, prefix='/entries',tags=['entries'])
app.include_router(user_router, prefix='/users',tags=['users'])
app.include_router(group_router, prefix='/groups',tags=['group'])


@app.on_event("startup")
def startup():
    app.client = MongoClient('***REMOVED***')
    DB = "homepage"
    app.db = app.client[DB]


@app.on_event("shutdown")
async def shutdown():
    app.client.close()


if __name__ == "__main__":
    uvicorn.run(
        "pymongo_cloudinary:app",
        host="0.0.0.0", port=8000,
        reload=True)

