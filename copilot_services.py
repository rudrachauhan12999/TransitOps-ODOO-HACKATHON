class CopilotService:


    def generate_response(
        self,
        query
    ):


        query=query.lower()


        if "delay" in query:


            return {

                "analysis":
                "Traffic congestion detected",

                "recommendation":
                "Dispatch backup vehicle"

            }


        if "vehicle" in query:


            return {

                "analysis":
                "Fleet status retrieved",

                "recommendation":
                "Monitor critical vehicles"

            }


        return {

            "analysis":
            "No critical issues found",

            "recommendation":
            "Continue monitoring"

        }
