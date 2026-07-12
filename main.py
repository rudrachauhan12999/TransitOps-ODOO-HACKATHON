from fastapi import FastAPI

app = FastAPI(
    title="TransitOps AI",
    version="1.0.0"
)

@app.get("/")
async def home():
    return {
        "project": "TransitOps AI",
        "status": "Backend Running",
        "message": "Welcome to TransitOps Backend"
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy"
    }
