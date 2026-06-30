from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from app.core.database import Base

class SearchHistory(Base):
    __tablename__ = "search_history"
    
    id = Column(Integer, primary_key=True, index=True)
    query = Column(String(500), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<SearchHistory(id={self.id}, query={self.query})>"