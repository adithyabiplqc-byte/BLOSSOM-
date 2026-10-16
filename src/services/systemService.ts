import { doc, getDoc, setDoc, deleteDoc, collection, onSnapshot } from 'firebase/firestore';
import { db } from './auth';

export interface MaintenanceState {
  enabled: boolean;
  message: string;
  setAt: string;
  setBy: string;
}

export interface ActiveUserRecord {
  id: string;
  userCode: string;
  username: string;
  role: string;
  zone: string;
  location: string;
  lastSeen: number;
  online?: boolean;
}

const DEFAULT_MAINTENANCE: MaintenanceState = {
  enabled: false,
  message: 'System is currently undergoing scheduled maintenance. Please check back shortly.',
  setAt: '',
  setBy: ''
};

class SystemService {
  private currentMaintenance: MaintenanceState = DEFAULT_MAINTENANCE;
  private onlineUsers: Map<string, ActiveUserRecord> = new Map();
  private maintenanceListeners: Set<(m: MaintenanceState) => void> = new Set();
  private presenceListeners: Set<(users: ActiveUserRecord[], count: number) => void> = new Set();
  private heartbeatTimer: any = null;
  private activeUser: any = null;
  private isFirestoreMaintenanceListening = false;
  private isFirestorePresenceListening = false;

