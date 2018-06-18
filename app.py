from flask import Flask, render_template, jsonify
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func

# Database Setup
DB_PATH = "sqlite:///static/data/belly_button_biodiversity.sqlite"

def connector(DB_PATH, TABLE):
    '''
    Connects to sqlitedb
    '''
    engine = create_engine(DB_PATH)

    # reflect an existing database into a new model
    Base = automap_base()

    # reflect the tables
    Base.prepare(engine, reflect=True)

    # Create our session (link) from Python to the DB
    session = Session(engine)

    return Base.classes[TABLE], session

# Save reference to the table
# OTU = connector(DB_PATH, 'otu')
# OTU = Base.classes.otu
# Samples = Base.classes.samples
# SM = Base.classes.samples_metadata



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
    Samples, session = connector(DB_PATH, 'samples')
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
    OTU, session = connector(DB_PATH, 'otu')
    return jsonify(session.query(OTU.lowest_taxonomic_unit_found).distinct().all())

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
    SM, session = connector(DB_PATH, 'samples_metadata')
    try:
        for p in params:
            res[p] = session.query(SM.__table__.c[p])\
                                   .filter(SM.SAMPLEID==sample[3:])\
                                   .all()[0][0]
    except Exception as e:
        res['Exception'] = e.__doc__
   
    return jsonify(res)
    

@app.route('/wfreq/<sample>')
def wfreq(sample):
    """Weekly Washing Frequency as a number.

    Args: Sample in the format: `BB_940`

    Returns an integer value for the weekly washing frequency `WFREQ`
    """
    res = {}
    SM, session = connector(DB_PATH, 'samples_metadata')
    try:
        return jsonify(
            session.query(SM.WFREQ)\
                .filter(SM.SAMPLEID==sample[3:])\
                .all()[0][0]
        ) 

    except Exception as e:
        return jsonify({'Exception':e.__doc__})
    

@app.route('/samples/<sample>')
def samples(sample):
    """OTU IDs and Sample Values for a given sample.

    Returns a list of dictionaries containing sorted lists  for `otu_ids`
    and `sample_values` by Sample Value.

    [
        {
            otu_ids: [
                1166,
                2858,
                481,
                ...
            ],
            sample_values: [
                163,
                126,
                113,
                ...
            ]
        }
    ]
    """
    
    Samples, session = connector(DB_PATH, 'samples')

    

    try:
        # the query below is the same as
        # select samples.otu_id o, samples.BB_1233 s from samples order by s desc;
        res = session.query(
                Samples.otu_id, getattr(Samples, sample))\
                .order_by(getattr(Samples, sample).desc()\
            )
        return jsonify([
            {'otu_ids':[r[0] for r in res]},
            {'sample_values': [r[1] for r in res]}
        ])
    except Exception as e:
        return jsonify({'Exception':e.__doc__})
    

if __name__ == '__main__':
    app.run(debug=True, use_reloader=True)