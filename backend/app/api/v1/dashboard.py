from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ...core.auth import get_current_user
from ...core.database import get_db
from ...models import Employee, Equipment, Project
from ...schemas import Employee as EmployeeSchema
from ...schemas import Equipment as EquipmentSchema
from ...schemas import Project as ProjectSchema

router = APIRouter(dependencies=[Depends(get_current_user)])


@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    # Dummy data for now
    equipment_count = db.query(Equipment).count()
    employee_count = db.query(Employee).count()
    project_count = db.query(Project).count()

    return {
        "equipment_count": equipment_count,
        "employee_count": employee_count,
        "project_count": project_count,
    }


@router.get("/equipment")
def get_equipment(db: Session = Depends(get_db)):
    equipment = db.query(Equipment).all()
    return [EquipmentSchema.model_validate(eq) for eq in equipment]


@router.get("/employees")
def get_employees(db: Session = Depends(get_db)):
    employees = db.query(Employee).all()
    return [EmployeeSchema.model_validate(emp) for emp in employees]


@router.get("/projects")
def get_projects(db: Session = Depends(get_db)):
    projects = db.query(Project).all()
    return [ProjectSchema.model_validate(proj) for proj in projects]
