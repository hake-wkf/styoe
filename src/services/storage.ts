import { Personnel, AccessLog, DoorLockState } from '../types/faceMachine';
import adminFaceImg from '../assets/images/face_admin_user_1790128160118.jpg';

const STORAGE_KEYS = {
  PERSONNEL: 'smart_home_face_personnel_v2',
  DOOR_STATE: 'smart_home_door_state_v2',
  ACCESS_LOGS: 'smart_home_access_logs_v2',
};

const INITIAL_PERSONNEL: Personnel[] = [
  {
    id: '1001',
    name: '张建国',
    userType: 'admin',
    faceImage: adminFaceImg,
    createdAt: '2026-09-10 09:30',
  },
  {
    id: '1002',
    name: '李婷',
    userType: 'regular',
    faceImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    createdAt: '2026-09-12 14:15',
  },
  {
    id: '1003',
    name: '张浩',
    userType: 'regular',
    faceImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    createdAt: '2026-09-15 16:40',
  },
  {
    id: '1004',
    name: '王明',
    userType: 'admin',
    faceImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    createdAt: '2026-09-18 10:20',
  },
  {
    id: '1005',
    name: '陈霞',
    userType: 'regular',
    faceImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    createdAt: '2026-09-20 08:00',
  },
];

const INITIAL_LOGS: AccessLog[] = [
  {
    id: 'LOG-001',
    timestamp: '2026-09-22 18:20:14',
    date: '2026-09-22',
    time: '18:20:14',
    type: 'face',
    personnelName: '张建国',
    userType: 'admin',
    success: true,
  },
  {
    id: 'LOG-002',
    timestamp: '2026-09-22 16:45:30',
    date: '2026-09-22',
    time: '16:45:30',
    type: 'remote',
    personnelName: '远程开门',
    userType: 'admin',
    success: true,
  },
  {
    id: 'LOG-003',
    timestamp: '2026-09-22 12:30:05',
    date: '2026-09-22',
    time: '12:30:05',
    type: 'face',
    personnelName: '李婷',
    userType: 'regular',
    success: true,
  },
  {
    id: 'LOG-004',
    timestamp: '2026-09-21 19:15:22',
    date: '2026-09-21',
    time: '19:15:22',
    type: 'face',
    personnelName: '张浩',
    userType: 'regular',
    success: true,
  },
  {
    id: 'LOG-005',
    timestamp: '2026-09-21 08:40:11',
    date: '2026-09-21',
    time: '08:40:11',
    type: 'remote',
    personnelName: '远程开门',
    userType: 'admin',
    success: true,
  },
  {
    id: 'LOG-006',
    timestamp: '2026-09-20 17:05:43',
    date: '2026-09-20',
    time: '17:05:43',
    type: 'face',
    personnelName: '陈霞',
    userType: 'regular',
    success: true,
  },
  {
    id: 'LOG-007',
    timestamp: '2026-09-19 14:10:00',
    date: '2026-09-19',
    time: '14:10:00',
    type: 'face',
    personnelName: '王明',
    userType: 'admin',
    success: true,
  }
];

const INITIAL_DOOR_STATE: DoorLockState = {
  isLocked: true,
  isUnlocking: false,
  autoRelockSeconds: 5,
};

export function loadPersonnelList(): Personnel[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PERSONNEL);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to parse personnel from localStorage', e);
  }
  savePersonnelList(INITIAL_PERSONNEL);
  return INITIAL_PERSONNEL;
}

export function savePersonnelList(list: Personnel[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PERSONNEL, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save personnel list', e);
  }
}

export function addOrUpdatePersonnel(item: Personnel): Personnel[] {
  const current = loadPersonnelList();
  const index = current.findIndex(p => p.id === item.id);
  let updated: Personnel[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = item;
  } else {
    updated = [item, ...current];
  }
  savePersonnelList(updated);
  return updated;
}

export function deletePersonnelByIds(idsToDelete: string[]): Personnel[] {
  const current = loadPersonnelList();
  const idSet = new Set(idsToDelete);
  const updated = current.filter(p => !idSet.has(p.id));
  savePersonnelList(updated);
  return updated;
}

export function loadDoorState(): DoorLockState {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.DOOR_STATE);
    if (data) {
      return { ...INITIAL_DOOR_STATE, ...JSON.parse(data), isLocked: true, isUnlocking: false };
    }
  } catch (e) {
    console.error('Failed to read door state', e);
  }
  return INITIAL_DOOR_STATE;
}

export function saveDoorState(state: DoorLockState): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DOOR_STATE, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save door state', e);
  }
}

export function loadAccessLogs(): AccessLog[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ACCESS_LOGS);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to read access logs', e);
  }
  return INITIAL_LOGS;
}

export function appendAccessLog(log: Omit<AccessLog, 'id' | 'timestamp' | 'date' | 'time'>): AccessLog[] {
  const current = loadAccessLogs();
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  const timestampStr = `${dateStr} ${timeStr}`;
  const newLog: AccessLog = {
    ...log,
    id: `LOG-${Date.now()}`,
    timestamp: timestampStr,
    date: dateStr,
    time: timeStr,
  };
  const updated = [newLog, ...current].slice(0, 100);
  try {
    localStorage.setItem(STORAGE_KEYS.ACCESS_LOGS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save access logs', e);
  }
  return updated;
}

export function resetAllData(): void {
  localStorage.removeItem(STORAGE_KEYS.PERSONNEL);
  localStorage.removeItem(STORAGE_KEYS.DOOR_STATE);
  localStorage.removeItem(STORAGE_KEYS.ACCESS_LOGS);
}
