from datetime import datetime


class AlertService:

    def generate_alert(self, vehicle):

        alerts = []

        if vehicle.get("temperature", 0) > 90:
            alerts.append({
                "type": "Temperature",
                "severity": "High",
                "message": f"{vehicle['id']} exceeded temperature limit.",
                "time": datetime.utcnow().isoformat()
            })

        if vehicle.get("fuel", 100) < 20:
            alerts.append({
                "type": "Fuel",
                "severity": "Medium",
                "message": f"{vehicle['id']} has low fuel.",
                "time": datetime.utcnow().isoformat()
            })

        return alerts


alert_service = AlertService()
