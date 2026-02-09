from fastapi import FastAPI

from app.api.interview import router as interview_router
from app.api.scoring import router as scoring_router
from app.api.upload import router as upload_router

app = FastAPI(title="Meet & Greet Evaluation API")

app.include_router(upload_router, prefix="/api")
app.include_router(interview_router, prefix="/api")
app.include_router(scoring_router, prefix="/api")


@app.get("/healthz")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
