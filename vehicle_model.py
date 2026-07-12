from pydantic import BaseModel


class Vehicle(BaseModel):

    id: str

    vehicle_type: str

    driver: str

    status: str

    fuel_level: int

    temperature: float

    location: str
