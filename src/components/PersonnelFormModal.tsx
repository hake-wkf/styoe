import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Upload, Video, VideoOff, Check } from 'lucide-react';
import { Personnel, UserType } from '../types/faceMachine';
import { playShutterSound, playTapTone } from '../utils/audio';

interface PersonnelFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (personnel: Personnel) => void;
  initialData?: Personnel | null;
}

export const PersonnelFormModal: React.FC<PersonnelFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const isEditing = Boolean(initialData);

  const [name, setName] = useState('');
  const [userType, setUserType] = useState<UserType>('regular');
  const [faceImage, setFaceImage] = useState<string>('');

  // Camera states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setUserType(initialData.userType);
      setFaceImage(initialData.faceImage);
    } else {
      setName('');
      setUserType('regular');
      setFaceImage('');
    }
  }, [initialData, isOpen]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    playTapTone();
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err) {
      console.error('Camera access error', err);
      setCameraError('无法调用摄像头，请选择相册上传照片');
      setIsCameraActive(false);
    }
  };

  const captureSnapshot = () => {
    if (!videoRef.current) return;
    playShutterSound();

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 480;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setFaceImage(dataUrl);
    }
    stopCamera();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    playTapTone();
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setFaceImage(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('请输入人员姓名');
      return;
    }
    if (!faceImage) {
      alert('请上传或拍摄人脸图片');
      return;
    }

    const payload: Personnel = {
      id: initialData?.id || String(Date.now()).slice(-6),
      name: name.trim(),
      userType,
      faceImage,
      createdAt: initialData?.createdAt || new Date().toLocaleString('zh-CN', { hour12: false }),
    };

    onSave(payload);
    stopCamera();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">
            {isEditing ? '修改人员信息' : '录入人脸'}
          </h3>
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Face Photo Area */}
          <div>
            <label className="text-xs font-medium text-slate-700 block mb-2">
              人脸图片
            </label>

            <div className="relative w-full aspect-square max-h-52 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200">
              {isCameraActive ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-36 h-44 border-2 border-dashed border-teal-400 rounded-[44px]" />
                  </div>
                  <div className="absolute bottom-3 inset-x-0 flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={captureSnapshot}
                      className="px-4 py-1.5 rounded-full bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium shadow-md active:scale-95 transition-all"
                    >
                      拍摄照片
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-3 py-1.5 rounded-full bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
                    >
                      取消
                    </button>
                  </div>
                </div>
              ) : faceImage ? (
                <div className="relative w-full h-full">
                  <img
                    src={faceImage}
                    alt="人脸预览"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="text-center p-4 text-slate-400">
                  <Camera className="w-8 h-8 mx-auto mb-1 text-slate-500" />
                  <p className="text-xs">暂无人脸照片</p>
                </div>
              )}
            </div>

            {cameraError && (
              <p className="text-[11px] text-rose-500 mt-1">{cameraError}</p>
            )}

            {/* Photo Action Buttons */}
            <div className="mt-2.5 grid grid-cols-2 gap-2">
              <label className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>相册上传</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={isCameraActive ? stopCamera : startCamera}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl transition-colors"
              >
                {isCameraActive ? (
                  <>
                    <VideoOff className="w-3.5 h-3.5" />
                    <span>关闭相机</span>
                  </>
                ) : (
                  <>
                    <Video className="w-3.5 h-3.5" />
                    <span>拍照录入</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Name Field */}
          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">
              姓名
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入人员姓名"
              required
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 text-slate-900"
            />
          </div>

          {/* User Type: 普通用户 ; 管理员用户 */}
          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">
              用户类型
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  playTapTone();
                  setUserType('regular');
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                  userType === 'regular'
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                普通用户
              </button>

              <button
                type="button"
                onClick={() => {
                  playTapTone();
                  setUserType('admin');
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                  userType === 'admin'
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                管理员用户
              </button>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