  constructor() {
    // Load cached maintenance
    try {
      const cached = localStorage.getItem('bqos_maintenance');
      if (cached) {
        this.currentMaintenance = { ...DEFAULT_MAINTENANCE, ...JSON.parse(cached) };
      }
    } catch (e) {}

    // Attach unload listener to mark offline on tab close
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        if (this.activeUser) {
          const code = String(this.activeUser.userCode || this.activeUser.username || '').trim().toUpperCase();
          if (code) {
            try {
              // Best-effort Firestore beacon/update
              const docRef = doc(db, 'presence', code);
              setDoc(docRef, { online: false, lastSeen: Date.now() }, { merge: true }).catch(() => {});
            } catch (e) {}
            try {
              if (navigator.sendBeacon) {
                navigator.sendBeacon('/api/system/presence/logout', JSON.stringify({ userCode: code }));
              }
            } catch (e) {}
          }
        }
      });
    }

    // Initialize real-time listeners
    this.initFirestoreListeners();
  }

  private initFirestoreListeners() {
    // 1. Maintenance Listener
    if (!this.isFirestoreMaintenanceListening) {
      try {
        const maintDocRef = doc(db, 'system_config', 'maintenance');
        onSnapshot(maintDocRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data() as any;
            const updated: MaintenanceState = {
              enabled: !!data.enabled,
              message: data.message || DEFAULT_MAINTENANCE.message,
              setAt: data.setAt || new Date().toISOString(),
              setBy: data.setBy || 'ADMIN'
            };
            this.currentMaintenance = updated;
            try { localStorage.setItem('bqos_maintenance', JSON.stringify(updated)); } catch (e) {}
            this.notifyMaintenanceListeners();
          }
        }, (err) => {
          console.warn('[SYSTEM] Firestore maintenance listener fallback:', err?.message);
        });
        this.isFirestoreMaintenanceListening = true;
      } catch (e) {
        console.warn('[SYSTEM] Failed to bind Firestore maintenance listener:', e);
      }
    }

    // 2. Presence Listener
    if (!this.isFirestorePresenceListening) {
      try {
        const presenceColRef = collection(db, 'presence');
        onSnapshot(presenceColRef, (snap) => {
          const now = Date.now();
          const activeMap = new Map<string, ActiveUserRecord>();
          
          snap.forEach((d) => {
            const data = d.data() as any;
            const lastSeen = Number(data.lastSeen) || 0;
            // Consider active if updated within the last 75 seconds and not explicitly offline
            if (data.online !== false && (now - lastSeen < 75000)) {
              const code = String(data.userCode || d.id || '').trim().toUpperCase();
              if (code) {
                activeMap.set(code, {
                  id: code,
                  userCode: data.userCode || code,
                  username: data.username || code,
                  role: String(data.role || 'USER').toUpperCase(),
                  zone: data.zone || 'ALL',
                  location: data.location || 'SYSTEM',
                  lastSeen: lastSeen || now,
                  online: true
                });
              }
            }
          });

          // Always ensure current user is present if logged in
          if (this.activeUser) {
            const myCode = String(this.activeUser.userCode || this.activeUser.username || '').trim().toUpperCase();
            if (myCode && !activeMap.has(myCode)) {
              activeMap.set(myCode, {
                id: myCode,
                userCode: this.activeUser.userCode || myCode,
                username: this.activeUser.username || myCode,
                role: String(this.activeUser.role || 'USER').toUpperCase(),
                zone: this.activeUser.zone || this.activeUser.location || 'ALL',
                location: this.activeUser.location || 'SYSTEM',
                lastSeen: now,
                online: true
              });
            }
          }

          this.onlineUsers = activeMap;
          this.notifyPresenceListeners();
        }, (err) => {
          console.warn('[SYSTEM] Firestore presence listener fallback:', err?.message);
        });
        this.isFirestorePresenceListening = true;
      } catch (e) {
        console.warn('[SYSTEM] Failed to bind Firestore presence listener:', e);
      }
    }
  }

  public getCachedMaintenance(): MaintenanceState {
    return { ...this.currentMaintenance };
  }

  public getCachedOnlineUsers(): ActiveUserRecord[] {
    return Array.from(this.onlineUsers.values());
  }

  public subscribeMaintenance(cb: (m: MaintenanceState) => void): () => void {
    this.maintenanceListeners.add(cb);
    // Call immediately with current state
    cb(this.getCachedMaintenance());
    // Also trigger background fetch
    this.fetchMaintenanceStatus().catch(() => {});
    return () => {
      this.maintenanceListeners.delete(cb);
    };
  }

  public subscribeOnlineUsers(cb: (users: ActiveUserRecord[], count: number) => void): () => void {
    this.presenceListeners.add(cb);
    // Call immediately
    const list = this.getCachedOnlineUsers();
    cb(list, list.length);
    // Also trigger background fetch
    this.fetchOnlineUsers().catch(() => {});
    return () => {
      this.presenceListeners.delete(cb);
    };
  }

  private notifyMaintenanceListeners() {
    const state = this.getCachedMaintenance();
    this.maintenanceListeners.forEach(cb => {
      try { cb(state); } catch (e) {}
    });
  }

  private notifyPresenceListeners() {
    const list = this.getCachedOnlineUsers();
    const count = list.length;
    this.presenceListeners.forEach(cb => {
      try { cb(list, count); } catch (e) {}
    });
  }

  public async fetchMaintenanceStatus(): Promise<MaintenanceState> {
    // 1. Try Firestore direct first (works 100% on Netlify)
    try {
      const maintDocRef = doc(db, 'system_config', 'maintenance');
      const snap = await getDoc(maintDocRef);
      if (snap.exists()) {
        const data = snap.data() as any;
        const updated: MaintenanceState = {
          enabled: !!data.enabled,
          message: data.message || DEFAULT_MAINTENANCE.message,
          setAt: data.setAt || new Date().toISOString(),
          setBy: data.setBy || 'ADMIN'
        };
        this.currentMaintenance = updated;
        try { localStorage.setItem('bqos_maintenance', JSON.stringify(updated)); } catch (e) {}
        this.notifyMaintenanceListeners();
        return updated;
      }
    } catch (e) {
      // Ignore and fallback
    }

    // 2. Try server route
    try {
      const res = await fetch('/api/system/maintenance');
      if (res.ok) {
        const data = await res.json();
        if (data?.maintenance) {
          const updated: MaintenanceState = {
            enabled: !!data.maintenance.enabled,
            message: data.maintenance.message || DEFAULT_MAINTENANCE.message,
            setAt: data.maintenance.setAt || new Date().toISOString(),
            setBy: data.maintenance.setBy || 'ADMIN'
          };
          this.currentMaintenance = updated;
          try { localStorage.setItem('bqos_maintenance', JSON.stringify(updated)); } catch (e) {}
          this.notifyMaintenanceListeners();
          return updated;
        }
      }
    } catch (e) {}

    return this.getCachedMaintenance();
  }

  public async setMaintenanceStatus(payload: { enabled: boolean; message: string; setBy?: string }): Promise<MaintenanceState> {
    const updated: MaintenanceState = {
      enabled: !!payload.enabled,
      message: payload.message?.trim() || DEFAULT_MAINTENANCE.message,
      setAt: new Date().toISOString(),
      setBy: payload.setBy || 'ADMIN'
    };

    // Instant local update
    this.currentMaintenance = updated;
    try { localStorage.setItem('bqos_maintenance', JSON.stringify(updated)); } catch (e) {}
    this.notifyMaintenanceListeners();

    // 1. Write to Firestore (immediately notifies all Netlify and local users in real-time)
    try {
      const maintDocRef = doc(db, 'system_config', 'maintenance');
      await setDoc(maintDocRef, updated, { merge: true });
    } catch (e) {
      console.warn('[SYSTEM] Firestore setDoc maintenance notice:', e);
    }

    // 2. Send to backend server REST endpoint
    try {
      await fetch('/api/system/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch (e) {}

    return updated;
  }

  public async registerPresence(user: any): Promise<void> {
    if (!user) return;
    this.activeUser = user;
    const userCode = String(user.userCode || user.username || '').trim().toUpperCase();
    if (!userCode) return;

    const record: ActiveUserRecord = {
      id: userCode,
      userCode: user.userCode || userCode,
      username: user.username || userCode,
      role: String(user.role || 'USER').toUpperCase(),
      zone: user.zone || user.location || 'ALL',
      location: user.location || user.zone || 'SYSTEM',
      lastSeen: Date.now(),
      online: true
    };

    // Add to local map immediately
    this.onlineUsers.set(userCode, record);
    this.notifyPresenceListeners();

    // 1. Sync to Firestore presence document
    try {
      const userDocRef = doc(db, 'presence', userCode);
      await setDoc(userDocRef, {
        ...record,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.warn('[SYSTEM] Firestore registerPresence notice:', e);
    }

    // 2. Send to REST heartbeat
    try {
      await fetch('/api/system/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      });
    } catch (e) {}

    // Start recurring heartbeat (every 15s)
    this.startHeartbeatLoop();
  }

  private startHeartbeatLoop() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = setInterval(async () => {
      if (!this.activeUser) return;
      const userCode = String(this.activeUser.userCode || this.activeUser.username || '').trim().toUpperCase();
      if (!userCode) return;

      const now = Date.now();
      const updatedRecord: Partial<ActiveUserRecord> = {
        lastSeen: now,
        online: true
      };

      // Firestore ping
      try {
        const userDocRef = doc(db, 'presence', userCode);
        await setDoc(userDocRef, {
          lastSeen: now,
          online: true,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (e) {}

      // Server REST ping
      try {
        const res = await fetch('/api/system/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userCode,
            username: this.activeUser.username,
            role: this.activeUser.role,
            zone: this.activeUser.zone || this.activeUser.location || 'ALL',
            location: this.activeUser.location || 'SYSTEM'
          })
        });
        if (res.ok) {
          const hbData = await res.json();
          if (hbData?.maintenance) {
            this.currentMaintenance = hbData.maintenance;
            this.notifyMaintenanceListeners();
          }
        }
      } catch (e) {}
    }, 15000);
  }

  public async unregisterPresence(user?: any): Promise<void> {
    const target = user || this.activeUser;
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    this.activeUser = null;

    if (!target) return;
    const userCode = String(target.userCode || target.username || '').trim().toUpperCase();
    if (!userCode) return;

    this.onlineUsers.delete(userCode);
    this.notifyPresenceListeners();

    // 1. Mark offline in Firestore
    try {
      const userDocRef = doc(db, 'presence', userCode);
      await setDoc(userDocRef, {
        online: false,
        lastSeen: Date.now(),
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {}

    // 2. Server REST logout
    try {
      await fetch('/api/system/presence/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userCode })
      });
    } catch (e) {}
  }

  public async fetchOnlineUsers(): Promise<ActiveUserRecord[]> {
    const now = Date.now();
    const activeMap = new Map<string, ActiveUserRecord>();

    // 1. Query from Firestore collection directly
    try {
      const presenceColRef = collection(db, 'presence');
      // Fetch via Firestore
      const snap = await new Promise<any>((resolve, reject) => {
        const unsub = onSnapshot(presenceColRef, (s) => {
          unsub();
          resolve(s);
        }, reject);
      });

      snap.forEach((d: any) => {
        const data = d.data() as any;
        const lastSeen = Number(data.lastSeen) || 0;
        if (data.online !== false && (now - lastSeen < 75000)) {
          const code = String(data.userCode || d.id || '').trim().toUpperCase();
          if (code) {
            activeMap.set(code, {
              id: code,
              userCode: data.userCode || code,
              username: data.username || code,
              role: String(data.role || 'USER').toUpperCase(),
              zone: data.zone || 'ALL',
              location: data.location || 'SYSTEM',
              lastSeen: lastSeen || now,
              online: true
            });
          }
        }
      });
    } catch (e) {
      // Ignore and fallback to server
    }

    // 2. Query from server
    if (activeMap.size === 0) {
      try {
        const res = await fetch('/api/system/online-users');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data?.users)) {
            data.users.forEach((u: any) => {
              const code = String(u.userCode || u.username || '').trim().toUpperCase();
              if (code) {
                activeMap.set(code, {
                  id: code,
                  userCode: u.userCode || code,
                  username: u.username || code,
                  role: String(u.role || 'USER').toUpperCase(),
                  zone: u.zone || 'ALL',
                  location: u.location || 'SYSTEM',
                  lastSeen: Number(u.lastSeen) || now,
                  online: true
                });
              }
            });
          }
        }
      } catch (e) {}
    }

    // Always include current active user
    if (this.activeUser) {
      const myCode = String(this.activeUser.userCode || this.activeUser.username || '').trim().toUpperCase();
      if (myCode && !activeMap.has(myCode)) {
        activeMap.set(myCode, {
          id: myCode,
          userCode: this.activeUser.userCode || myCode,
          username: this.activeUser.username || myCode,
          role: String(this.activeUser.role || 'USER').toUpperCase(),
          zone: this.activeUser.zone || this.activeUser.location || 'ALL',
          location: this.activeUser.location || 'SYSTEM',
          lastSeen: now,
          online: true
        });
      }
    }

    this.onlineUsers = activeMap;
    this.notifyPresenceListeners();
    return Array.from(activeMap.values());
  }
}

export const systemService = new SystemService();
