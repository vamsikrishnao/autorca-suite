def test_worker_pool_operations(client):
    res = client.get("/api/v1/workers/")
    assert res.status_code == 200
    workers = res.json()
    assert len(workers) >= 2

    alloc_res = client.post("/api/v1/workers/allocate")
    assert alloc_res.status_code == 200
    allocated = alloc_res.json()
    assert allocated["active_tasks"] == 1
