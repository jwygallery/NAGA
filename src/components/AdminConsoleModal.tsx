import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Plus,
  Trash2,
  Edit2,
  Check,
  AlertTriangle,
  RotateCcw,
  LogOut,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  Layers,
  Sparkles,
  Calendar,
  Save,
} from 'lucide-react';
import { ActivityItem, HeroSlideItem, ProductItem, JoinNoticeData, NagaAppData } from '../types';

interface AdminConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  initialData: NagaAppData;
  onSaveData: (updatedData: NagaAppData) => Promise<boolean>;
}

type AdminTab = 'activities' | 'hero' | 'products' | 'notice';

export function AdminConsoleModal({
  isOpen,
  onClose,
  onLogout,
  initialData,
  onSaveData,
}: AdminConsoleModalProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('activities');
  const [data, setData] = useState<NagaAppData>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [activityForm, setActivityForm] = useState<Partial<ActivityItem>>({});
  const [isCreatingNewActivity, setIsCreatingNewActivity] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  // Sync with initialData when opened or updated
  React.useEffect(() => {
    setData(initialData);
  }, [initialData]);

  if (!isOpen) return null;

  // --------------------------------------------------------------------------
  // Image Upload Helper (Local Device File -> /api/upload)
  // --------------------------------------------------------------------------
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onUploaded: (url: string) => void,
    fieldKey: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField(fieldKey);
    setSaveStatus('사진 업로드 중...');

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: base64,
              filename: file.name,
            }),
          });
          const resData = await res.json();
          if (res.ok && resData.url) {
            onUploaded(resData.url);
            setSaveStatus('사진이 성공적으로 업로드되었습니다. 상단의 [저장]을 눌러 적용하세요.');
          } else {
            // Fallback: use data URL directly
            onUploaded(base64);
            setSaveStatus('로컬 미리보기로 적용되었습니다. 상단의 [저장]을 눌러주세요.');
          }
        } catch {
          // Fallback: data URL
          onUploaded(base64);
          setSaveStatus('로컬 미리보기로 적용되었습니다. 상단의 [저장]을 눌러주세요.');
        } finally {
          setUploadingField(null);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setUploadingField(null);
      setSaveStatus('사진 읽기 중 오류가 발생했습니다.');
    }
  };

  // --------------------------------------------------------------------------
  // Global Save & Reset
  // --------------------------------------------------------------------------
  const handleSaveAll = async () => {
    setIsSaving(true);
    setSaveStatus('서버에 변경사항을 저장하는 중...');
    const success = await onSaveData(data);
    setIsSaving(false);
    if (success) {
      setSaveStatus('모든 변경사항이 영구 데이터베이스에 성공적으로 저장되었습니다!');
      setTimeout(() => setSaveStatus(null), 4000);
    } else {
      setSaveStatus('저장 중 오류가 발생했습니다. 다시 시도해 주세요.');
    }
  };

  const handleResetToDefault = async () => {
    if (!window.confirm('모든 데이터를 초기 기본값으로 리셋하시겠습니까? 등록된 새 게시물과 수정 내역이 초기화됩니다.')) {
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch('/api/data/reset', { method: 'POST' });
      const resData = await res.json();
      if (res.ok && resData.data) {
        setData(resData.data);
        await onSaveData(resData.data);
        setSaveStatus('기본 데이터로 초기화되었습니다.');
      }
    } catch {
      setSaveStatus('초기화 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // --------------------------------------------------------------------------
  // Activities Management Handlers
  // --------------------------------------------------------------------------
  const handleStartCreateActivity = () => {
    setActivityForm({
      id: `act-${Date.now()}`,
      code: `[${new Date().getFullYear()}.${String(new Date().getMonth() + 1).padStart(2, '0')}]`,
      date: `${new Date().getFullYear()}.${String(new Date().getMonth() + 1).padStart(2, '0')}`,
      title: 'NEW ALPINE ACTIVITY',
      distance: '10km',
      elevation: '+500m 누적고도',
      location: '서울 및 근교 산악 트레일',
      keyPoints: '사전 훈련 및 리커버리 세션',
      gearRequired: '트레킹 기어, 물병, 헤드랜턴',
      recoveryProtocol: 'NAGA™ 전해질 음료 및 프로틴 쉐이크 지급',
      description: '새로운 훈련 및 챌린지 세션입니다. 코스 상세 설명과 참여 지침을 입력하세요.',
      images: [
        '/images/activity_02_slide_1.jpg',
        '/images/activity_02_slide_2.jpg',
        '/images/activity_02_slide_3.jpg',
      ],
    });
    setIsCreatingNewActivity(true);
    setEditingActivityId(null);
  };

  const handleStartEditActivity = (act: ActivityItem) => {
    setActivityForm({ ...act, images: [...(act.images || [])] });
    setEditingActivityId(act.id);
    setIsCreatingNewActivity(false);
  };

  const handleSaveActivityForm = () => {
    if (!activityForm.title?.trim()) {
      alert('액티비티 제목을 입력해 주세요.');
      return;
    }

    const updatedImages = (activityForm.images && activityForm.images.length > 0)
      ? activityForm.images
      : ['/images/activity_02_slide_1.jpg', '/images/activity_02_slide_2.jpg', '/images/activity_02_slide_3.jpg'];

    const fullActivity: ActivityItem = {
      id: activityForm.id || `act-${Date.now()}`,
      code: activityForm.code || '[2027.01]',
      date: activityForm.date || '2027.01',
      title: activityForm.title.trim(),
      distance: activityForm.distance || '10km',
      elevation: activityForm.elevation || '+500m',
      location: activityForm.location || '서울 산악 코스',
      keyPoints: activityForm.keyPoints || '핵심 훈련 포인트',
      gearRequired: activityForm.gearRequired || '트레킹 기어, 물병',
      recoveryProtocol: activityForm.recoveryProtocol || '프로틴 쉐이크 지급',
      description: activityForm.description || '',
      images: updatedImages,
    };

    if (isCreatingNewActivity) {
      setData((prev) => ({
        ...prev,
        activities: [fullActivity, ...prev.activities],
      }));
    } else {
      setData((prev) => ({
        ...prev,
        activities: prev.activities.map((a) => (a.id === editingActivityId ? fullActivity : a)),
      }));
    }

    setEditingActivityId(null);
    setIsCreatingNewActivity(false);
    setActivityForm({});
    setSaveStatus('액티비티가 반영되었습니다. 상단의 [전체 저장] 버튼을 눌러 확정하세요.');
  };

  const handleDeleteActivity = (id: string, title: string) => {
    if (!window.confirm(`"${title}" 액티비티를 삭제하시겠습니까?`)) return;
    setData((prev) => ({
      ...prev,
      activities: prev.activities.filter((a) => a.id !== id),
    }));
    setSaveStatus('액티비티가 삭제되었습니다. 상단의 [전체 저장] 버튼을 눌러 확정하세요.');
  };

  const handleMoveActivity = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= data.activities.length) return;
    const newActs = [...data.activities];
    const temp = newActs[index];
    newActs[index] = newActs[newIdx];
    newActs[newIdx] = temp;
    setData((prev) => ({ ...prev, activities: newActs }));
  };

  // --------------------------------------------------------------------------
  // Hero Slide Handlers
  // --------------------------------------------------------------------------
  const handleUpdateHeroSlide = (id: string, updates: Partial<HeroSlideItem>) => {
    setData((prev) => ({
      ...prev,
      heroSlides: prev.heroSlides.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  };

  const handleAddHeroSlide = () => {
    const newSlide: HeroSlideItem = {
      id: `slide-${Date.now()}`,
      title: 'NEW HERO BANNER SLIDE',
      sub: 'TRAINING & EXPEDITION // 2027',
      image: '/images/hero_slide_01.jpg',
    };
    setData((prev) => ({
      ...prev,
      heroSlides: [...prev.heroSlides, newSlide],
    }));
  };

  const handleDeleteHeroSlide = (id: string) => {
    if (data.heroSlides.length <= 1) {
      alert('슬라이드는 최소 1개 이상 유지되어야 합니다.');
      return;
    }
    setData((prev) => ({
      ...prev,
      heroSlides: prev.heroSlides.filter((s) => s.id !== id),
    }));
  };

  // --------------------------------------------------------------------------
  // Products Handlers
  // --------------------------------------------------------------------------
  const handleUpdateProduct = (id: string, updates: Partial<ProductItem>) => {
    setData((prev) => ({
      ...prev,
      products: prev.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  };

  const handleAddProduct = () => {
    const newProd: ProductItem = {
      id: `prod-${Date.now()}`,
      code: `[Product 0${data.products.length + 1}]`,
      name: 'NEW NAGA RECOVERY ITEM',
      category: 'POST-TRAINING NUTRITION',
      image: '/images/product_02_alpine_shake.jpg',
      spec: '고단백 / 전해질 / 기능성 보충 포뮬러',
      usage: '격렬한 산행 후 근육 피로를 즉각 회복하는 전문 알파인 제품.',
    };
    setData((prev) => ({
      ...prev,
      products: [...prev.products, newProd],
    }));
  };

  const handleDeleteProduct = (id: string) => {
    if (data.products.length <= 1) {
      alert('리커버리 상품은 최소 1개 이상 유지되어야 합니다.');
      return;
    }
    setData((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.id !== id),
    }));
  };

  // --------------------------------------------------------------------------
  // Join Notice Handlers
  // --------------------------------------------------------------------------
  const handleUpdateNotice = (updates: Partial<JoinNoticeData>) => {
    setData((prev) => ({
      ...prev,
      joinNotice: { ...prev.joinNotice, ...updates },
    }));
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col font-sans text-white overflow-hidden"
    >
      {/* ==================================================================== */}
      {/* TOP BAR: Console Control Header */}
      {/* ==================================================================== */}
      <header className="border-b border-white/20 bg-black/95 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse shrink-0" />
          <div>
            <h2 className="text-sm sm:text-base font-syne font-bold uppercase tracking-tight text-white flex items-center gap-2">
              <span>NAGA™ MANAGEMENT CONSOLE</span>
              <span className="text-[10px] font-mono tracking-widest text-emerald-400 border border-emerald-400/40 px-1.5 py-0.2 bg-emerald-950/40">
                ACTIVE
              </span>
            </h2>
            <p className="text-[10px] sm:text-[11px] font-mono text-white/50 tracking-wider">
              아이디: admin // 데이터베이스 영구 저장 및 사진 업로드 시스템
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="px-3.5 sm:px-5 py-2 bg-white text-black font-mono text-xs font-bold tracking-[0.18em] uppercase hover:bg-white/90 disabled:opacity-50 transition-all flex items-center gap-2 border border-white shadow-lg active:scale-95"
          >
            <Save size={14} />
            <span>{isSaving ? 'SAVING...' : 'SAVE ALL (전체 저장)'}</span>
          </button>

          <button
            onClick={handleResetToDefault}
            title="초기 기본 데이터로 되돌리기"
            className="p-2 border border-white/20 text-white/60 hover:text-white hover:border-white text-xs transition-colors"
          >
            <RotateCcw size={15} />
          </button>

          <button
            onClick={onLogout}
            title="관리자 로그아웃"
            className="flex items-center gap-1.5 px-3 py-2 border border-white/20 text-white/70 hover:text-white hover:border-white text-xs font-mono tracking-wider uppercase transition-colors"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">LOGOUT</span>
          </button>

          <button
            onClick={onClose}
            aria-label="닫기"
            className="w-9 h-9 border border-white/20 hover:border-white flex items-center justify-center text-white/70 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      {/* Save Notification Banner */}
      {saveStatus && (
        <div className="bg-white/10 border-b border-white/20 px-4 py-2 text-xs font-mono tracking-wider text-center text-white flex items-center justify-center gap-2">
          <Sparkles size={13} className="text-white" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TABS NAVIGATION */}
      {/* ==================================================================== */}
      <div className="border-b border-white/15 bg-white/5 px-4 sm:px-8 py-2 flex items-center gap-2 sm:gap-4 overflow-x-auto shrink-0 font-mono text-xs tracking-[0.15em] uppercase">
        <button
          onClick={() => {
            setActiveTab('activities');
            setIsCreatingNewActivity(false);
            setEditingActivityId(null);
          }}
          className={`px-3 py-1.5 border transition-all shrink-0 ${
            activeTab === 'activities'
              ? 'bg-white text-black font-bold border-white'
              : 'border-transparent text-white/70 hover:text-white hover:border-white/30'
          }`}
        >
          1. ACTIVITIES ({data.activities.length})
        </button>
        <button
          onClick={() => setActiveTab('hero')}
          className={`px-3 py-1.5 border transition-all shrink-0 ${
            activeTab === 'hero'
              ? 'bg-white text-black font-bold border-white'
              : 'border-transparent text-white/70 hover:text-white hover:border-white/30'
          }`}
        >
          2. HERO SLIDES ({data.heroSlides.length})
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-3 py-1.5 border transition-all shrink-0 ${
            activeTab === 'products'
              ? 'bg-white text-black font-bold border-white'
              : 'border-transparent text-white/70 hover:text-white hover:border-white/30'
          }`}
        >
          3. RECOVERY PRODUCTS ({data.products.length})
        </button>
        <button
          onClick={() => setActiveTab('notice')}
          className={`px-3 py-1.5 border transition-all shrink-0 ${
            activeTab === 'notice'
              ? 'bg-white text-black font-bold border-white'
              : 'border-transparent text-white/70 hover:text-white hover:border-white/30'
          }`}
        >
          4. JOIN NOTICE (공지)
        </button>
      </div>

      {/* ==================================================================== */}
      {/* MAIN VIEWPORT: TAB CONTENT */}
      {/* ==================================================================== */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* ================================================================== */}
        {/* TAB 1: ACTIVITIES */}
        {/* ================================================================== */}
        {activeTab === 'activities' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/20 pb-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-syne font-bold uppercase tracking-tight text-white">
                  EXPEDITION & TRAINING ACTIVITIES
                </h3>
                <p className="text-xs font-mono text-white/50 tracking-wider mt-1">
                  일정 순서(가까운 일정이 위로), 거리, 코스 상세 정보 및 코스 사진(각 3장)을 수정하거나 새 게시물을 등록합니다.
                </p>
              </div>
              {!isCreatingNewActivity && !editingActivityId && (
                <button
                  onClick={handleStartCreateActivity}
                  className="px-4 py-2.5 bg-white text-black font-mono text-xs font-bold tracking-[0.2em] uppercase hover:bg-white/90 transition-all flex items-center gap-2 border border-white self-start sm:self-auto"
                >
                  <Plus size={15} />
                  <span>새 액티비티 등록</span>
                </button>
              )}
            </div>

            {/* CREATE / EDIT ACTIVITY FORM MODAL */}
            {(isCreatingNewActivity || editingActivityId) && (
              <div className="border border-white/40 bg-white/5 p-4 sm:p-6 space-y-5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-white/20 pb-3">
                  <span className="text-xs font-mono font-bold tracking-[0.2em] text-white uppercase flex items-center gap-2">
                    <Edit2 size={14} />
                    {isCreatingNewActivity ? '새 액티비티 등록' : '액티비티 정보 수정'}
                  </span>
                  <button
                    onClick={() => {
                      setIsCreatingNewActivity(false);
                      setEditingActivityId(null);
                    }}
                    className="text-xs font-mono text-white/60 hover:text-white uppercase tracking-wider"
                  >
                    [ 닫기 취소 ]
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
                  <div>
                    <label className="block text-white/60 mb-1">일정 코드 (예: [2027.01])</label>
                    <input
                      type="text"
                      value={activityForm.code || ''}
                      onChange={(e) => setActivityForm({ ...activityForm, code: e.target.value })}
                      className="w-full bg-black border border-white/30 focus:border-white p-2.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 mb-1">일정 날짜 (예: 2027.01)</label>
                    <input
                      type="text"
                      value={activityForm.date || ''}
                      onChange={(e) => setActivityForm({ ...activityForm, date: e.target.value })}
                      className="w-full bg-black border border-white/30 focus:border-white p-2.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 mb-1">거리 (예: 12km)</label>
                    <input
                      type="text"
                      value={activityForm.distance || ''}
                      onChange={(e) => setActivityForm({ ...activityForm, distance: e.target.value })}
                      className="w-full bg-black border border-white/30 focus:border-white p-2.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 mb-1">누적 고도 (예: +780m 누적고도)</label>
                    <input
                      type="text"
                      value={activityForm.elevation || ''}
                      onChange={(e) => setActivityForm({ ...activityForm, elevation: e.target.value })}
                      className="w-full bg-black border border-white/30 focus:border-white p-2.5 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-4 font-mono text-xs">
                  <div>
                    <label className="block text-white/60 mb-1">액티비티 제목 (TITLE)</label>
                    <input
                      type="text"
                      value={activityForm.title || ''}
                      onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                      placeholder="2027 GANGWON TAEBAEK"
                      className="w-full bg-black border border-white/30 focus:border-white p-2.5 text-white text-sm font-syne font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-white/60 mb-1">핵심 포인트 (KEY POINTS)</label>
                    <input
                      type="text"
                      value={activityForm.keyPoints || ''}
                      onChange={(e) => setActivityForm({ ...activityForm, keyPoints: e.target.value })}
                      className="w-full bg-black border border-white/30 focus:border-white p-2.5 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-white/60 mb-1">위치 및 코스 (LOCATION)</label>
                    <input
                      type="text"
                      value={activityForm.location || ''}
                      onChange={(e) => setActivityForm({ ...activityForm, location: e.target.value })}
                      className="w-full bg-black border border-white/30 focus:border-white p-2.5 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/60 mb-1">필요 기어 (GEAR REQUIRED)</label>
                      <textarea
                        rows={2}
                        value={activityForm.gearRequired || ''}
                        onChange={(e) => setActivityForm({ ...activityForm, gearRequired: e.target.value })}
                        className="w-full bg-black border border-white/30 focus:border-white p-2.5 text-white resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-white/60 mb-1">리커버리 프로토콜 (RECOVERY)</label>
                      <textarea
                        rows={2}
                        value={activityForm.recoveryProtocol || ''}
                        onChange={(e) => setActivityForm({ ...activityForm, recoveryProtocol: e.target.value })}
                        className="w-full bg-black border border-white/30 focus:border-white p-2.5 text-white resize-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/60 mb-1">드릴 목적 및 상세 설명 (DESCRIPTION)</label>
                    <textarea
                      rows={3}
                      value={activityForm.description || ''}
                      onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                      className="w-full bg-black border border-white/30 focus:border-white p-2.5 text-white resize-none"
                    />
                  </div>

                  {/* 3 Course Photos Uploader */}
                  <div className="space-y-3 pt-2 border-t border-white/20">
                    <span className="block font-bold uppercase tracking-[0.15em] text-white">
                      코스 사진 슬라이드 (가로 4:3 비율 권장, 각 3장)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[0, 1, 2].map((slotIdx) => {
                        const currentImg = activityForm.images?.[slotIdx] || '';
                        const fieldId = `act-photo-${slotIdx}`;
                        return (
                          <div key={slotIdx} className="border border-white/20 bg-black p-3 space-y-2">
                            <span className="text-[10px] text-white/50 block">SLIDE #{slotIdx + 1}</span>
                            <div className="relative aspect-[4/3] bg-neutral-900 border border-white/20 overflow-hidden">
                              {currentImg ? (
                                <img
                                  src={currentImg}
                                  alt={`Slide ${slotIdx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-white/30 text-xs">
                                  사진 없음
                                </div>
                              )}
                            </div>

                            {/* Local File Upload Button */}
                            <label className="block w-full py-2 px-2.5 bg-white/10 hover:bg-white hover:text-black border border-white/30 text-center font-mono text-[11px] uppercase cursor-pointer transition-colors">
                              <span>
                                {uploadingField === fieldId ? '업로드 중...' : '내 기기에서 사진 변경'}
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={(e) =>
                                  handleFileUpload(
                                    e,
                                    (newUrl) => {
                                      const nextImages = [...(activityForm.images || [])];
                                      nextImages[slotIdx] = newUrl;
                                      setActivityForm({ ...activityForm, images: nextImages });
                                    },
                                    fieldId
                                  )
                                }
                              />
                            </label>

                            {/* Manual URL input fallback */}
                            <input
                              type="text"
                              value={currentImg}
                              onChange={(e) => {
                                const nextImages = [...(activityForm.images || [])];
                                nextImages[slotIdx] = e.target.value;
                                setActivityForm({ ...activityForm, images: nextImages });
                              }}
                              placeholder="/images/photo.jpg or URL"
                              className="w-full bg-black border border-white/20 p-1.5 text-[10px] text-white/70"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-white/20">
                  <button
                    onClick={handleSaveActivityForm}
                    className="px-5 py-2.5 bg-white text-black font-mono text-xs font-bold tracking-[0.2em] uppercase hover:bg-white/90 transition-all flex items-center gap-2 border border-white"
                  >
                    <Check size={14} />
                    <span>{isCreatingNewActivity ? '새 액티비티 추가' : '수정 완료'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsCreatingNewActivity(false);
                      setEditingActivityId(null);
                    }}
                    className="px-4 py-2.5 border border-white/20 text-white/70 hover:text-white font-mono text-xs uppercase transition-colors"
                  >
                    취소
                  </button>
                </div>
              </div>
            )}

            {/* ACTIVITIES LIST */}
            <div className="space-y-3">
              {data.activities.map((act, index) => (
                <div
                  key={act.id}
                  className="border border-white/20 hover:border-white/50 bg-black p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
                >
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap font-mono text-xs">
                      <span className="border border-white/40 px-2 py-0.5 text-white font-bold bg-white/5">
                        {act.code}
                      </span>
                      <span className="text-white/60">{act.date}</span>
                      <span className="text-white/40">·</span>
                      <span className="text-white/60">{act.distance}</span>
                      <span className="text-white/40">·</span>
                      <span className="text-white/60">{act.elevation}</span>
                    </div>

                    <h4 className="text-base sm:text-lg font-syne font-bold text-white uppercase tracking-tight">
                      {act.title}
                    </h4>

                    <p className="text-xs font-mono text-white/70 line-clamp-1">{act.keyPoints}</p>

                    {/* Image thumbnails preview */}
                    <div className="flex items-center gap-2 pt-1">
                      {(act.images || []).map((img, i) => (
                        <div
                          key={i}
                          className="w-14 h-10 border border-white/20 bg-neutral-900 overflow-hidden shrink-0"
                        >
                          <img src={img} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                      <span className="text-[10px] font-mono text-white/40">
                        {act.images?.length || 0}장 등록됨
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 self-end md:self-center font-mono text-xs shrink-0">
                    <button
                      onClick={() => handleMoveActivity(index, 'up')}
                      disabled={index === 0}
                      title="위로 이동 (순서 변경)"
                      className="p-2 border border-white/20 hover:border-white disabled:opacity-30 disabled:border-white/10 text-white transition-colors"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      onClick={() => handleMoveActivity(index, 'down')}
                      disabled={index === data.activities.length - 1}
                      title="아래로 이동 (순서 변경)"
                      className="p-2 border border-white/20 hover:border-white disabled:opacity-30 disabled:border-white/10 text-white transition-colors"
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      onClick={() => handleStartEditActivity(act)}
                      className="px-3 py-2 border border-white/40 hover:border-white text-white hover:bg-white hover:text-black uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                    >
                      <Edit2 size={13} />
                      <span>수정</span>
                    </button>
                    <button
                      onClick={() => handleDeleteActivity(act.id, act.title)}
                      className="px-2.5 py-2 border border-red-500/40 text-red-400 hover:bg-red-950/60 transition-colors"
                      title="삭제"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 2: HERO BANNER SLIDES */}
        {/* ================================================================== */}
        {activeTab === 'hero' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/20 pb-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-syne font-bold uppercase tracking-tight text-white">
                  HERO BANNER SLIDES MANAGEMENT
                </h3>
                <p className="text-xs font-mono text-white/50 tracking-wider mt-1">
                  메인 화면 최상단에 자동으로 전환되는 대형 와이드 슬라이드 사진(16:9) 및 문구를 수정합니다.
                </p>
              </div>
              <button
                onClick={handleAddHeroSlide}
                className="px-4 py-2 bg-white text-black font-mono text-xs font-bold tracking-[0.2em] uppercase hover:bg-white/90 transition-all flex items-center gap-2 border border-white"
              >
                <Plus size={15} />
                <span>슬라이드 추가</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.heroSlides.map((slide, idx) => (
                <div key={slide.id} className="border border-white/20 bg-black p-4 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="font-mono text-xs font-bold text-white tracking-[0.2em]">
                      SLIDE #{idx + 1}
                    </span>
                    <button
                      onClick={() => handleDeleteHeroSlide(slide.id)}
                      className="text-red-400 hover:text-red-300 p-1"
                      title="슬라이드 삭제"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Slide Image Preview (16:9) */}
                  <div className="relative aspect-[16/9] bg-neutral-900 border border-white/20 overflow-hidden">
                    <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                  </div>

                  {/* Local File Upload for Slide */}
                  <label className="block w-full py-2.5 px-3 bg-white/10 hover:bg-white hover:text-black border border-white/30 text-center font-mono text-xs tracking-[0.15em] uppercase cursor-pointer transition-colors">
                    <span>
                      {uploadingField === `hero-${slide.id}` ? '업로드 중...' : '내 기기에서 슬라이드 사진 변경'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) =>
                        handleFileUpload(
                          e,
                          (newUrl) => handleUpdateHeroSlide(slide.id, { image: newUrl }),
                          `hero-${slide.id}`
                        )
                      }
                    />
                  </label>

                  <div className="space-y-3 font-mono text-xs">
                    <div>
                      <label className="block text-white/50 mb-1">제목 (TITLE)</label>
                      <input
                        type="text"
                        value={slide.title}
                        onChange={(e) => handleUpdateHeroSlide(slide.id, { title: e.target.value })}
                        className="w-full bg-black border border-white/30 focus:border-white p-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-white/50 mb-1">소제목 (SUBTITLE)</label>
                      <input
                        type="text"
                        value={slide.sub}
                        onChange={(e) => handleUpdateHeroSlide(slide.id, { sub: e.target.value })}
                        className="w-full bg-black border border-white/30 focus:border-white p-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-white/50 mb-1">이미지 경로 직접 입력</label>
                      <input
                        type="text"
                        value={slide.image}
                        onChange={(e) => handleUpdateHeroSlide(slide.id, { image: e.target.value })}
                        className="w-full bg-black border border-white/20 p-1.5 text-[11px] text-white/70"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 3: RECOVERY PRODUCTS */}
        {/* ================================================================== */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/20 pb-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-syne font-bold uppercase tracking-tight text-white">
                  RECOVERY CATALOG MANAGEMENT
                </h3>
                <p className="text-xs font-mono text-white/50 tracking-wider mt-1">
                  2. RECOVERY 페이지에 표시되는 리커버리 포뮬러 및 영양 상품(쉐이크, 그릭요거트 등)을 관리합니다.
                </p>
              </div>
              <button
                onClick={handleAddProduct}
                className="px-4 py-2 bg-white text-black font-mono text-xs font-bold tracking-[0.2em] uppercase hover:bg-white/90 transition-all flex items-center gap-2 border border-white"
              >
                <Plus size={15} />
                <span>상품 추가</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.products.map((prod) => (
                <div key={prod.id} className="border border-white/20 bg-black p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="font-mono text-xs font-bold text-white tracking-[0.2em]">
                      {prod.code}
                    </span>
                    <button
                      onClick={() => handleDeleteProduct(prod.id)}
                      className="text-red-400 hover:text-red-300 p-1"
                      title="상품 삭제"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Product Image Preview */}
                  <div className="relative aspect-[4/3] bg-neutral-900 border border-white/20 overflow-hidden">
                    <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                  </div>

                  {/* Local File Upload for Product */}
                  <label className="block w-full py-2.5 px-3 bg-white/10 hover:bg-white hover:text-black border border-white/30 text-center font-mono text-xs tracking-[0.15em] uppercase cursor-pointer transition-colors">
                    <span>
                      {uploadingField === `prod-${prod.id}` ? '업로드 중...' : '내 기기에서 상품 사진 변경'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) =>
                        handleFileUpload(
                          e,
                          (newUrl) => handleUpdateProduct(prod.id, { image: newUrl }),
                          `prod-${prod.id}`
                        )
                      }
                    />
                  </label>

                  <div className="space-y-3 font-mono text-xs">
                    <div>
                      <label className="block text-white/50 mb-1">상품 코드</label>
                      <input
                        type="text"
                        value={prod.code}
                        onChange={(e) => handleUpdateProduct(prod.id, { code: e.target.value })}
                        className="w-full bg-black border border-white/30 focus:border-white p-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-white/50 mb-1">상품명 (PRODUCT NAME)</label>
                      <input
                        type="text"
                        value={prod.name}
                        onChange={(e) => handleUpdateProduct(prod.id, { name: e.target.value })}
                        className="w-full bg-black border border-white/30 focus:border-white p-2 text-white font-syne font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-white/50 mb-1">카테고리</label>
                      <input
                        type="text"
                        value={prod.category}
                        onChange={(e) => handleUpdateProduct(prod.id, { category: e.target.value })}
                        className="w-full bg-black border border-white/30 focus:border-white p-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-white/50 mb-1">규격 및 배합 (SPEC)</label>
                      <textarea
                        rows={2}
                        value={prod.spec}
                        onChange={(e) => handleUpdateProduct(prod.id, { spec: e.target.value })}
                        className="w-full bg-black border border-white/30 focus:border-white p-2 text-white resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-white/50 mb-1">용도 및 섭취 가이드 (USAGE)</label>
                      <textarea
                        rows={2}
                        value={prod.usage}
                        onChange={(e) => handleUpdateProduct(prod.id, { usage: e.target.value })}
                        className="w-full bg-black border border-white/30 focus:border-white p-2 text-white resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-white/50 mb-1">사진 파일 경로 직접 입력</label>
                      <input
                        type="text"
                        value={prod.image}
                        onChange={(e) => handleUpdateProduct(prod.id, { image: e.target.value })}
                        className="w-full bg-black border border-white/20 p-1.5 text-[11px] text-white/70"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 4: JOIN NOTICE */}
        {/* ================================================================== */}
        {activeTab === 'notice' && (
          <div className="space-y-6 max-w-3xl">
            <div className="border-b border-white/20 pb-4">
              <h3 className="text-xl sm:text-2xl font-syne font-bold uppercase tracking-tight text-white">
                ACTIVE RECRUITMENT NOTICE (참가 페이지 공지 관리)
              </h3>
              <p className="text-xs font-mono text-white/50 tracking-wider mt-1">
                3. JOIN 페이지 상단에 위치한 활성 모집 안내 박스, 코스 사진 및 대상 세션 문구를 수정합니다.
              </p>
            </div>

            <div className="border border-white/20 bg-black p-4 sm:p-6 space-y-5 font-mono text-xs">
              <div>
                <label className="block text-white/50 mb-1">상단 태그</label>
                <input
                  type="text"
                  value={data.joinNotice.tag}
                  onChange={(e) => handleUpdateNotice({ tag: e.target.value })}
                  className="w-full bg-black border border-white/30 focus:border-white p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-white/50 mb-1">메인 공지 제목 (영어 대문자)</label>
                <input
                  type="text"
                  value={data.joinNotice.title}
                  onChange={(e) => handleUpdateNotice({ title: e.target.value })}
                  className="w-full bg-black border border-white/30 focus:border-white p-2.5 text-white text-sm font-syne font-bold"
                />
              </div>

              <div>
                <label className="block text-white/50 mb-1">소제목 (한글)</label>
                <input
                  type="text"
                  value={data.joinNotice.sub}
                  onChange={(e) => handleUpdateNotice({ sub: e.target.value })}
                  className="w-full bg-black border border-white/30 focus:border-white p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-white/50 mb-1">상세 안내 설명</label>
                <textarea
                  rows={2}
                  value={data.joinNotice.description}
                  onChange={(e) => handleUpdateNotice({ description: e.target.value })}
                  className="w-full bg-black border border-white/30 focus:border-white p-2.5 text-white resize-none"
                />
              </div>

              {/* Course Photo Uploader (4:3) */}
              <div className="space-y-3 pt-3 border-t border-white/20">
                <span className="block font-bold uppercase tracking-[0.15em] text-white">
                  코스 아카이브 사진 (가로 4:3 비율)
                </span>
                <div className="relative aspect-[4/3] max-w-md bg-neutral-900 border border-white/20 overflow-hidden">
                  <img
                    src={data.joinNotice.coursePhoto}
                    alt="Course Preview"
                    className="w-full h-full object-cover"
                  />
                </div>

                <label className="block max-w-md py-2.5 px-3 bg-white/10 hover:bg-white hover:text-black border border-white/30 text-center font-mono text-xs tracking-[0.15em] uppercase cursor-pointer transition-colors">
                  <span>
                    {uploadingField === 'notice-course' ? '업로드 중...' : '내 기기에서 코스 사진 변경'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) =>
                      handleFileUpload(
                        e,
                        (newUrl) => handleUpdateNotice({ coursePhoto: newUrl }),
                        'notice-course'
                      )
                    }
                  />
                </label>

                <div className="max-w-md">
                  <label className="block text-white/50 mb-1">사진 파일 경로 직접 입력</label>
                  <input
                    type="text"
                    value={data.joinNotice.coursePhoto}
                    onChange={(e) => handleUpdateNotice({ coursePhoto: e.target.value })}
                    className="w-full bg-black border border-white/20 p-2 text-xs text-white/70"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-white/50 mb-1">신청서 고정 접수 세션명</label>
                <input
                  type="text"
                  value={data.joinNotice.targetSession}
                  onChange={(e) => handleUpdateNotice({ targetSession: e.target.value })}
                  className="w-full bg-black border border-white/30 focus:border-white p-2.5 text-white"
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ==================================================================== */}
      {/* CONSOLE FOOTER */}
      {/* ==================================================================== */}
      <footer className="border-t border-white/20 bg-black/95 px-4 sm:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 text-xs font-mono text-white/50 tracking-wider">
        <div className="flex items-center gap-2">
          <span>NAGA™ SYSTEM v2.4</span>
          <span>·</span>
          <span>PERSISTENCE: /api/data</span>
          <span>·</span>
          <span>STATUS: AUTHENTICATED</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="px-4 py-1.5 bg-white text-black font-bold uppercase hover:bg-white/90 disabled:opacity-50"
          >
            {isSaving ? 'SAVING...' : 'SAVE ALL CHANGES'}
          </button>
        </div>
      </footer>
    </div>
  );
}
