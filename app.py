from flask import Flask,request,jsonify
from flask_cors import CORS

from ai_model import predict_route


app = Flask(__name__)

CORS(app)



@app.route("/")
def home():

    return "Transport Management Backend Running"



@app.route("/predict",methods=["POST"])

def prediction():

    data=request.json


    source=data["source"]

    destination=data["destination"]


    result=predict_route(
        source,
        destination
    )


    return jsonify({

        "route":result

    })



if __name__=="__main__":

    app.run(
        debug=True
    )
