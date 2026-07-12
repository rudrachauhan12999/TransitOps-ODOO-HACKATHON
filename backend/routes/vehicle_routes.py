from fastapi import APIRouter


router = APIRouter(
    prefix="/vehicles",
    tags=["Vehicles"]
)



vehicles = [

    {
        "id":"BUS-101",
        "status":"Operational",
        "fuel":85
    },

    {
        "id":"BUS-102",
        "status":"Delayed",
        "fuel":45
    }

]



@router.get("/")
def get_vehicles():

    return vehicles



@router.get("/{vehicle_id}")
def get_vehicle(vehicle_id:str):

    for vehicle in vehicles:

        if vehicle["id"] == vehicle_id:

            return vehicle


    return {
        "message":"Vehicle not found"
    }
