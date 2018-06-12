from flask import Flask, render_template, redirect
from datetime import datetime
# import pymongo
import os

# Initialize PyMongo to work with MongoDBs
# MONGODB_URI = os.environ.get('MONGODB_URI')
# client = pymongo.MongoClient(MONGODB_URI)

# Define database and collection
# db = client.get_default_database()
# collection = db.mars_scrape

# initialize Flask app
app = Flask(__name__)

@app.route('/')
def index(rerender=False):
    # data = collection.find_one()
    #extract table html from string
    # table = data['facts_table']
    #replace class and other style params to pickup bootstrap
    # table = table.replace('dataframe','table').replace('style="text-align: right;','style="text-align: center;')
    #print(type(data.facts_table))
    return render_template("index.html", data=data, table=table, rerender=rerender)

if __name__ == '__main__':
    app.run(debug=True, use_reloader=True)