import random



def predict_route(source,destination):


    routes=[

        "Route A - Minimum Traffic",

        "Route B - Fastest Route",

        "Route C - Fuel Efficient Route",

        "Route D - Highway Route"

    ]


    # Future:
    # Use ML model here
    # Traffic prediction
    # GPS data
    # Weather data
    # Vehicle data


    best_route=random.choice(routes)



    return (

        best_route+
        " from "
        +source+
        " to "
        +destination

    )
