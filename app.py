from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from database import Session, User, UserSetting, Workorder, MaterialReport, CuttingReport, InlineReport, EndlineReport, AQLReport, FinalAuditReport, AdminLog
import os
import datetime
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_session():
    return Session()

def to_dict(obj):
    if obj is None:
        return None
    d = {}
    for column in obj.__table__.columns:
        val = getattr(obj, column.name)
        if isinstance(val, datetime.datetime):
            val = val.isoformat()
        d[column.name] = val
    return d

@app.post("/api/{method}")
async def api_dispatcher(method: str, request: Request):
    session = get_session()
    try:
        try:
            data = await request.json()
        except:
            data = {}
        
        args = data.get('args', [])
        print(f"API Call: {method}, args: {args}")
        
        if method == 'api_getInitialData':
            user_code = args[0] if args else None
            users = session.query(User).all()
            user_list = [{
                'usercode': u.usercode,
                'username': u.username,
                'password': u.password,
                'role': u.role,
                'location': u.location,
                'restrictions': u.restrictions,
                'timestamp': u.timestamp
            } for u in users]
            
            if not user_list:
                default_admin = User(usercode='U001', username='admin', password='admin123', role='ADMIN', location='SYSTEM', restrictions=[], timestamp=datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
                session.add(default_admin)
                session.commit()
                user_list.append({
                    'usercode': 'U001',
                    'username': 'admin',
                    'password': 'admin123',
                    'role': 'ADMIN',
                    'location': 'SYSTEM',
                    'restrictions': [],
                    'timestamp': default_admin.timestamp
                })
            
            workorders = []
            settings = None
            if user_code:
                wos = session.query(Workorder).all()
                workorders = [{
                    'id': w.id,
                    'zone': w.zone,
                    'workorderNumber': w.workorderNumber,
                    'item': w.item,
                    'style': w.style,
                    'sizeRange': w.sizeRange,
                    'quantity': w.quantity,
                    'colour': w.colour,
                    'createdAt': w.createdAt.isoformat()
                } for w in wos]
                
                user_setting = session.query(UserSetting).filter_by(usercode=user_code).first()
                if user_setting:
                    settings = user_setting.settings
            
            return {
                'users': user_list,
                'workorders': workorders,
                'settings': settings,
                'serverTime': datetime.datetime.now().isoformat()
            }

        elif method == 'api_saveUser':
            user_data = args[0]
            new_user = User(
                usercode=user_data['usercode'],
                username=user_data['username'],
                password=user_data['password'],
                role=user_data['role'],
                location=user_data['location'],
                restrictions=user_data.get('restrictions', []),
                timestamp=user_data.get('timestamp', datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
            )
            session.add(new_user)
            session.commit()
            return {'success': True}

        elif method == 'api_getUsers':
            users = session.query(User).all()
            return [{
                'usercode': u.usercode,
                'username': u.username,
                'password': u.password,
                'role': u.role,
                'location': u.location,
                'restrictions': u.restrictions,
                'timestamp': u.timestamp
            } for u in users]

        elif method == 'api_getUserSettings':
            user_code = args[0]
            setting = session.query(UserSetting).filter_by(usercode=user_code).first()
            return setting.settings if setting else None

        elif method == 'api_saveSettings':
            user_code = args[0]
            settings_data = args[1]
            if user_code == 'GLOBAL':
                # For now, we don't persist global settings in DB, just return success
                # In a real app, you'd have a GlobalSettings table
                return {'success': True}
            
            setting = session.query(UserSetting).filter_by(usercode=user_code).first()
            if setting:
                setting.settings = settings_data
            else:
                new_setting = UserSetting(usercode=user_code, settings=settings_data)
                session.add(new_setting)
            session.commit()
            return {'success': True}

        elif method == 'api_updateUser':
            updated_user = args[0]
            user = session.query(User).filter_by(usercode=updated_user['usercode']).first()
            if user:
                user.username = updated_user['username']
                user.password = updated_user['password']
                user.role = updated_user['role']
                user.location = updated_user['location']
                user.restrictions = updated_user.get('restrictions', [])
                if 'timestamp' in updated_user:
                    user.timestamp = updated_user['timestamp']
                session.commit()
                return {'success': True}
            return {'success': False, 'error': 'User not found'}

        elif method == 'api_deleteUser':
            user_code = args[0]
            user = session.query(User).filter_by(usercode=user_code).first()
            if user:
                session.delete(user)
                session.commit()
                return {'success': True}
            return {'success': False, 'error': 'User not found'}

        elif method == 'api_clearAllUsers':
            admin_username = args[0]
            session.query(User).filter(User.username != 'admin', User.username != admin_username).delete()
            session.commit()
            return {'success': True}

        elif method == 'api_saveWorkorder':
            wo_data = args[0]
            new_wo = Workorder(
                zone=wo_data.get('zone'),
                workorderNumber=wo_data.get('workorderNumber'),
                item=wo_data.get('item'),
                style=wo_data.get('style'),
                sizeRange=wo_data.get('sizeRange'),
                quantity=wo_data.get('quantity'),
                colour=wo_data.get('colour')
            )
            session.add(new_wo)
            session.commit()
            return {'success': True}

        elif method == 'api_getWorkorders':
            wos = session.query(Workorder).all()
            return [{
                'id': w.id,
                'zone': w.zone,
                'workorderNumber': w.workorderNumber,
                'item': w.item,
                'style': w.style,
                'sizeRange': w.sizeRange,
                'quantity': w.quantity,
                'colour': w.colour,
                'createdAt': w.createdAt.isoformat()
            } for w in wos]

        elif method == 'api_updateWorkorder':
            updated_wo = args[0]
            wo = session.query(Workorder).filter_by(id=updated_wo['id']).first()
            if wo:
                wo.zone = updated_wo.get('zone')
                wo.workorderNumber = updated_wo.get('workorderNumber')
                wo.item = updated_wo.get('item')
                wo.style = updated_wo.get('style')
                wo.sizeRange = updated_wo.get('sizeRange')
                wo.quantity = updated_wo.get('quantity')
                wo.colour = updated_wo.get('colour')
                session.commit()
                return {'success': True}
            return {'success': False, 'error': 'Workorder not found'}

        elif method == 'api_deleteWorkorder':
            wo_id = args[0]
            wo = session.query(Workorder).filter_by(id=wo_id).first()
            if wo:
                session.delete(wo)
                session.commit()
                return {'success': True}
            return {'success': False, 'error': 'Workorder not found'}

        elif method in ['api_saveMaterialReport', 'api_saveCuttingReport', 'api_saveInlineReport', 'api_saveEndlineReport', 'api_saveAQLReport', 'api_saveFinalAudit']:
            report_data = args[0]
            model_map = {
                'api_saveMaterialReport': MaterialReport,
                'api_saveCuttingReport': CuttingReport,
                'api_saveInlineReport': InlineReport,
                'api_saveEndlineReport': EndlineReport,
                'api_saveAQLReport': AQLReport,
                'api_saveFinalAudit': FinalAuditReport
            }
            new_report = model_map[method](data=report_data)
            session.add(new_report)
            session.commit()
            return {'success': True}

        elif method in ['api_getMaterialData', 'api_getCuttingData', 'api_getInlineData', 'api_getEndlineData', 'api_getAQLData', 'api_getFinalAuditData']:
            model_map = {
                'api_getMaterialData': MaterialReport,
                'api_getCuttingData': CuttingReport,
                'api_getInlineData': InlineReport,
                'api_getEndlineData': EndlineReport,
                'api_getAQLData': AQLReport,
                'api_getFinalAuditData': FinalAuditReport
            }
            reports = session.query(model_map[method]).all()
            return [{**r.data, 'id': r.id, 'timestamp': r.timestamp.isoformat()} for r in reports]

        elif method in ['api_deleteMaterialData', 'api_deleteCuttingData', 'api_deleteInlineData', 'api_deleteEndlineData', 'api_deleteAQLData', 'api_deleteFinalAuditData']:
            report_id = args[0]
            model_map = {
                'api_deleteMaterialData': MaterialReport,
                'api_deleteCuttingData': CuttingReport,
                'api_deleteInlineData': InlineReport,
                'api_deleteEndlineData': EndlineReport,
                'api_deleteAQLData': AQLReport,
                'api_deleteFinalAuditData': FinalAuditReport
            }
            report = session.query(model_map[method]).filter_by(id=report_id).first()
            if report:
                session.delete(report)
                session.commit()
                return {'success': True}
            return {'success': False, 'error': 'Report not found'}

        elif method == 'api_logAdminActivity':
            log_data = args[0]
            new_log = AdminLog(
                admin=log_data['admin'],
                action=log_data['action'],
                details=log_data['details']
            )
            session.add(new_log)
            session.commit()
            return {'success': True}

        elif method == 'api_getGlobalSettings':
            return {
                'systemName': 'BQOS',
                'version': '2.0.0',
                'maintenanceMode': False,
                'allowUserRegistration': False,
                'defaultLocation': 'HEAD OFFICE'
            }

        elif method == 'api_getAdminLogs':
            logs = session.query(AdminLog).order_by(AdminLog.timestamp.desc()).all()
            return [{
                'id': l.id,
                'admin': l.admin,
                'action': l.action,
                'details': l.details,
                'timestamp': l.timestamp.isoformat()
            } for l in logs]

        raise HTTPException(status_code=404, detail="Method not found")

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()

@app.get("/health")
async def health():
    return {'status': 'ok'}

# Serve static files
if os.path.exists("dist"):
    app.mount("/assets", StaticFiles(directory="dist/assets"), name="assets")

@app.get("/{path_name:path}")
async def catch_all(path_name: str):
    # Check if it's an API route first (though @app.post handles /api/...)
    if path_name.startswith("api/"):
         raise HTTPException(status_code=404)
         
    # Try to serve from dist first if it exists, otherwise root
    if os.path.exists("dist"):
        file_path = os.path.join("dist", path_name)
        if path_name != "" and os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        if path_name == "" or not os.path.exists(file_path):
            return FileResponse("dist/index.html")
            
    # Fallback to root index.html
    file_path = os.path.join(os.getcwd(), path_name)
    if path_name != "" and os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)
    return FileResponse("index.html")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3000)
