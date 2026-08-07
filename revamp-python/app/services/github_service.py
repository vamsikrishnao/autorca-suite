import uuid
from app.models.domain import GitHubPRRequest, GitHubPRResult

class GitHubService:
    def __init__(self):
        self._prs = {}

    def create_pull_request(self, request: GitHubPRRequest) -> GitHubPRResult:
        pr_number = len(self._prs) + 101
        pr_url = f"https://github.com/{request.repo}/pull/{pr_number}"
        
        result = GitHubPRResult(
            pr_number=pr_number,
            pr_url=pr_url,
            branch=request.head_branch,
            status="OPEN"
        )
        self._prs[pr_number] = result
        return result

    def get_pr_status(self, pr_number: int) -> GitHubPRResult:
        if pr_number in self._prs:
            return self._prs[pr_number]
        return GitHubPRResult(
            pr_number=pr_number,
            pr_url=f"https://github.com/org/repo/pull/{pr_number}",
            branch="fix/auto-rca-patch",
            status="MERGED"
        )

github_service = GitHubService()
