# backend/test_model.py
from app.database import SessionLocal
from app.models import Project, ProjectType, ProjectStatus
import uuid

def test_create_project():
    """Test creating a sample project"""
    db = SessionLocal()
    
    try:
        # Create sample project
        project = Project(
            id=uuid.uuid4(),
            title="Pars Residential Tower",
            slug="pars-residential-tower",
            description="A luxury residential tower in North Tehran",
            full_description="This project includes 20 residential units with full amenities...",
            project_type=ProjectType.RESIDENTIAL,
            client_name="Pars Construction Company",
            year="1402",
            area="5000",
            status=ProjectStatus.PUBLISHED,
            cover_image="/uploads/projects/pars-cover.jpg",
            gallery_images="/uploads/projects/pars-1.jpg,/uploads/projects/pars-2.jpg",
            is_featured=True,
        )
        
        db.add(project)
        db.commit()
        db.refresh(project)
        
        print(f"✅ Project created: {project.title}")
        print(f"   ID: {project.id}")
        print(f"   Slug: {project.slug}")
        print(f"   Type: {project.project_type}")
        print(f"   Status: {project.status}")
        
        return project
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        return None
    finally:
        db.close()

if __name__ == "__main__":
    test_create_project()