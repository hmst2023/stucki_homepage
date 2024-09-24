from pymongo import MongoClient
from decouple import config

DB_URL = config('DB_URL', cast=str)
DB_NAME = config('DB_NAME', cast=str)


def database():
    client = MongoClient(DB_URL)
    return client[DB_NAME]
