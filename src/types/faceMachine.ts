export type UserType = 'regular' | 'admin';

export interface Personnel {
  id: string; // 内部人员编号
  name: string; // 姓名
  userType: UserType; // 用户类型: 普通用户 | 管理员用户
  faceImage: string; // 人脸图片 (base64 或 图片URL)
  createdAt: string;
}

export interface DoorLockState {
  isLocked: boolean;
  isUnlocking: boolean;
  autoRelockSeconds: number;
}

export interface AccessLog {
  id: string;
  timestamp: string; // e.g. "2026-09-22 18:20:14"
  date: string; // e.g. "2026-09-22"
  time: string; // e.g. "18:20:14"
  type: 'remote' | 'face';
  personnelName: string;
  userType?: UserType;
  success: boolean;
}
