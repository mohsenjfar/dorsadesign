# backend/seed_data.py
"""Seed database with sample projects"""
from app.database import SessionLocal
from app.crud import project_crud
from app.schemas.project import ProjectCreate
from app.models.project import ProjectType, ProjectStatus
import uuid

def seed_projects():
    """Add sample projects to database"""
    db = SessionLocal()
    
    sample_projects = [
        {
            "title": "Pars Residential Tower",
            "slug": "pars-residential-tower",
            "description": "A luxury residential tower in North Tehran with modern architecture",
            "full_description": "This 20-story residential tower features 80 luxury units with panoramic views of the city. The project includes a rooftop garden, swimming pool, and 24/7 security.",
            "project_type": ProjectType.RESIDENTIAL,
            "client_name": "Pars Construction Co.",
            "year": "1402",
            "area": "12000",
            "status": ProjectStatus.PUBLISHED,
            "cover_image": "/uploads/pars-tower.jpg",
            "gallery_images": "/uploads/pars-1.jpg,/uploads/pars-2.jpg,/uploads/pars-3.jpg",
            "is_featured": True,
        },
        {
            "title": "Shafa Office Building",
            "slug": "shafa-office-building",
            "description": "Modern office building with green architecture",
            "full_description": "An innovative office building with sustainable design features including solar panels, green walls, and energy-efficient systems.",
            "project_type": ProjectType.OFFICE,
            "client_name": "Shafa Investment Group",
            "year": "1401",
            "area": "8500",
            "status": ProjectStatus.PUBLISHED,
            "cover_image": "/uploads/shafa-office.jpg",
            "gallery_images": "/uploads/shafa-1.jpg,/uploads/shafa-2.jpg",
            "is_featured": True,
        },
        {
            "title": "Lavizan Villa",
            "slug": "lavizan-villa",
            "description": "Contemporary villa with traditional Iranian elements",
            "full_description": "A stunning 3-story villa that combines modern architecture with traditional Persian design elements. Features include a central courtyard, water features, and panoramic mountain views.",
            "project_type": ProjectType.VILLA,
            "client_name": "Mr. Karimi",
            "year": "1403",
            "area": "2500",
            "status": ProjectStatus.PUBLISHED,
            "cover_image": "/uploads/lavizan-villa.jpg",
            "gallery_images": "/uploads/lavizan-1.jpg,/uploads/lavizan-2.jpg,/uploads/lavizan-3.jpg",
            "is_featured": False,
        },
    ]
    
    for data in sample_projects:
        project_in = ProjectCreate(**data)
        project_crud.create(db, obj_in=project_in)
        print(f"✅ Created project: {data['title']}")
    
    db.close()
    print("🎉 Sample projects seeded successfully!")

if __name__ == "__main__":
    seed_projects()