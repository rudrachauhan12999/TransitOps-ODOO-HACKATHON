class RouteOptimizer:


    def optimize(self, routes):

        shortest = min(
            routes,
            key=lambda route: route["distance"]
        )

        return {

            "recommended_route": shortest,

            "reason": "Shortest available distance"

        }


optimizer = RouteOptimizer()
