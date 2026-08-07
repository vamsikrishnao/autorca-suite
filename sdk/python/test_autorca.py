import unittest
from unittest.mock import patch, MagicMock
from autorca import AutoRCAClient

class TestAutoRCAPythonSDK(unittest.TestCase):

    def setUp(self):
        self.client = AutoRCAClient(
            endpoint="https://autorca.company.com",
            api_key="py-test-token",
            tenant_id="org-py-test",
            project_id="proj-py-test",
            target_repo="acme/python-service",
            target_branch="main"
        )

    @patch("autorca.requests.post")
    def test_dispatch_investigation_success(self, mock_post):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "success": True,
            "message": "Dispatched RCA investigation",
            "job": {"jobId": "job-py-100", "podId": "pod-py-200"}
        }
        mock_post.return_value = mock_response

        result = self.client.dispatch_investigation(
            title="ZeroDivisionError",
            error_message="division by zero",
            stackTrace="Traceback (most recent call last):\n  File 'app.py', line 10, in <module>\n    x = 1 / 0\nZeroDivisionError: division by zero",
            harness_command="pytest tests/unit"
        )

        self.assertTrue(result["success"])
        self.assertEqual(result["job"]["jobId"], "job-py-100")
        mock_post.assert_called_once()
        args, kwargs = mock_post.call_args
        self.assertEqual(kwargs["json"]["title"], "ZeroDivisionError")
        self.assertEqual(kwargs["headers"]["x-tenant-id"], "org-py-test")
        self.assertEqual(kwargs["headers"]["Authorization"], "Bearer py-test-token")

    @patch("autorca.requests.post")
    def test_capture_exception_wrapper(self, mock_post):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"success": True}
        mock_post.return_value = mock_response

        try:
            val = int("invalid_int")
        except ValueError as exc:
            res = self.client.capture_exception(exc, harness_command="pytest")
            self.assertTrue(res["success"])

if __name__ == "__main__":
    unittest.main()
