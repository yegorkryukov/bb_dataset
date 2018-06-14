from flask import Flask, render_template, jsonify
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func
import json

# Database Setup
engine = create_engine("sqlite:///static/data/belly_button_biodiversity.sqlite")

# reflect an existing database into a new model
Base = automap_base()

# reflect the tables
Base.prepare(engine, reflect=True)

# Save reference to the table
OTU = Base.classes.otu
Samples = Base.classes.samples
SM = Base.classes.samples_metadata

# Create our session (link) from Python to the DB
session = Session(engine)

# initialize Flask app
app = Flask(__name__)

@app.route('/')
def index():
    return render_template("index.html")

@app.route('/names')
def names():
    """
    List of sample names.

    Returns a list of sample names in the format
    [
        "BB_940",
        "BB_941",
        "BB_943",
        "BB_944",
        "BB_945",
        "BB_946",
        "BB_947",
        ...
    ]
    """
    return jsonify([c.key for c in Samples.__table__.c][1:])

@app.route('/otu')
def otu():
    """List of OTU descriptions.

    Returns a list of OTU descriptions in the following format

    [
        "Archaea;Euryarchaeota;Halobacteria;Halobacteriales;Halobacteriaceae;Halococcus",
        "Archaea;Euryarchaeota;Halobacteria;Halobacteriales;Halobacteriaceae;Halococcus",
        "Bacteria",
        "Bacteria",
        "Bacteria",
        ...
    ]
    """
    return jsonify(session.query(OTU.lowest_taxonomic_unit_found)\
                   .distinct().all())

@app.route('/metadata/<sample>')
def meta(sample):
    """MetaData for a given sample.

    Args: Sample in the format: `BB_940`

    Returns a json dictionary of sample metadata in the format

    {
        AGE: 24,
        BBTYPE: "I",
        ETHNICITY: "Caucasian",
        GENDER: "F",
        LOCATION: "Beaufort/NC",
        SAMPLEID: 940
    }
    """
    params = ['AGE','BBTYPE','ETHNICITY','GENDER','LOCATION','SAMPLEID']
    res = {}
    for p in params:
        res[p] = session.query(SM.__table__.c[p]).filter(SM.SAMPLEID==sample[3:]).all()[0][0]
    return jsonify(res)

if __name__ == '__main__':
    app.run(debug=True, use_reloader=True)