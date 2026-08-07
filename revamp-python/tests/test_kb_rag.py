def test_kb_search_and_connector_config(client):
    res = client.get("/api/v1/kb/search?q=NullPointer")
    assert res.status_code == 200
    articles = res.json()
    assert len(articles) > 0
    assert "NullPointer" in articles[0]["title"]

    conn_res = client.get("/api/v1/kb/connectors")
    assert conn_res.status_code == 200
    connectors = conn_res.json()
    assert len(connectors) >= 2
