from pydantic import BaseModel


class Driver(BaseModel):

    id: str

    name: str

    license_number: str

    assigned_vehicle: str

    availability: str

    rating: float
