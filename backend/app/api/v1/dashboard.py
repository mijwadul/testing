from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from ...core.auth import get_current_user
from ...core.database import get_db
from ...models import Employee, Equipment, Project, PayrollRecord
from ...schemas import Employee as EmployeeSchema
from ...schemas import Equipment as EquipmentSchema
from ...schemas import Project as ProjectSchema

router = APIRouter(dependencies=[Depends(get_current_user)])


@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    equipment_count = db.query(Equipment).count()
    employee_count  = db.query(Employee).filter(Employee.is_active == True).count()
    project_count   = db.query(Project).count()

    return {
        "equipment_count": equipment_count,
        "employee_count":  employee_count,
        "project_count":   project_count,
    }


@router.get("/payroll-summary")
def get_payroll_summary(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Return payroll overview for the dashboard:
    - Pending approval count + total value
    - Approved (this month) count + total value
    - Paid (this month) count + total value
    - Total net_salary paid this month
    """
    today      = date.today()
    month_start = today.replace(day=1)

    # --- Pending (all time – awaiting GM approval) ---
    pending_q = (
        db.query(
            func.count(PayrollRecord.id).label("count"),
            func.coalesce(func.sum(PayrollRecord.net_salary), 0).label("total"),
        )
        .filter(PayrollRecord.payment_status == "pending")
        .one()
    )

    # --- Approved this month ---
    approved_q = (
        db.query(
            func.count(PayrollRecord.id).label("count"),
            func.coalesce(func.sum(PayrollRecord.net_salary), 0).label("total"),
        )
        .filter(
            PayrollRecord.payment_status == "approved",
            PayrollRecord.period_start >= month_start,
        )
        .one()
    )

    # --- Paid this month ---
    paid_q = (
        db.query(
            func.count(PayrollRecord.id).label("count"),
            func.coalesce(func.sum(PayrollRecord.net_salary), 0).label("total"),
        )
        .filter(
            PayrollRecord.payment_status == "paid",
            PayrollRecord.period_start >= month_start,
        )
        .one()
    )

    # --- Recent pending records (for quick action list) ---
    recent_pending = (
        db.query(PayrollRecord)
        .filter(PayrollRecord.payment_status == "pending")
        .order_by(PayrollRecord.created_at.desc())
        .limit(5)
        .all()
    )
    pending_list = [
        {
            "id":            r.id,
            "employee_name": r.employee.name if r.employee else "-",
            "period_start":  str(r.period_start),
            "period_end":    str(r.period_end),
            "net_salary":    r.net_salary,
        }
        for r in recent_pending
    ]

    return {
        "pending_count":   pending_q.count,
        "pending_total":   float(pending_q.total),
        "approved_count":  approved_q.count,
        "approved_total":  float(approved_q.total),
        "paid_count":      paid_q.count,
        "paid_total":      float(paid_q.total),
        "recent_pending":  pending_list,
        "month_label":     today.strftime("%B %Y"),
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
