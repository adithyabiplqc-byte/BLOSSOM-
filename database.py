from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    usercode = Column(String(50), unique=True, nullable=False)
    username = Column(String(100), nullable=False)
    password = Column(String(100), nullable=False)
    role = Column(String(50), nullable=False)
    location = Column(String(100), nullable=False)
    restrictions = Column(JSON, default=[])
    timestamp = Column(String(50), nullable=True)
    createdAt = Column(DateTime, default=datetime.datetime.utcnow)

class UserSetting(Base):
    __tablename__ = 'user_settings'
    id = Column(Integer, primary_key=True)
    usercode = Column(String(50), ForeignKey('users.usercode'), unique=True, nullable=False)
    settings = Column(JSON, nullable=False)

class Workorder(Base):
    __tablename__ = 'workorders'
    id = Column(Integer, primary_key=True)
    zone = Column(String(100))
    workorderNumber = Column(String(100), unique=True)
    item = Column(String(200))
    style = Column(String(200))
    sizeRange = Column(String(100))
    quantity = Column(Integer)
    colour = Column(String(100))
    createdAt = Column(DateTime, default=datetime.datetime.utcnow)

class MaterialReport(Base):
    __tablename__ = 'material_reports'
    id = Column(Integer, primary_key=True)
    data = Column(JSON)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class CuttingReport(Base):
    __tablename__ = 'cutting_reports'
    id = Column(Integer, primary_key=True)
    data = Column(JSON)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class InlineReport(Base):
    __tablename__ = 'inline_reports'
    id = Column(Integer, primary_key=True)
    data = Column(JSON)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class EndlineReport(Base):
    __tablename__ = 'endline_reports'
    id = Column(Integer, primary_key=True)
    data = Column(JSON)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class AQLReport(Base):
    __tablename__ = 'aql_reports'
    id = Column(Integer, primary_key=True)
    data = Column(JSON)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class FinalAuditReport(Base):
    __tablename__ = 'final_audit_reports'
    id = Column(Integer, primary_key=True)
    data = Column(JSON)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class AdminLog(Base):
    __tablename__ = 'admin_logs'
    id = Column(Integer, primary_key=True)
    admin = Column(String(100))
    action = Column(String(100))
    details = Column(Text)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

engine = create_engine('sqlite:///bqos.db')
Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)
