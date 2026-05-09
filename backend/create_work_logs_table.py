from app.core.database import engine
from sqlalchemy import text

def create_work_logs_table():
    try:
        with engine.connect() as conn:
            # Create work_logs table
            conn.execute(text('''
                CREATE TABLE IF NOT EXISTS work_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    equipment_id INTEGER NOT NULL,
                    project_id INTEGER,
                    input_method VARCHAR(10) DEFAULT 'HM',
                    hm_start DECIMAL(10, 2),
                    hm_end DECIMAL(10, 2),
                    total_hours DECIMAL(10, 2) NOT NULL,
                    operator_name VARCHAR(100),
                    work_description VARCHAR(500),
                    work_date DATETIME NOT NULL,
                    recorded_by INTEGER,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME,
                    FOREIGN KEY (equipment_id) REFERENCES equipment (id),
                    FOREIGN KEY (project_id) REFERENCES projects (id),
                    FOREIGN KEY (recorded_by) REFERENCES users (id)
                )
            '''))
            conn.commit()
            print('Work logs table created successfully!')
            
            # Verify the table structure
            result = conn.execute(text('PRAGMA table_info(work_logs)'))
            columns = result.fetchall()
            print('Work logs table structure:')
            for col in columns:
                print(f'  {col}')
                
    except Exception as e:
        print(f'Error: {e}')
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    create_work_logs_table()
