from pymongo import MongoClient
from pymongo.server_api import ServerApi

uri = "mongodb+srv://connectsakshi16_db_user:Root1234@leadgeneration.plwizde.mongodb.net/?appName=LeadGeneration"

client = MongoClient(uri, server_api=ServerApi('1'))

try:
    client.admin.command('ping')
    print("SUCCESS! Connected to MongoDB!")
except Exception as e:
    print("Error:", e)