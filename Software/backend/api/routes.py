from fastapi import APIRouter, HTTPException

from backend.api.schemas import SimulateRequest, SimulateResponse
from backend.src.core.models import Workflow, SimulationConfig
from backend.src.core.simulation import SimulationEngine

router = APIRouter()


@router.post("/simulate", response_model=SimulateResponse)
def simulate(request: SimulateRequest):
    try:
        workflow = Workflow.model_validate({
            "id": request.workflow.id,
            "name": request.workflow.name,
            "nodes": request.workflow.nodes,
            "edges": request.workflow.edges,
            "version": request.workflow.version,
        })
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid workflow: {str(e)}")

    config = SimulationConfig(
        max_entities=request.max_entities,
        arrival_rate=request.arrival_rate,
        random_seed=request.random_seed,
    )

    engine = SimulationEngine(workflow, config)
    result = engine.run()

    return SimulateResponse(
        status=result.status,
        run_id=result.id,
        metrics=result.metrics.model_dump(mode="json"),
        event_log=[entry.model_dump(mode="json") for entry in engine.get_event_log()],
    )
