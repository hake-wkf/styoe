/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Personnel, DoorLockState, AccessLog } from './types/faceMachine';
import { 
  loadPersonnelList, 
  addOrUpdatePersonnel, 
  deletePersonnelByIds, 
  loadDoorState, 
  saveDoorState, 
  loadAccessLogs, 
  resetAllData
} from './services/storage';
import { WeChatCapsule } from './components/WeChatCapsule';
import { RemoteUnlockCard } from './components/RemoteUnlockCard';
import { PersonnelList } from './components/PersonnelList';
import { PersonnelFormModal } from './components/PersonnelFormModal';
import { AccessLogsPage } from './components/AccessLogsPage';
import { SettingsPage } from './components/SettingsPage';
import { MiniProgramPhoneFrame } from './components/MiniProgramPhoneFrame';

export default function App() {
  const [isMobileFrameMode, setIsMobileFrameMode] = useState<boolean>(true);

  // Core Data States
  const [personnelList, setPersonnelList] = useState<Personnel[]>([]);
  const [doorState, setDoorState] = useState<DoorLockState>(loadDoorState());
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);

  // Page Routing: 'main' | 'logs' | 'settings'
  const [currentPage, setCurrentPage] = useState<'main' | 'logs' | 'settings'>('main');

  // Form Modal for Adding / Editing Personnel
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingPersonnel, setEditingPersonnel] = useState<Personnel | null>(null);

  useEffect(() => {
    setPersonnelList(loadPersonnelList());
    setDoorState(loadDoorState());
    setAccessLogs(loadAccessLogs());
  }, []);

  // Save personnel (Register or Edit)
  const handleSavePersonnel = (person: Personnel) => {
    const updated = addOrUpdatePersonnel(person);
    setPersonnelList(updated);
  };

  // Delete personnel (Single or multiple)
  const handleDeletePersonnel = (ids: string[]) => {
    const updated = deletePersonnelByIds(ids);
    setPersonnelList(updated);
  };

  // Reset demo data
  const handleResetDefaults = () => {
    resetAllData();
    setPersonnelList(loadPersonnelList());
    setDoorState(loadDoorState());
    setAccessLogs(loadAccessLogs());
  };

  return (
    <MiniProgramPhoneFrame
      isMobileFrameMode={isMobileFrameMode}
      onToggleFrameMode={() => setIsMobileFrameMode(!isMobileFrameMode)}
    >
      {/* Page Routing */}
      {currentPage === 'logs' ? (
        /* Requirement 7: 开门记录不要弹窗要页面, 页面做时间查询 */
        <AccessLogsPage
          logs={loadAccessLogs()}
          onBack={() => setCurrentPage('main')}
        />
      ) : currentPage === 'settings' ? (
        /* Requirement 3: 点击右上角设置进入设置页面 */
        <SettingsPage
          doorState={doorState}
          onUpdateState={(newState) => {
            setDoorState(newState);
            saveDoorState(newState);
          }}
          onResetDefaults={handleResetDefaults}
          onBack={() => setCurrentPage('main')}
        />
      ) : (
        /* Main Page */
        <div className="flex flex-col min-h-full">
          {/* Header with Title and Requirement 3: 右上角设置按钮 */}
          <WeChatCapsule
            title="人脸门禁"
            onOpenSettings={() => setCurrentPage('settings')}
          />

          <div className="p-4 space-y-4">
            {/* Requirement 1: 门禁遥控 (Cleaned of extraneous info: no IP, no wifi, no battery, no online tag, no biometric tagline) */}
            <RemoteUnlockCard
              doorState={doorState}
              onStateChange={(newState) => {
                setDoorState(newState);
                saveDoorState(newState);
              }}
              onViewLogs={() => {
                setAccessLogs(loadAccessLogs());
                setCurrentPage('logs');
              }}
            />

            {/* Requirement 6: 人员与人脸库 (No scores, unified colors, batch delete, registration/edit) */}
            <PersonnelList
              personnelList={personnelList}
              onAdd={() => {
                setEditingPersonnel(null);
                setIsFormModalOpen(true);
              }}
              onEdit={(p) => {
                setEditingPersonnel(p);
                setIsFormModalOpen(true);
              }}
              onDeleteMultiple={handleDeletePersonnel}
            />
          </div>
        </div>
      )}

      {/* Requirement 5: 录入人脸 / 修改人员 Modal */}
      <PersonnelFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingPersonnel(null);
        }}
        onSave={handleSavePersonnel}
        initialData={editingPersonnel}
      />
    </MiniProgramPhoneFrame>
  );
}
