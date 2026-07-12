class RecommendationEngine:


    def generate(
        self,
        issue
    ):


        recommendations = {


            "delay":
            "Dispatch backup vehicle and optimize route",


            "temperature":
            "Inspect vehicle cooling system",


            "fuel":
            "Schedule immediate refueling"

        }


        for key,value in recommendations.items():

            if key in issue.lower():

                return value



        return "Continue monitoring operation"



recommendation_engine = RecommendationEngine()
