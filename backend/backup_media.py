import httpx
import paramiko, io
from bson.json_util import dumps
import json
from pymongo import MongoClient
from decouple import config
import datetime

DB_URL = config('DB_URL', cast=str)
DB_NAME = config('DB_NAME', cast=str)
FTP_URL = config('FTP_URL', cast=str)
FTP_LOGIN = config('FTP_LOGIN', cast=str)
FTP_PASSWORD = config('FTP_PASSWORD', cast=str)

client = MongoClient(DB_URL)
db = client[DB_NAME]
collection = 'entries'
ftp_client = paramiko.SSHClient()
ftp_client.load_system_host_keys()


ftp_client.connect(FTP_URL,port=22, username=FTP_LOGIN, password=FTP_PASSWORD)
sftp = ftp_client.open_sftp()

all_entries = db[collection].find().sort("timestamp", -1)

for entry in all_entries:
    for media in ['img', 'video']:
        if media in entry and entry[media] is not None and f'{media}_backup' not in entry:
            print(f'creating backup for{entry}')
            filepath = f'mediabackup/{media}/{entry[media].split('/')[-1]}'
            r = httpx.get(entry[media])
            sftp.putfo(io.BytesIO(r.content), filepath)
            with open(filepath, 'wb') as f:
                f.write(r.content)
            db[collection].update_one({'_id': entry['_id']}, {"$set": {f'{media}_backup': 'https://stucki.cc/'+filepath}})

cursor = db[collection].find({})
with open(f'databackup/entries_{datetime.datetime.now().date()}.json', 'w') as file:
    json.dump(json.loads(dumps(cursor)), file)

cursor = db['groups'].find({})
with open(f'databackup/groups_{datetime.datetime.now().date()}.json', 'w') as file:
    json.dump(json.loads(dumps(cursor)), file)