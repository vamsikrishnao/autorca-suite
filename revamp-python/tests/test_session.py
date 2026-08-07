def test_user_session_store_lifecycle(client):
    params = {
        "user_id": "usr-42",
        "email": "dev@company.com",
        "role": "ADMIN",
        "tenant_id": "tenant-alpha"
    }
    res = client.post("/api/v1/auth/session", params=params)
    assert res.status_code == 200
    session = res.json()
    assert session["token"].startswith("sess_")
    token = session["token"]

    # Verify session retrieval via Bearer header
    headers = {"Authorization": f"Bearer {token}"}
    me_res = client.get("/api/v1/auth/session/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["user_id"] == "usr-42"

    # Destroy session
    del_res = client.delete("/api/v1/auth/session", headers=headers)
    assert del_res.status_code == 200

    # Verify session is now invalid
    me_after = client.get("/api/v1/auth/session/me", headers=headers)
    assert me_after.status_code == 401
