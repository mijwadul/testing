from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from ...core.auth import get_current_user
from ...core.database import get_db
from ...models import FuelLog, Equipment, User
from ...schemas import FuelLogCreate, FuelLogUpdate, FuelLog as FuelLogSchema, FuelLogWithEquipment, FuelEfficiencyStats

router = APIRouter()

@router.post("/refuel", response_model=FuelLogSchema)
def create_fuel_log(
    fuel_data: FuelLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Catat pengisian BBM baru"""
    # Cek apakah equipment ada
    equipment = db.query(Equipment).filter(Equipment.id == fuel_data.equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    # Buat fuel log baru
    fuel_log = FuelLog(
        equipment_id=fuel_data.equipment_id,
        operating_hours=fuel_data.operating_hours,
        liters_filled=fuel_data.liters_filled,
        refuel_date=fuel_data.refuel_date,
        location=fuel_data.location or equipment.location,
        photo_url=fuel_data.photo_url,
        notes=fuel_data.notes,
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
    """Ambil history pengisian BBM"""
    query = db.query(
        FuelLog,
        Equipment.name.label('equipment_name'),
        Equipment.type.label('equipment_type')
    ).join(Equipment, FuelLog.equipment_id == Equipment.id)
    
    if equipment_id:
        query = query.filter(FuelLog.equipment_id == equipment_id)
    
    # Filter by date range
    since_date = datetime.now() - timedelta(days=days)
    query = query.filter(FuelLog.created_at >= since_date)
    
    results = query.order_by(FuelLog.created_at.desc()).all()
    
    # Format response
    logs = []
    for row in results:
        log_dict = {
            'id': row.FuelLog.id,
            'equipment_id': row.FuelLog.equipment_id,
            'operating_hours': row.FuelLog.operating_hours,
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
        'operating_hours': result.FuelLog.operating_hours,
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

    # Only admin or the recorder can update
    if not current_user.is_admin and fuel_log.recorded_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this log")

    # Update fields
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
    """Hitung efisiensi BBM (Liter per Hour)"""
    since_date = datetime.now() - timedelta(days=days)
    
    # Total fuel consumed
    total_fuel = db.query(func.sum(FuelLog.liters_filled)).filter(
        FuelLog.created_at >= since_date
    ).scalar() or 0
    
    # Get equipment count that has fuel logs
    equipment_ids = db.query(FuelLog.equipment_id).filter(
        FuelLog.created_at >= since_date
    ).distinct().count()
    
    # Calculate total hours operated (simplified - based on operating_hours difference)
    # Note: operating_hours bisa HM asli atau estimasi manual jika HM rusak
    avg_fuel_ratio = 0
    if equipment_ids > 0:
        # Calculate average fuel ratio per equipment
        equipment_stats = db.query(
            FuelLog.equipment_id,
            func.sum(FuelLog.liters_filled).label('total_liters'),
            func.min(FuelLog.operating_hours).label('min_hours'),
            func.max(FuelLog.operating_hours).label('max_hours')
        ).filter(
            FuelLog.created_at >= since_date
        ).group_by(FuelLog.equipment_id).all()
        
        total_ratio = 0
        count = 0
        for stat in equipment_stats:
            hours_diff = stat.max_hours - stat.min_hours
            if hours_diff > 0:
                ratio = stat.total_liters / hours_diff
                total_ratio += ratio
                count += 1
        
        if count > 0:
            avg_fuel_ratio = total_ratio / count
    
    # Estimate total hours (simplified)
    total_hours = total_fuel / avg_fuel_ratio if avg_fuel_ratio > 0 else 0
    
    return FuelEfficiencyStats(
        total_fuel_consumed=round(total_fuel, 2),
        total_hours_operated=round(total_hours, 2),
        avg_fuel_ratio=round(avg_fuel_ratio, 2),
        equipment_count=equipment_ids
    )

@router.get("/efficiency/{equipment_id}", response_model=dict)
def get_equipment_fuel_efficiency(
    equipment_id: int,
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Hitung efisiensi BBM per equipment"""
    since_date = datetime.now() - timedelta(days=days)
    
    logs = db.query(FuelLog).filter(
        FuelLog.equipment_id == equipment_id,
        FuelLog.created_at >= since_date
    ).order_by(FuelLog.operating_hours.asc()).all()
    
    if len(logs) < 2:
        return {
            "equipment_id": equipment_id,
            "total_liters": sum(log.liters_filled for log in logs),
            "hours_operated": 0,
            "fuel_ratio": 0,
            "refuel_count": len(logs)
        }
    
    total_liters = sum(log.liters_filled for log in logs)
    hours_diff = logs[-1].operating_hours - logs[0].operating_hours
    fuel_ratio = total_liters / hours_diff if hours_diff > 0 else 0
    
    return {
        "equipment_id": equipment_id,
        "total_liters": round(total_liters, 2),
        "hours_operated": round(hours_diff, 2),
        "fuel_ratio": round(fuel_ratio, 2),
        "refuel_count": len(logs)
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
    
    # Only admin or the recorder can delete
    if not current_user.is_admin and log.recorded_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this log")
    
    db.delete(log)
    db.commit()
    return None
