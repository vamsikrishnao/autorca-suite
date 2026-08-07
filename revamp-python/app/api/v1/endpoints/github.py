from fastapi import APIRouter
from app.models.domain import GitHubPRRequest, GitHubPRResult
from app.services.github_service import github_service

router = APIRouter(prefix="/github", tags=["GitHub Automation"])

@router.post("/pull-request", response_model=GitHubPRResult)
def create_pull_request(request: GitHubPRRequest):
    return github_service.create_pull_request(request)

@router.get("/pull-request/{pr_number}", response_model=GitHubPRResult)
def get_pr_status(pr_number: int):
    return github_service.get_pr_status(pr_number)
