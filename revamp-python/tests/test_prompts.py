def test_prompt_rendering(client):
    context = {"bug_id": "bug-999", "stack_trace": "NullPointer in PaymentService.java:42"}
    res = client.post("/api/v1/prompts/render?role=LOG_PARSER", json=context)
    assert res.status_code == 200
    data = res.json()
    assert "Log Parser Subagent" in data["rendered_prompt"]
    assert "bug-999" in data["rendered_prompt"]
