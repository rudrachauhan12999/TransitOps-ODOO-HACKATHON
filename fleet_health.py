fleet_health.py
class FleetHealthService:


    def evaluate(self, vehicles):

        healthy = 0

        for vehicle in vehicles:

            if vehicle["status"] == "Operational":

                healthy += 1

        percentage = round(
            (healthy / len(vehicles)) * 100,
            2
        )

        return {

            "fleet_health": percentage,

            "message": "Fleet health calculated successfully"

        }


fleet_health_service = FleetHealthService()
