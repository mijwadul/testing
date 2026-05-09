from datetime import datetime, timedelta
from typing import List, Optional, Set
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from ...core.auth import get_current_user
from ...core.database import get_db
from ...models import FuelLog, Equipment, User, WorkLog
from ...schemas import (
    FuelLogCreate,
    FuelLogUpdate,
    FuelLog as FuelLogSchema,
    FuelLogWithEquipment,
    FuelEfficiencyStats,
    FuelEquipmentReportItem,
)

router = APIRouter()


def _period_start(days: int) -> datetime:
    return datetime.now() - timedelta(days=days)


@router.post("/refuel", response_model=FuelLogSchema)
def create_fuel_log(
    fuel_data: FuelLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Catat pengisian BBM baru"""
    equipment = db.query(Equipment).filter(Equipment.id == fuel_data.equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")

    fuel_log = FuelLog(
        equipment_id=fuel_data.equipment_id,
        hour_meter=fuel_data.hour_meter,
        liters_filled=fuel_data.liters_filled,
        refuel_date=fuel_data.refuel_date,
        location=fuel_data.location or equipment.location,
        photo_url=fuel_data.photo_url,
        notes=fuel_data.notes,
        operating_hours=fuel_data.operating_hours,
        recorded_by=current_user.id if current_user else None
    )

    db.add(fuel_log)
    db.commit()
    db.refresh(fuel_log)
    return fuel_log


@router.get("/logs", response_model=List[FuelLogWithEquipment])
def get_fuel_logs(
    equipment_id: Optional[int] = None,
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Ambil history pengisian BBM (sesuai tanggal pengisian, bukan waktu simpan ke server)"""
    query = db.query(
        FuelLog,
        Equipment.name.label('equipment_name'),
        Equipment.type.label('equipment_type')
    ).join(Equipment, FuelLog.equipment_id == Equipment.id)

    if equipment_id:
        query = query.filter(FuelLog.equipment_id == equipment_id)

    since = _period_start(days)
    query = query.filter(FuelLog.refuel_date >= since)

    results = query.order_by(FuelLog.refuel_date.desc()).all()

    logs = []
    for row in results:
        log_dict = {
            'id': row.FuelLog.id,
            'equipment_id': row.FuelLog.equipment_id,
            'liters_filled': row.FuelLog.liters_filled,
            'refuel_date': row.FuelLog.refuel_date,
            'location': row.FuelLog.location,
            'photo_url': row.FuelLog.photo_url,
            'notes': row.FuelLog.notes,
            'recorded_by': row.FuelLog.recorded_by,
            'created_at': row.FuelLog.created_at,
            'equipment_name': row.equipment_name,
            'equipment_type': row.equipment_type
        }
        logs.append(log_dict)

    return logs


@router.get("/logs/{log_id}", response_model=FuelLogWithEquipment)
def get_fuel_log_by_id(
    log_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Ambil detail pengisian BBM by ID"""
    result = db.query(
        FuelLog,
        Equipment.name.label('equipment_name'),
        Equipment.type.label('equipment_type')
    ).join(Equipment, FuelLog.equipment_id == Equipment.id).filter(FuelLog.id == log_id).first()

    if not result:
        raise HTTPException(status_code=404, detail="Fuel log not found")

    log_dict = {
        'id': result.FuelLog.id,
        'equipment_id': result.FuelLog.equipment_id,
        'liters_filled': result.FuelLog.liters_filled,
        'refuel_date': result.FuelLog.refuel_date,
        'location': result.FuelLog.location,
        'photo_url': result.FuelLog.photo_url,
        'notes': result.FuelLog.notes,
        'recorded_by': result.FuelLog.recorded_by,
        'created_at': result.FuelLog.created_at,
        'equipment_name': result.equipment_name,
        'equipment_type': result.equipment_type
    }
    return log_dict


@router.put("/logs/{log_id}", response_model=FuelLogSchema)
def update_fuel_log(
    log_id: int,
    fuel_data: FuelLogUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update catatan pengisian BBM"""
    fuel_log = db.query(FuelLog).filter(FuelLog.id == log_id).first()
    if not fuel_log:
        raise HTTPException(status_code=404, detail="Fuel log not found")

    if not current_user.is_admin and not current_user.is_superuser and fuel_log.recorded_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this log")

    update_data = fuel_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(fuel_log, field, value)

    db.commit()
    db.refresh(fuel_log)
    return fuel_log


@router.get("/efficiency", response_model=FuelEfficiencyStats)
def get_fuel_efficiency(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Efisiensi BBM: total liter / total jam kerja (dari catatan jam kerja) dalam periode yang sama.
    """
    since = _period_start(days)

    total_fuel = db.query(func.coalesce(func.sum(FuelLog.liters_filled), 0)).filter(
        FuelLog.refuel_date >= since
    ).scalar()
    total_fuel = float(total_fuel or 0)

    total_work_hours = db.query(func.coalesce(func.sum(WorkLog.total_hours), 0)).filter(
        WorkLog.work_date >= since
    ).scalar()
    total_work_hours = float(total_work_hours or 0)

    fuel_eq: Set[int] = {
        r[0] for r in db.query(FuelLog.equipment_id).filter(
            FuelLog.refuel_date >= since
        ).distinct().all() if r[0] is not None
    }
    work_eq: Set[int] = {
        r[0] for r in db.query(WorkLog.equipment_id).filter(
            WorkLog.work_date >= since
        ).distinct().all() if r[0] is not None
    }
    equipment_count = len(fuel_eq | work_eq)

    avg_fuel_ratio = (total_fuel / total_work_hours) if total_work_hours > 0 else 0.0

    return FuelEfficiencyStats(
        total_fuel_consumed=round(total_fuel, 2),
        equipment_count=equipment_count
    )


@router.get("/equipment-report", response_model=List[FuelEquipmentReportItem])
def get_fuel_equipment_report(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Ringkasan per alat: jam kerja vs liter BBM vs konsumsi rata-rata per jam dalam satu periode."""
    since = _period_start(days)

    fuel_rows = db.query(
        FuelLog.equipment_id,
        func.coalesce(func.sum(FuelLog.liters_filled), 0).label("total_liters"),
        func.count(FuelLog.id).label("refuel_count"),
    ).filter(
        FuelLog.refuel_date >= since
    ).group_by(FuelLog.equipment_id).all()

    work_rows = db.query(
        WorkLog.equipment_id,
        func.coalesce(func.sum(WorkLog.total_hours), 0).label("total_work_hours"),
        func.count(WorkLog.id).label("work_log_count"),
    ).filter(
        WorkLog.work_date >= since
    ).group_by(WorkLog.equipment_id).all()

    by_id = {}
    for row in fuel_rows:
        eq_id = row.equipment_id
        by_id[eq_id] = {
            "total_liters": float(row.total_liters or 0),
            "total_work_hours": 0.0,
            "refuel_count": int(row.refuel_count or 0),
            "work_log_count": 0,
        }

    for row in work_rows:
        eq_id = row.equipment_id
        total_wh = float(row.total_work_hours or 0)
        wcount = int(row.work_log_count or 0)
        if eq_id not in by_id:
            by_id[eq_id] = {
                "total_liters": 0.0,
                "total_work_hours": total_wh,
                "refuel_count": 0,
                "work_log_count": wcount,
            }
        else:
            by_id[eq_id]["total_work_hours"] = total_wh
            by_id[eq_id]["work_log_count"] = wcount

    equipment_list = db.query(Equipment).filter(Equipment.id.in_(list(by_id.keys()))).all() if by_id else []
    equip_by_id = {e.id: e for e in equipment_list}

    items: List[FuelEquipmentReportItem] = []

    def _report_sort_key(kv: tuple) -> tuple:
        eq_id, _sums = kv
        eq = equip_by_id.get(eq_id)
        label = eq.name.lower() if eq else str(eq_id).zfill(8)
        return (label, eq_id)

    for eq_id, sums in sorted(by_id.items(), key=_report_sort_key):
        equip = equip_by_id.get(eq_id)
        liters = sums["total_liters"]
        hours = sums["total_work_hours"]
        lph = (liters / hours) if hours > 0 else None
        items.append(
            FuelEquipmentReportItem(
                equipment_id=eq_id,
                equipment_name=equip.name if equip else f"#{eq_id}",
                equipment_type=equip.type if equip else "?",
                location=equip.location if equip else None,
                total_liters=round(liters, 2),
                refuel_count=sums["refuel_count"],
            )
        )

    return items


@router.get("/efficiency/{equipment_id}", response_model=dict)
def get_equipment_fuel_efficiency(
    equipment_id: int,
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Efisiensi BBM per equipment (liter / jam kerja terdaftar)"""
    since = _period_start(days)

    total_liters = db.query(func.coalesce(func.sum(FuelLog.liters_filled), 0)).filter(
        FuelLog.equipment_id == equipment_id,
        FuelLog.refuel_date >= since
    ).scalar()
    total_liters = float(total_liters or 0)

    total_hours = db.query(func.coalesce(func.sum(WorkLog.total_hours), 0)).filter(
        WorkLog.equipment_id == equipment_id,
        WorkLog.work_date >= since
    ).scalar()
    total_hours = float(total_hours or 0)

    refuel_count = db.query(func.count(FuelLog.id)).filter(
        FuelLog.equipment_id == equipment_id,
        FuelLog.refuel_date >= since
    ).scalar() or 0

    fuel_ratio = (total_liters / total_hours) if total_hours > 0 else 0.0

    return {
        "equipment_id": equipment_id,
        "total_liters": round(total_liters, 2),
        "hours_operated": round(total_hours, 2),
        "fuel_ratio": round(fuel_ratio, 2),
        "refuel_count": int(refuel_count)
    }


@router.delete("/logs/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_fuel_log(
    log_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Hapus catatan pengisian BBM (admin only)"""
    log = db.query(FuelLog).filter(FuelLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Fuel log not found")

    if not current_user.is_admin and not current_user.is_superuser and log.recorded_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this log")

    db.delete(log)
    db.commit()
    return None
