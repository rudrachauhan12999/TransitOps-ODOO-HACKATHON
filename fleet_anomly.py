class FleetAnomalyDetector:


    def detect(self,vehicle):


        alerts=[]


        if vehicle["temperature"] > 90:

            alerts.append(

                "Temperature threshold exceeded"

            )


        if vehicle["fuel"] < 20:

            alerts.append(

                "Low fuel warning"

            )


        return alerts
