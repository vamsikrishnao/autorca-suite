def test_bug_reporting_and_triage(client):
    payload = {
        "bug_id": "bug-101",
        "title": "NullPointerException in Payments Service",
        "description": "Null reference crash when customer ID is missing",
        "stack_trace": "java.lang.NullPointerException at com.payment.Process.execute(Process.java:42)",
        "service_name": "payments-api",
        "tenant_id": "tenant-alpha"
    }
    res = client.post("/api/v1/bugs/", json=payload)
    assert res.status_code == 200
    assert res.json()["bug_id"] == "bug-101"

    triage_res = client.get("/api/v1/bugs/bug-101/triage")
    assert triage_res.status_code == 200
    triage_data = triage_res.json()
    assert triage_data["category"] == "NULL_POINTER"
    assert triage_data["severity"] in ["CRITICAL", "HIGH"]
