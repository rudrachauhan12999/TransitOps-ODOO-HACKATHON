class OperationsCopilot:

    def __init__(self):
        self.name = "TransitOps AI Copilot"

    def greet(self):
        return f"{self.name} initialized successfully."

if __name__ == "__main__":
    agent = OperationsCopilot()
    print(agent.greet())
