# ResourceAwareScheduler Service API

This document defines the API for the `ResourceAwareScheduler` microservice.

## Endpoints

### POST /schedule

This endpoint takes a list of candidate tasks and resource budgets, and returns an optimized schedule.

**Request Body:**

```json
{
  "tasks": [
    {
      "name": "Task A",
      "value": 10,
      "operations": 1e9,
      "dataSize": 1e6,
      "network": true,
      "carbonSensitive": false
    },
    {
      "name": "Task B",
      "value": 20,
      "operations": 2e9,
      "dataSize": 5e5,
      "network": false,
      "carbonSensitive": true
    }
  ],
  "budgets": {
    "cpu": 10,
    "memory": 1e9,
    "energy": 1000,
    "carbon": 0.5
  },
  "strategy": "greedy"
}
```

**Response Body (Success):**

```json
{
  "schedule": [
    {
      "task": "Task B",
      "scheduled": true,
      "result": "...",
      "resourcesUsed": {
        "cpu": 2,
        "memory": 5e5,
        "energy": 100,
        "bandwidth": 0,
        "carbon": 0.1
      }
    }
  ],
  "rejections": [
    {
      "task": "Task A",
      "scheduled": false,
      "reason": "Not selected by optimization strategy"
    }
  ],
  "utilization": {
    "cpu": {
      "used": 2,
      "total": 10,
      "percent": "20.0%"
    },
    "memory": {
      "used": 5e5,
      "total": 1e9,
      "percent": "0.1%"
    },
    ...
  }
}
```

**Response Body (Error):**

```json
{
  "error": "Invalid input",
  "details": "..."
}
```

## Feature Prioritization

### MVP (Minimum Viable Product)

- Implement the `/schedule` endpoint with the 'greedy' optimization strategy.
- Basic input validation for the request body.
- Return the optimized schedule, rejections, and resource utilization.
- Basic structured logging for requests and responses.

### V1.1

- Add support for the 'genetic' algorithm optimization strategy.
- Implement robust input validation using a schema validation library (e.g., Zod).
- Enhance logging with more detailed information about the scheduling process.

### V1.2 (Final State)

- Implement an asynchronous processing model for long-running scheduling requests, with a separate endpoint to check the status of a job.
- Integrate with a real-time carbon intensity API to provide more accurate carbon-aware scheduling.
- Add authentication and authorization to the API endpoints.
- Implement rate limiting to prevent abuse.
