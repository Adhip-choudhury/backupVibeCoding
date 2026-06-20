from sqlalchemy.orm import Session
from typing import List, Optional
from . import models, db_models
from .schemas import WorkflowCreate, WorkflowUpdate
import json

def get_workflow(db: Session, workflow_id: str):
    return db.query(db_models.WorkflowDB).filter(db_models.WorkflowDB.id == workflow_id).first()

def get_workflows(db: Session, skip: int = 0, limit: int = 100):
    return db.query(db_models.WorkflowDB).offset(skip).limit(limit).all()

def create_workflow(db: Session, workflow: WorkflowCreate):
    # Convert Pydantic model to dict for JSON serialization
    workflow_data = workflow.dict()
    
    # Create DB model
    db_workflow = db_models.WorkflowDB(
        id=workflow_data.get('id', str(__import__('uuid').uuid4())),
        name=workflow_data['name'],
        description=workflow_data.get('description'),
        version=workflow_data.get('version', 1),
        nodes_json=json.dumps([node.dict() for node in workflow_data['nodes']]),
        edges_json=json.dumps([edge.dict() for edge in workflow_data['edges']])
    )
    
    db.add(db_workflow)
    db.commit()
    db.refresh(db_workflow)
    return db_workflow

def update_workflow(db: Session, workflow_id: str, workflow: WorkflowUpdate):
    db_workflow = get_workflow(db, workflow_id)
    if db_workflow:
        update_data = workflow.dict(exclude_unset=True)
        
        # Update fields that are provided
        for field, value in update_data.items():
            if field in ['nodes', 'edges'] and value is not None:
                # Handle JSON fields specially
                if field == 'nodes':
                    db_workflow.nodes_json = json.dumps([node.dict() for node in value])
                elif field == 'edges':
                    db_workflow.edges_json = json.dumps([edge.dict() for edge in value])
            elif field not in ['nodes', 'edges']:
                setattr(db_workflow, field, value)
        
        db.commit()
        db.refresh(db_workflow)
    return db_workflow

def delete_workflow(db: Session, workflow_id: str):
    db_workflow = get_workflow(db, workflow_id)
    if db_workflow:
        db.delete(db_workflow)
        db.commit()
    return db_workflow

# Simulation run CRUD operations
def get_simulation_runs_by_workflow(db: Session, workflow_id: str, skip: int = 0, limit: int = 100):
    return db.query(db_models.SimulationRunDB).filter(
        db_models.SimulationRunDB.workflow_id == workflow_id
    ).offset(skip).limit(limit).all()

def create_simulation_run(db: Session, workflow_id: str, results: dict):
    from .db_models import SimulationRunDB
    import json
    import uuid
    
    db_simulation_run = SimulationRunDB(
        id=str(uuid.uuid4()),
        workflow_id=workflow_id,
        start_time=results.get('start_time', 0),
        end_time=results.get('end_time'),
        status=results.get('status', 'completed'),
        config_json=json.dumps(results.get('config', {}))
    )
    
    db.add(db_simulation_run)
    db.commit()
    db.refresh(db_simulation_run)
    
    # Save event logs if provided
    if 'event_logs' in results:
        for event_log in results['event_logs']:
            db_event_log = db_models.EventLogDB(
                id=str(uuid.uuid4()),
                simulation_run_id=db_simulation_run.id,
                timestamp=event_log['timestamp'],
                type=event_log['type'],
                node_id=event_log['node_id'],
                entity_id=event_log['entity_id'],
                duration=event_log.get('duration'),
                outcome=event_log.get('outcome', 'success'),
                resources_used_json=json.dumps(event_log.get('resources_used', []))
            )
            db.add(db_event_log)
        
        db.commit()
    
    return db_simulation_run