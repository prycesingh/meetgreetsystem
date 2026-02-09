from pydantic import BaseModel


class DashboardMetrics(BaseModel):
    interviews: int
    average_score: float
    language_mix: dict[str, float]
    filler_rate: float
    scores_over_time: list[dict[str, float | str]]
