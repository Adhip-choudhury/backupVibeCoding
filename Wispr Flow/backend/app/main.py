from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routes import auth, machines, sample_types, samples, dashboard

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Wispr Flow API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(machines.router)
app.include_router(sample_types.router)
app.include_router(samples.router)
app.include_router(dashboard.router)


@app.get("/health")
def health():
    return {"status": "ok"}
