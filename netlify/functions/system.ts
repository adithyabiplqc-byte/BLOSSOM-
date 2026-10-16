const FIREBASE_PROJECT_ID = "gen-lang-client-0333084315";

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

export const handler = async (event: any) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const path = event.path || '';
  const isMaintenance = path.includes('/maintenance');
  const isHeartbeat = path.includes('/heartbeat');
  const isOnlineUsers = path.includes('/online-users');
  const isLogout = path.includes('/presence/logout');

  // Handle Maintenance
  if (isMaintenance) {
    if (event.httpMethod === 'POST') {
      try {
        const payload = JSON.parse(event.body || '{}');
        const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/system_config/maintenance`;
        
        await fetch(firestoreUrl, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fields: {
              enabled: { booleanValue: !!payload.enabled },
              message: { stringValue: payload.message || 'System is currently undergoing scheduled maintenance. Please check back shortly.' },
              setAt: { stringValue: payload.setAt || new Date().toISOString() },
              setBy: { stringValue: payload.setBy || 'ADMIN' }
            }
          })
        });

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            maintenance: {
              enabled: !!payload.enabled,
              message: payload.message || 'System is currently undergoing scheduled maintenance. Please check back shortly.',
              setAt: payload.setAt || new Date().toISOString(),
              setBy: payload.setBy || 'ADMIN'
            }
          })
        };
      } catch (e: any) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, error: e.message })
        };
      }
    } else {
      // GET maintenance
      try {
        const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/system_config/maintenance`;
        const res = await fetch(firestoreUrl);
        if (res.ok) {
          const doc = await res.json();
          const f = doc.fields || {};
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              maintenance: {
                enabled: !!f.enabled?.booleanValue,
                message: f.message?.stringValue || 'System is currently undergoing scheduled maintenance. Please check back shortly.',
                setAt: f.setAt?.stringValue || '',
                setBy: f.setBy?.stringValue || ''
              }
            })
          };
        }
      } catch (e) {}

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          maintenance: {
            enabled: false,
            message: 'System is currently undergoing scheduled maintenance. Please check back shortly.',
            setAt: '',
            setBy: ''
          }
        })
      };
    }
  }

  // Handle Heartbeat
  if (isHeartbeat && event.httpMethod === 'POST') {
    try {
      const payload = JSON.parse(event.body || '{}');
      const userCode = String(payload.userCode || payload.username || '').trim().toUpperCase();
      if (userCode) {
        const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/presence/${userCode}`;
        await fetch(firestoreUrl, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fields: {
              id: { stringValue: userCode },
              userCode: { stringValue: payload.userCode || userCode },
              username: { stringValue: payload.username || userCode },
              role: { stringValue: payload.role || 'USER' },
              zone: { stringValue: payload.zone || 'ALL' },
              location: { stringValue: payload.location || 'SYSTEM' },
              lastSeen: { integerValue: String(Date.now()) },
              online: { booleanValue: true }
            }
          })
        });
      }

      // Check maintenance status in response
      let maintenance = {
        enabled: false,
        message: 'System is currently undergoing scheduled maintenance. Please check back shortly.',
        setAt: '',
        setBy: ''
      };
      try {
        const mRes = await fetch(`https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/system_config/maintenance`);
        if (mRes.ok) {
          const mDoc = await mRes.json();
          const f = mDoc.fields || {};
          maintenance = {
            enabled: !!f.enabled?.booleanValue,
            message: f.message?.stringValue || maintenance.message,
            setAt: f.setAt?.stringValue || '',
            setBy: f.setBy?.stringValue || ''
          };
        }
      } catch (e) {}

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          online: true,
          maintenance
        })
      };
    } catch (e: any) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true })
      };
    }
  }

  // Handle Online Users
  if (isOnlineUsers) {
    try {
      const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/presence`;
      const res = await fetch(firestoreUrl);
      const users: any[] = [];
      const now = Date.now();

      if (res.ok) {
        const data = await res.json();
        const docs = data.documents || [];
        docs.forEach((doc: any) => {
          const f = doc.fields || {};
          const lastSeen = Number(f.lastSeen?.integerValue || 0);
          const online = f.online ? f.online.booleanValue : true;
          if (online && (now - lastSeen < 75000)) {
            const userCode = f.userCode?.stringValue || f.id?.stringValue || '';
            users.push({
              id: userCode,
              userCode,
              username: f.username?.stringValue || userCode,
              role: f.role?.stringValue || 'USER',
              zone: f.zone?.stringValue || 'ALL',
              location: f.location?.stringValue || 'SYSTEM',
              lastSeen,
              online: true
            });
          }
        });
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          count: users.length,
          users
        })
      };
    } catch (e: any) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, count: 0, users: [] })
      };
    }
  }

  // Handle Logout
  if (isLogout && event.httpMethod === 'POST') {
    try {
      const payload = JSON.parse(event.body || '{}');
      const userCode = String(payload.userCode || payload.username || '').trim().toUpperCase();
      if (userCode) {
        const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/presence/${userCode}`;
        await fetch(firestoreUrl, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fields: {
              online: { booleanValue: false },
              lastSeen: { integerValue: String(Date.now()) }
            }
          })
        });
      }
    } catch (e) {}

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true })
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ success: true, message: 'System API endpoint' })
  };
};
