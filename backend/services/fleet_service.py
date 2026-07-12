class FleetService:


    def calculate_operational_status(
        self,
        vehicles
    ):


        active = 0


        for vehicle in vehicles:

            if vehicle["status"]=="Operational":

                active += 1



        percentage = (

            active / len(vehicles)

        ) * 100


        return {

            "operational_percentage":
            round(percentage,2)

        }



fleet_service = FleetService()
