from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean, Text, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import json

Base = declarative_base()

class WorkflowDB(Base):
    __tablename__ = "workflows"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text, nullable=True)
    version = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    # Store nodes and edges as JSON
    nodes_json = Column(Text, nullable=False)  # JSON string of nodes
    edges_json = Column(Text, nullable=False)  # JSON string of edges
    
    # Relationships
    simulation_runs = relationship("SimulationRunDB", back_populates="workflow")

class NodeDB(Base):
    __tablename__ = "nodes"
    
    id = Column(String, primary_key=True, index=True)
    workflow_id = Column(String, ForeignKey("workflows.id"))
    type = Column(String)
    position_x = Column(Float)
    position_y = Column(Float)
    label = Column(String, nullable=True)
    properties_json = Column(Text, nullable=False)  # JSON string of properties
    
    # Relationship
    workflow = relationship("WorkflowDB")

class EdgeDB(Base):
    __tablename__ = "edges"
    
    id = Column(String, primary_key=True, index=True)
    workflow_id = Column(String, ForeignKey("workflows.id"))
    source = Column(String)
    target = Column(String)
    label = Column(String, nullable=True)
    condition = Column(String, nullable=True)
    
    # Relationship
    workflow = relationship("WorkflowDB")

class ResourceDB(Base):
    __tablename__ = "resources"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    type = Column(String)  # Machine, Worker, Server, etc.
    capacity = Column(Integer, default=1)
    cost_per_hour = Column(Float, default=0.0)
    setup_time_secs = Column(Float, nullable=True)
    maintenance_interval_hours = Column(Float, nullable=True)

class EntityDB(Base):
    __tablename__ = "entities"
    
    id = Column(String, primary_key=True, index=True)
    type = Column(String)
    creation_time = Column(Float)
    current_status = Column(String, default="Created")
    attributes_json = Column(Text, nullable=False)  # JSON string of attributes

class SimulationRunDB(Base):
    __tablename__ = "simulation_runs"
    
    id = Column(String, primary_key=True, index=True)
    workflow_id = Column(String, ForeignKey("workflows.id"))
    start_time = Column(Float)
    end_time = Column(Float, nullable=True)
    status = Column(String)  # running, completed, failed
    config_json = Column(Text, nullable=False)  # JSON string of config
    
    # Relationship
    workflow = relationship("WorkflowDB", back_populates="simulation_runs")
    event_logs = relationship("EventLogDB", back_populates="simulation_run")

class EventLogDB(Base):
    __tablename__ = "event_logs"
    
    id = Column(String, primary_key=True, index=True)
    simulation_run_id = Column(String, ForeignKey("simulation_runs.id"))
    timestamp = Column(Float)
    type = Column(String)  # entity_entered, entity_started_processing, etc.
    node_id = Column(String)
    entity_id = Column(String)
    duration = Column(Float, nullable=True)
    outcome = Column(String, default="success")
    resources_used_json = Column(Text, nullable=False)  # JSON string of resource list
    
    # Relationship
    simulation_run = relationship("SimulationRunDB", back_populates="event_logs")

# Helper functions to convert between Pydantic models and DB models
def workflow_to_db(workflow):
    """Convert Pydantic Workflow model to DB model"""
    db_workflow = WorkflowDB(
        id=workflow.id,
        name=workflow.name,
        description=workflow.description,
        version=workflow.version,
        created_at=workflow.createdAt,
        updated_at=workflow.updatedAt,
        nodes_json=json.dumps([node.dict() for node in workflow.nodes]),
        edges_json=json.dumps([edge.dict() for edge in workflow.edges])
    )
    return db_workflow

def db_to_workflow(db_workflow):
    """Convert DB model to Pydantic Workflow model"""
    from app.models.node import Node
    from app.models.edge import Edge
    
    workflow = Workflow(
        id=db_workflow.id,
        name=db_workflow.name,
        description=db_workflow.description,
        version=db_workflow.version,
        createdAt=db_workflow.created_at,
        updatedAt=db_workflow.updated_at,
        nodes=[Node(**node) for node in json.loads(db_workflow.nodes_json)],
        edges=[Edge(**edge) for edge in json.loads(db_workflow.edges_json)]
    )
    return workflow

def simulation_run_to_db(simulation_run):
    """Convert simulation run dict to DB model"""
    db_simulation_run = SimulationRunDB(
        id=simulation_run.get('id', str(uuid4())),
        workflow_id=simulation_run['workflow_id'],
        start_time=simulation_run['start_time'],
        end_time=simulation_run.get('end_time'),
        status=simulation_run['status'],
        config_json=json.dumps(simulation_run['config'])
    )
    return db_simulation_run

def db_to_simulation_run(db_simulation_run):
    """Convert DB model to simulation run dict"""
    return {
        'id': db_simulation_run.id,
        'workflow_id': db_simulation_run.workflow_id,
        'start_time': db_simulation_run.start_time,
        'end_time': db_simulation_run.end_time,
        'status': db_simulation_run.status,
        'config': json.loads(db_simulation_run.config_json)
    }

def event_log_to_db(event_log):
    """Convert event log dict to DB model"""
    db_event_log = EventLogDB(
        id=event_log.get('id', str(uuid4())),
        simulation_run_id=event_log['simulation_run_id'],
        timestamp=event_log['timestamp'],
        type=event_log['type'],
        node_id=event_log['node_id'],
        entity_id=event_log['entity_id'],
        duration=event_log.get('duration'),
        outcome=event_log.get('outcome', 'success'),
        resources_used_json=json.dumps(event_log['resources_used'])
    )
    return db_event_log

def db_to_event_log(db_event_log):
    """Convert DB model to event log dict"""
    return {
        'id': db_event_log.id,
        'simulation_run_id': db_event_log.simulation_run_id,
        'timestamp': db_event_log.timestamp,
        'type': db_event_log.type,
        'node_id': db_event_log.node_id,
        'entity_id': db_event_log.entity_id,
        'duration': db_event_log.duration,
        'outcome': db_event_log.outcome,
        'resources_used': json.loads(db_event_log.resources_used_json)
    }