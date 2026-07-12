from fastapi import APIRouter

router = APIRouter(
    prefix="/drivers",
    tags=["Drivers"]
)

drivers = [

    {
        "id": "DRV-101",
        "name": "Rahul Sharma",
        "availability": "Busy"
    },

    {
        "id": "DRV-102",
        "name": "Priya Patel",
        "availability": "Available"
    }

]


@router.get("/")
def get_drivers():

    return drivers
