"""
Initialize database tables and create default admin user
"""
from app.database import engine, Base, SessionLocal
from app.models.staff import Staff
from app.models.ticket import Ticket
from app.models.comment import Comment

def init_database():
    """Create all database tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

def create_default_admin():
    """Create default admin user if not exists"""
    db = SessionLocal()
    try:
        # Check if admin already exists
        admin = db.query(Staff).filter(Staff.username == "admin").first()
        if admin:
            print("Admin user already exists!")
            return

        # Create default admin user
        admin = Staff(
            username="admin",
            name="System Administrator",
            father_name="N/A",
            address="System",
            mobile_number="0000000000",
            role="admin",
            permissions={"all": True},
            is_active=True
        )
        admin.set_password("admin123")

        db.add(admin)
        db.commit()
        print("Default admin user created successfully!")
        print("Username: admin")
        print("Password: admin123")
        print("\n⚠️  IMPORTANT: Please change the default password after first login!")

    except Exception as e:
        print(f"Error creating admin user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_database()
    create_default_admin()
    print("\n✅ Database initialization complete!")
