class FleetSummary:

    def summarize(self, vehicles):

        total = len(vehicles)

        operational = len([
            v for v in vehicles
            if v["status"] == "Operational"
        ])

        delayed = len([
            v for v in vehicles
            if v["status"] == "Delayed"
        ])

        return {

            "totalVehicles": total,

            "operational": operational,

            "delayed": delayed,

            "health": round((operational / total) * 100, 2)

        }


fleet_summary = FleetSummary()
