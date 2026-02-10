from fastapi import APIRouter

from app.schemas.common import ResultPayload, ResultResponse
from app.schemas.dashboard import DashboardMetrics

router = APIRouter(tags=["scoring"])


@router.post("/results", response_model=ResultResponse)
def submit_results(payload: ResultPayload) -> ResultResponse:
    """
    Persist scoring output for an interview.

    Integration notes:
    - Store per-answer scores alongside overall score.
    - Enable recalculation if scoring model changes.
    """
    return ResultResponse(result_id="rs-001", status="stored")


@router.get("/dashboard", response_model=DashboardMetrics)
def dashboard_metrics(from_date: str | None = None, to_date: str | None = None) -> DashboardMetrics:
    """
    Return aggregated metrics for the analytics dashboard.

    Edge cases:
    - Filter by date range and group-by settings.
    - Ensure consistent aggregation for offline-synced uploads.
    """
    return DashboardMetrics(
        interviews=0,
        average_score=0.0,
        language_mix={"en": 1.0},
        filler_rate=0.0,
        scores_over_time=[],
    )
