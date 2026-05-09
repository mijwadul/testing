from datetime import timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from ...core.auth import authenticate_user, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, get_current_user, get_password_hash, require_admin
from ...core.database import get_db
from ...schemas import Token, User, UserCreate, UserUpdate
from ...models import User as UserModel

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

class TokenWithUser(Token):
    user: User

@router.post("/login", response_model=TokenWithUser)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role, "is_admin": user.is_admin}, 
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@router.get("/me", response_model=User)
def get_current_user_info(current_user: UserModel = Depends(get_current_user)):
    return current_user

# User Management Endpoints (Admin only)
@router.get("/users", response_model=List[User])
def get_users(db: Session = Depends(get_db), admin_user: UserModel = Depends(require_admin)):
    users = db.query(UserModel).all()
    return users

@router.post("/users", response_model=User)
def create_user(user: UserCreate, db: Session = Depends(get_db), admin_user: UserModel = Depends(require_admin)):
    # Check if email already exists
    existing = db.query(UserModel).filter(UserModel.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Support both 'gm' (Bina-ERP) and 'admin' (legacy) as admin roles
    is_admin_user = user.is_admin or user.role in ["admin", "gm"]
    
    db_user = UserModel(
        email=user.email,
        password_hash=get_password_hash(user.password),
        full_name=user.full_name,
        phone=user.phone,
        employee_id=user.employee_id,
        role=user.role,
        is_admin=is_admin_user,
        is_active=user.is_active
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.put("/users/{user_id}", response_model=User)
def update_user(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db), admin_user: UserModel = Depends(require_admin)):
    db_user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = user_update.model_dump(exclude_unset=True)
    
    # Handle password separately
    if "password" in update_data and update_data["password"]:
        update_data["password_hash"] = get_password_hash(update_data.pop("password"))
    elif "password" in update_data:
        update_data.pop("password")
    
    # Update is_admin based on role if role is changed
    # Support both legacy 'admin' role and Bina-ERP 'gm' role
    if "role" in update_data:
        if update_data["role"] in ["admin", "gm"]:
            update_data["is_admin"] = True
        else:
            update_data["is_admin"] = False
    
    for key, value in update_data.items():
        setattr(db_user, key, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user

@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), admin_user: UserModel = Depends(require_admin)):
    db_user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent deleting yourself
    if db_user.id == admin_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    db.delete(db_user)
    db.commit()
    return {"message": "User deleted successfully"}