import React, { useState } from 'react';
import {
  X,
  Upload,
  Plus,
  Trash2,
  Edit2,
  Check,
  RotateCcw,
  LogOut,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Save,
  Eye,
  EyeOff,
  CopyPlus,
} from 'lucide-react';
import { ActivityItem, HeroSlideItem, ProductItem, JoinNoticeItem, NagaAppData } from '../types';
import { DEFAULT_JOIN_NOTICES } from '../defaultData';

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
    setData({
      ...initialData,
      joinNotices:
        Array.isArray(initialData.joinNotices) && initialData.joinNotices.length > 0
          ? initialData.joinNotices
          : initialData.joinNotice
          ? [
              {
                ...initialData.joinNotice,
                id: initialData.joinNotice.id || 'join-session-1',
                isActive: initialData.joinNotice.isActive !== false,
              },
            ]
          : DEFAULT_JOIN_NOTICES,
    });
  }, [initialData]);

  if (!isOpen) return null;

  const joinNoticesList: JoinNoticeItem[] =
    Array.isArray(data.joinNotices) && data.joinNotices.length > 0
      ? data.joinNotices
      : DEFAULT_JOIN_NOTICES;

  // --------------------------------------------------------------------------
  // Image Upload Helper (Local Device File -> /api/upload)
  // --------------------------------------------------------------------------
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onUploaded: (url: string, filename?: string) => void,
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
            onUploaded(resData.url, file.name);
            setSaveStatus('사진이 업로드되었습니다. 상단의 [전체 저장]을 눌러 반영하세요.');
          } else {
            onUploaded(base64, file.name);
            setSaveStatus('로컬 미리보기로 적용되었습니다. 상단의 [전체 저장]을 눌러주세요.');
          }
        } catch {
          onUploaded(base64, file.name);
          setSaveStatus('로컬 미리보기로 적용되었습니다. 상단의 [전체 저장]을 눌러주세요.');
        } finally {
          setUploadingField(null);
          e.target.value = '';
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
    const activeFirst =
      joinNoticesList.find((n) => n.isActive) || joinNoticesList[0] || DEFAULT_JOIN_NOTICES[0];
    const payload: NagaAppData = {
      ...data,
      joinNotice: activeFirst,
      joinNotices: joinNoticesList,
    };
    const success = await onSaveData(payload);
    setIsSaving(false);
    if (success) {
      setSaveStatus('모든 변경사항이 영구 데이터베이스에 성공적으로 저장되었습니다!');
      setTimeout(() => setSaveStatus(null), 4000);
    } else {
      setSaveStatus('저장 중 오류가 발생했습니다. 다시 시도해 주세요.');
    }
  };

  const handleResetToDefault = async () => {
    if (
      !window.confirm(
        '모든 데이터를 초기 기본값으로 리셋하시겠습니까? 등록된 새 게시물과 수정 내역이 초기화됩니다.'
      )
    ) {
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

    const updatedImages =
      activityForm.images && activityForm.images.length > 0
        ? activityForm.images
        : [
            '/images/activity_02_slide_1.jpg',
            '/images/activity_02_slide_2.jpg',
            '/images/activity_02_slide_3.jpg',
          ];

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
  // Hero Slide Handlers (Pure Photo Exhibition: Upload, Reorder, Replace, Delete)
  // --------------------------------------------------------------------------
  const handleUpdateHeroSlide = (id: string, updates: Partial<HeroSlideItem>) => {
    setData((prev) => ({
      ...prev,
      heroSlides: prev.heroSlides.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  };

  const handleAddHeroSlideWithImage = (imageUrl: string) => {
    const newSlide: HeroSlideItem = {
      id: `slide-${Date.now()}`,
      image: imageUrl,
    };
    setData((prev) => ({
      ...prev,
      heroSlides: [...prev.heroSlides, newSlide],
    }));
    setSaveStatus(
      `새 히어로 전시 사진(#${data.heroSlides.length + 1})이 추가되었습니다. [전체 저장]을 눌러 반영하세요.`
    );
  };

  const handleAddBlankHeroSlide = () => {
    const newSlide: HeroSlideItem = {
      id: `slide-${Date.now()}`,
      image: '/images/hero_slide_01.jpg',
    };
    setData((prev) => ({
      ...prev,
      heroSlides: [...prev.heroSlides, newSlide],
    }));
    setSaveStatus('새 히어로 사진 슬롯이 추가되었습니다. 사진을 업로드해 주세요.');
  };

  const handleMoveHeroSlide = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= data.heroSlides.length) return;
    const nextSlides = [...data.heroSlides];
    const temp = nextSlides[index];
    nextSlides[index] = nextSlides[newIdx];
    nextSlides[newIdx] = temp;
    setData((prev) => ({ ...prev, heroSlides: nextSlides }));
  };

  const handleDeleteHeroSlide = (id: string) => {
    if (data.heroSlides.length <= 1) {
      alert('히어로 슬라이드는 최소 1개 이상 유지되어야 합니다.');
      return;
    }
    setData((prev) => ({
      ...prev,
      heroSlides: prev.heroSlides.filter((s) => s.id !== id),
    }));
    setSaveStatus('슬라이드 사진이 삭제되었습니다. [전체 저장]을 눌러 확정하세요.');
  };

  // --------------------------------------------------------------------------
  // Products Handlers (Catalog + Detail Page Gallery & Detailed Description)
  // --------------------------------------------------------------------------
  const handleUpdateProduct = (id: string, updates: Partial<ProductItem>) => {
    setData((prev) => ({
      ...prev,
      products: prev.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  };

  const handleAddProduct = () => {
    const defaultImg = '/images/product_02_alpine_shake.jpg';
    const newProd: ProductItem = {
      id: `prod-${Date.now()}`,
      code: `[Product 0${data.products.length + 1}]`,
      name: 'NEW NAGA RECOVERY ITEM',
      category: 'POST-TRAINING NUTRITION',
      image: defaultImg,
      spec: '고단백 / 전해질 / 기능성 보충 포뮬러',
      usage: '격렬한 산행 후 근육 피로를 즉각 회복하는 전문 알파인 제품.',
      detailDescription:
        '상품 클릭 시 상세 페이지에 표시되는 세부 설명입니다.\n\n• 핵심 배합 및 영양 성분\n• 권장 섭취 타이밍 및 음용 방법\n• 산악 필드 휴대 및 보관 안내',
      images: [defaultImg],
    };
    setData((prev) => ({
      ...prev,
      products: [...prev.products, newProd],
    }));
    setSaveStatus('새 리커버리 상품이 추가되었습니다. 상세 설명과 추가 사진을 등록해 보세요.');
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

  const getProductGallery = (prod: ProductItem): string[] => {
    if (Array.isArray(prod.images) && prod.images.length > 0) {
      return prod.images;
    }
    return prod.image ? [prod.image] : ['/images/product_02_alpine_shake.jpg'];
  };

  const handleAddProductGalleryPhoto = (prodId: string, newUrl: string) => {
    setData((prev) => ({
      ...prev,
      products: prev.products.map((p) => {
        if (p.id !== prodId) return p;
        const currentGallery = getProductGallery(p);
        return {
          ...p,
          images: [...currentGallery, newUrl],
        };
      }),
    }));
    setSaveStatus('상품 추가 사진이 등록되었습니다. 상단의 [전체 저장]을 눌러 반영하세요.');
  };

  const handleUpdateProductGalleryPhoto = (prodId: string, photoIdx: number, newUrl: string) => {
    setData((prev) => ({
      ...prev,
      products: prev.products.map((p) => {
        if (p.id !== prodId) return p;
        const nextGallery = [...getProductGallery(p)];
        nextGallery[photoIdx] = newUrl;
        return {
          ...p,
          image: photoIdx === 0 ? newUrl : p.image,
          images: nextGallery,
        };
      }),
    }));
  };

  const handleMoveProductGalleryPhoto = (
    prodId: string,
    photoIdx: number,
    direction: 'up' | 'down'
  ) => {
    setData((prev) => ({
      ...prev,
      products: prev.products.map((p) => {
        if (p.id !== prodId) return p;
        const nextGallery = [...getProductGallery(p)];
        const targetIdx = direction === 'up' ? photoIdx - 1 : photoIdx + 1;
        if (targetIdx < 0 || targetIdx >= nextGallery.length) return p;
        const temp = nextGallery[photoIdx];
        nextGallery[photoIdx] = nextGallery[targetIdx];
        nextGallery[targetIdx] = temp;
        return {
          ...p,
          image: nextGallery[0] || p.image,
          images: nextGallery,
        };
      }),
    }));
  };

  const handleDeleteProductGalleryPhoto = (prodId: string, photoIdx: number) => {
    setData((prev) => ({
      ...prev,
      products: prev.products.map((p) => {
        if (p.id !== prodId) return p;
        const currentGallery = getProductGallery(p);
        if (currentGallery.length <= 1) {
          alert('상품 사진은 최소 1장 이상 유지되어야 합니다.');
          return p;
        }
        const nextGallery = currentGallery.filter((_, idx) => idx !== photoIdx);
        return {
          ...p,
          image: nextGallery[0] || p.image,
          images: nextGallery,
        };
      }),
    }));
  };

  // --------------------------------------------------------------------------
  // Multi-Session Join Notices Handlers
  // --------------------------------------------------------------------------
  const handleUpdateJoinSession = (id: string, updates: Partial<JoinNoticeItem>) => {
    const nextList = joinNoticesList.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    const activeFirst = nextList.find((n) => n.isActive) || nextList[0];
    setData((prev) => ({
      ...prev,
      joinNotice: activeFirst,
      joinNotices: nextList,
    }));
  };

  const handleAddJoinSession = () => {
    const newSession: JoinNoticeItem = {
      id: `join-session-${Date.now()}`,
      isActive: true,
      tag: 'UPCOMING EXPEDITION · 2027',
      title: 'NEW EXPEDITION SESSION',
      sub: '신규 모집 산행 세션 (한글 소제목을 입력하세요)',
      description: '고려대학교 약학대학 산악단체 NAGA™ 공식 필드 세션 참가 등록 안내',
      coursePhoto: '/images/activity_taebaek_slide_1.jpg',
      photoArchiveTag: 'EXPEDITION ARCHIVE',
      photoTrailTag: 'ALPINE COURSE TRAIL',
      targetSession: 'NEW EXPEDITION SESSION [2027] - 신규 모집 산행 세션',
    };
    const nextList = [...joinNoticesList, newSession];
    setData((prev) => ({
      ...prev,
      joinNotice: nextList.find((n) => n.isActive) || nextList[0],
      joinNotices: nextList,
    }));
    setSaveStatus('새 모집 세션이 추가되었습니다. 상단의 [전체 저장]을 눌러 반영하세요.');
  };

  const handleImportActivityToJoinSession = (act: ActivityItem) => {
    const importedSession: JoinNoticeItem = {
      id: `join-from-${act.id}-${Date.now()}`,
      isActive: true,
      tag: `OPEN RECRUITMENT · ${act.date}`,
      title: act.title,
      sub: `${act.keyPoints} (${act.distance} · ${act.elevation})`,
      description: act.description,
      coursePhoto: act.images?.[0] || '/images/activity_taebaek_slide_1.jpg',
      photoArchiveTag: 'COURSE ARCHIVE',
      photoTrailTag: `${act.title} · ${act.distance}`,
      targetSession: `${act.title} ${act.code} - ${act.keyPoints}`,
    };
    const nextList = [...joinNoticesList, importedSession];
    setData((prev) => ({
      ...prev,
      joinNotice: nextList.find((n) => n.isActive) || nextList[0],
      joinNotices: nextList,
    }));
    setSaveStatus(`"${act.title}" 세션이 모집 목록에 추가되었습니다. [전체 저장]을 눌러 확정하세요.`);
  };

  const handleMoveJoinSession = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= joinNoticesList.length) return;
    const nextList = [...joinNoticesList];
    const temp = nextList[index];
    nextList[index] = nextList[newIdx];
    nextList[newIdx] = temp;
    setData((prev) => ({
      ...prev,
      joinNotice: nextList.find((n) => n.isActive) || nextList[0],
      joinNotices: nextList,
    }));
  };

  const handleDeleteJoinSession = (id: string, title: string) => {
    if (joinNoticesList.length <= 1) {
      alert('모집 세션은 최소 1개 이상 유지되어야 합니다.');
      return;
    }
    if (!window.confirm(`"${title}" 모집 세션을 삭제하시겠습니까?`)) return;
    const nextList = joinNoticesList.filter((item) => item.id !== id);
    setData((prev) => ({
      ...prev,
      joinNotice: nextList.find((n) => n.isActive) || nextList[0],
      joinNotices: nextList,
    }));
    setSaveStatus('모집 세션이 삭제되었습니다. [전체 저장]을 눌러 확정하세요.');
  };

  const activeJoinCount = joinNoticesList.filter((s) => s.isActive).length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col font-sans text-white overflow-hidden"
    >
      {/* ==================================================================== */}
      {/* TOP BAR: Console Control Header */}
      {/* ==================================================================== */}
      <header className="border-b border-white/20 bg-black px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-sm sm:text-base font-syne font-bold uppercase tracking-tight text-white flex items-center gap-2.5">
            <span>NAGA™ MANAGEMENT CONSOLE</span>
            <span className="text-[10px] font-mono tracking-widest text-white/70 border border-white/30 px-2 py-0.5 bg-white/5">
              ADMIN
            </span>
          </h2>
          <p className="text-[10px] sm:text-[11px] font-mono text-white/50 tracking-wider mt-0.5">
            액티비티 · 히어로 슬라이드 · 리커버리 · 다중 세션 모집 통합 관리
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="px-3.5 sm:px-5 py-2 bg-white text-black font-mono text-xs font-bold tracking-[0.18em] uppercase hover:bg-white/90 disabled:opacity-50 transition-all flex items-center gap-2 border border-white active:scale-95 whitespace-nowrap shrink-0"
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
            className="flex items-center gap-1.5 px-3 py-2 border border-white/20 text-white/70 hover:text-white hover:border-white text-xs font-mono tracking-wider uppercase transition-colors whitespace-nowrap shrink-0"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">LOGOUT</span>
          </button>

          <button
            onClick={onClose}
            aria-label="닫기"
            className="w-9 h-9 border border-white/20 hover:border-white flex items-center justify-center text-white/70 hover:text-white transition-colors shrink-0"
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
      <div className="border-b border-white/15 bg-white/5 px-4 sm:px-8 py-2 flex items-center gap-2 sm:gap-3 overflow-x-auto shrink-0 font-mono text-xs tracking-[0.15em] uppercase">
        <button
          onClick={() => {
            setActiveTab('activities');
            setIsCreatingNewActivity(false);
            setEditingActivityId(null);
          }}
          className={`px-3.5 py-2 border transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'activities'
              ? 'bg-white text-black font-bold border-white'
              : 'border-transparent text-white/70 hover:text-white hover:border-white/30'
          }`}
        >
          1. ACTIVITIES ({data.activities.length})
        </button>
        <button
          onClick={() => setActiveTab('hero')}
          className={`px-3.5 py-2 border transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'hero'
              ? 'bg-white text-black font-bold border-white'
              : 'border-transparent text-white/70 hover:text-white hover:border-white/30'
          }`}
        >
          2. HERO SLIDES ({data.heroSlides.length})
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-3.5 py-2 border transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'products'
              ? 'bg-white text-black font-bold border-white'
              : 'border-transparent text-white/70 hover:text-white hover:border-white/30'
          }`}
        >
          3. RECOVERY ({data.products.length})
        </button>
        <button
          onClick={() => setActiveTab('notice')}
          className={`px-3.5 py-2 border transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'notice'
              ? 'bg-white text-black font-bold border-white'
              : 'border-transparent text-white/70 hover:text-white hover:border-white/30'
          }`}
        >
          4. JOIN SESSIONS (모집중 {activeJoinCount} / 전체 {joinNoticesList.length})
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
                  일정 순서(가까운 일정이 위로), 거리, 코스 상세 정보 및 코스 사진(3장)을 수정하거나 새 게시물을 등록합니다.
                </p>
              </div>
              {!isCreatingNewActivity && !editingActivityId && (
                <button
                  onClick={handleStartCreateActivity}
                  className="px-4 py-2.5 bg-white text-black font-mono text-xs font-bold tracking-[0.2em] uppercase hover:bg-white/90 transition-all flex items-center gap-2 border border-white self-start sm:self-auto whitespace-nowrap shrink-0"
                >
                  <Plus size={15} />
                  <span>새 액티비티 등록</span>
                </button>
              )}
            </div>

            {/* CREATE / EDIT ACTIVITY FORM */}
            {(isCreatingNewActivity || editingActivityId) && (
              <div className="border border-white/40 bg-white/5 p-4 sm:p-6 space-y-5">
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
                        onChange={(e) =>
                          setActivityForm({ ...activityForm, gearRequired: e.target.value })
                        }
                        className="w-full bg-black border border-white/30 focus:border-white p-2.5 text-white resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-white/60 mb-1">리커버리 프로토콜 (RECOVERY)</label>
                      <textarea
                        rows={2}
                        value={activityForm.recoveryProtocol || ''}
                        onChange={(e) =>
                          setActivityForm({ ...activityForm, recoveryProtocol: e.target.value })
                        }
                        className="w-full bg-black border border-white/30 focus:border-white p-2.5 text-white resize-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/60 mb-1">드릴 목적 및 상세 설명 (DESCRIPTION)</label>
                    <textarea
                      rows={3}
                      value={activityForm.description || ''}
                      onChange={(e) =>
                        setActivityForm({ ...activityForm, description: e.target.value })
                      }
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
        {/* TAB 2: HERO BANNER SLIDES (단순 사진 전시 전용 관리: 제목/소제목 없음) */}
        {/* ================================================================== */}
        {activeTab === 'hero' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/20 pb-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-syne font-bold uppercase tracking-tight text-white">
                  HERO BANNER PHOTO EXHIBITION
                </h3>
                <p className="text-xs font-mono text-white/50 tracking-wider mt-1">
                  메인 화면에 전시되는 히어로 슬라이드 전용 사진 아카이브입니다. 세션과 무관하게 순수 사진 전시용으로만 관리됩니다.
                </p>
              </div>
              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Direct Photo Upload to Add New Hero Slide */}
                <label className="px-4 py-2.5 bg-white text-black font-mono text-xs font-bold tracking-[0.18em] uppercase hover:bg-white/90 transition-all flex items-center gap-2 border border-white cursor-pointer whitespace-nowrap shrink-0">
                  <Upload size={14} />
                  <span>
                    {uploadingField === 'new-hero-slide'
                      ? '사진 업로드 중...'
                      : '+ 사진 업로드로 새 슬라이드 추가'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) =>
                      handleFileUpload(
                        e,
                        (newUrl) => handleAddHeroSlideWithImage(newUrl),
                        'new-hero-slide'
                      )
                    }
                  />
                </label>

                <button
                  onClick={handleAddBlankHeroSlide}
                  className="px-3.5 py-2.5 border border-white/30 text-white/80 hover:text-white hover:border-white font-mono text-xs tracking-[0.15em] uppercase transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <Plus size={14} />
                  <span>빈 슬라이드 슬롯 추가</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.heroSlides.map((slide, idx) => (
                <div key={slide.id} className="border border-white/20 bg-black p-4 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <span className="font-mono text-xs font-bold text-white tracking-[0.2em]">
                      PHOTO #{String(idx + 1).padStart(2, '0')} / {String(data.heroSlides.length).padStart(2, '0')}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleMoveHeroSlide(idx, 'up')}
                        disabled={idx === 0}
                        title="앞 순서로 이동"
                        className="p-1.5 border border-white/20 hover:border-white disabled:opacity-30 text-white transition-colors"
                      >
                        <ArrowUp size={13} />
                      </button>
                      <button
                        onClick={() => handleMoveHeroSlide(idx, 'down')}
                        disabled={idx === data.heroSlides.length - 1}
                        title="뒤 순서로 이동"
                        className="p-1.5 border border-white/20 hover:border-white disabled:opacity-30 text-white transition-colors"
                      >
                        <ArrowDown size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteHeroSlide(slide.id)}
                        className="p-1.5 border border-red-500/40 text-red-400 hover:bg-red-950/60 transition-colors"
                        title="슬라이드 삭제"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Slide Image Preview (16:9) */}
                  <div className="relative aspect-[16/9] bg-neutral-900 border border-white/20 overflow-hidden">
                    <img
                      src={slide.image}
                      alt={`Hero Exhibition Photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Local File Upload for Replacing Slide Photo */}
                  <label className="block w-full py-2.5 px-3 bg-white/10 hover:bg-white hover:text-black border border-white/30 text-center font-mono text-xs tracking-[0.15em] uppercase cursor-pointer transition-colors">
                    <span>
                      {uploadingField === `hero-${slide.id}`
                        ? '업로드 중...'
                        : '내 기기에서 이 전시 사진 변경'}
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

                  <div className="font-mono text-xs">
                    <label className="block text-white/40 mb-1 text-[10px]">
                      이미지 파일 경로 직접 입력 (선택)
                    </label>
                    <input
                      type="text"
                      value={slide.image}
                      onChange={(e) => handleUpdateHeroSlide(slide.id, { image: e.target.value })}
                      className="w-full bg-black border border-white/20 p-1.5 text-[11px] text-white/70"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 3: RECOVERY PRODUCTS (상세 페이지 추가 사진 갤러리 & 상세 설명 관리) */}
        {/* ================================================================== */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/20 pb-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-syne font-bold uppercase tracking-tight text-white">
                  RECOVERY CATALOG & DETAIL PAGE MANAGEMENT
                </h3>
                <p className="text-xs font-mono text-white/50 tracking-wider mt-1">
                  2. RECOVERY 카탈로그 정보와 상품 클릭 시 이동하는 상세 페이지의 추가 사진들·상세 설명을 통합 관리합니다.
                </p>
              </div>
              <button
                onClick={handleAddProduct}
                className="px-4 py-2.5 bg-white text-black font-mono text-xs font-bold tracking-[0.2em] uppercase hover:bg-white/90 transition-all flex items-center gap-2 border border-white whitespace-nowrap shrink-0"
              >
                <Plus size={15} />
                <span>+ 새 리커버리 상품 추가</span>
              </button>
            </div>

            <div className="space-y-8">
              {data.products.map((prod) => {
                const gallery = getProductGallery(prod);
                return (
                  <div
                    key={prod.id}
                    className="border border-white/25 bg-black p-4 sm:p-6 space-y-6"
                  >
                    {/* Product Header */}
                    <div className="flex items-center justify-between border-b border-white/15 pb-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-mono text-xs font-bold text-white border border-white/30 px-2.5 py-1 bg-white/5 tracking-[0.2em]">
                          {prod.code}
                        </span>
                        <span className="font-syne font-bold text-base sm:text-lg text-white uppercase">
                          {prod.name}
                        </span>
                        <span className="text-[11px] font-mono text-white/45">
                          (등록된 사진 {gallery.length}장)
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteProduct(prod.id)}
                        className="px-2.5 py-1.5 border border-red-500/40 text-red-400 hover:bg-red-950/60 transition-colors flex items-center gap-1.5 font-mono text-xs"
                        title="상품 삭제"
                      >
                        <Trash2 size={13} />
                        <span>삭제</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono text-xs">
                      {/* Left 6 Cols: Text Information & Detail Description */}
                      <div className="lg:col-span-6 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-white/50 mb-1">상품 코드 (CODE)</label>
                            <input
                              type="text"
                              value={prod.code}
                              onChange={(e) =>
                                handleUpdateProduct(prod.id, { code: e.target.value })
                              }
                              className="w-full bg-black border border-white/30 focus:border-white p-2.5 text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-white/50 mb-1">카테고리 (CATEGORY)</label>
                            <input
                              type="text"
                              value={prod.category}
                              onChange={(e) =>
                                handleUpdateProduct(prod.id, { category: e.target.value })
                              }
                              className="w-full bg-black border border-white/30 focus:border-white p-2.5 text-white"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-white/50 mb-1">상품명 (PRODUCT NAME)</label>
                          <input
                            type="text"
                            value={prod.name}
                            onChange={(e) =>
                              handleUpdateProduct(prod.id, { name: e.target.value })
                            }
                            className="w-full bg-black border border-white/30 focus:border-white p-2.5 text-white text-sm font-syne font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-white/50 mb-1">
                            카탈로그 요약 설명 (USAGE / SUMMARY)
                          </label>
                          <textarea
                            rows={2}
                            value={prod.usage}
                            onChange={(e) =>
                              handleUpdateProduct(prod.id, { usage: e.target.value })
                            }
                            className="w-full bg-black border border-white/30 focus:border-white p-2.5 text-white resize-none"
                          />
                        </div>

                        <div>
                          <label className="block text-white/50 mb-1">
                            핵심 규격 및 배합 스펙 (TECH SPECIFICATION)
                          </label>
                          <textarea
                            rows={2}
                            value={prod.spec}
                            onChange={(e) =>
                              handleUpdateProduct(prod.id, { spec: e.target.value })
                            }
                            className="w-full bg-black border border-white/30 focus:border-white p-2.5 text-white resize-none"
                          />
                        </div>

                        <div>
                          <label className="block text-white font-bold mb-1">
                            상세 페이지 본문 설명 (DETAIL DESCRIPTION · 상품 클릭 시 표시)
                          </label>
                          <p className="text-[11px] text-white/45 mb-1.5">
                            리커버리 상품을 클릭해 상세 페이지로 들어갔을 때 표시되는 상세 설명입니다. 줄바꿈이 그대로 반영됩니다.
                          </p>
                          <textarea
                            rows={6}
                            value={prod.detailDescription || ''}
                            onChange={(e) =>
                              handleUpdateProduct(prod.id, {
                                detailDescription: e.target.value,
                              })
                            }
                            placeholder="상품의 세부 성분, 리커버리 효과, 섭취 방법 등을 자유롭게 작성하세요."
                            className="w-full bg-black border border-white/40 focus:border-white p-3 text-white resize-y leading-relaxed"
                          />
                        </div>
                      </div>

                      {/* Right 6 Cols: Main Photo & Additional Detail Photos Gallery */}
                      <div className="lg:col-span-6 space-y-4">
                        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-white/15 pb-2.5">
                          <div>
                            <span className="block text-white font-bold uppercase tracking-wider">
                              대표 사진 및 추가 사진 갤러리 ({gallery.length}장)
                            </span>
                            <span className="text-[11px] text-white/45">
                              1번 사진이 카탈로그 대표 썸네일이 되며, 모든 사진이 상세 페이지 갤러리에 표시됩니다.
                            </span>
                          </div>

                          {/* Upload New Additional Photo to Product Gallery */}
                          <label className="px-3.5 py-2 bg-white text-black font-mono text-[11px] font-bold tracking-[0.15em] uppercase hover:bg-white/90 transition-all flex items-center gap-1.5 border border-white cursor-pointer whitespace-nowrap shrink-0">
                            <Upload size={13} />
                            <span>
                              {uploadingField === `prod-add-photo-${prod.id}`
                                ? '업로드 중...'
                                : '+ 추가 사진 업로드'}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={(e) =>
                                handleFileUpload(
                                  e,
                                  (newUrl) => handleAddProductGalleryPhoto(prod.id, newUrl),
                                  `prod-add-photo-${prod.id}`
                                )
                              }
                            />
                          </label>
                        </div>

                        {/* Gallery Photos Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          {gallery.map((imgUrl, photoIdx) => {
                            const fieldKey = `prod-${prod.id}-photo-${photoIdx}`;
                            return (
                              <div
                                key={photoIdx}
                                className={`border p-3 space-y-2.5 bg-black ${
                                  photoIdx === 0 ? 'border-white/50' : 'border-white/20'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-white">
                                    {photoIdx === 0
                                      ? 'PHOTO #01 (대표 썸네일)'
                                      : `PHOTO #${String(photoIdx + 1).padStart(2, '0')} (추가 사진)`}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleMoveProductGalleryPhoto(prod.id, photoIdx, 'up')
                                      }
                                      disabled={photoIdx === 0}
                                      title="앞 순서로 이동"
                                      className="p-1 border border-white/20 hover:border-white disabled:opacity-30 text-white"
                                    >
                                      <ArrowUp size={12} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleMoveProductGalleryPhoto(prod.id, photoIdx, 'down')
                                      }
                                      disabled={photoIdx === gallery.length - 1}
                                      title="뒤 순서로 이동"
                                      className="p-1 border border-white/20 hover:border-white disabled:opacity-30 text-white"
                                    >
                                      <ArrowDown size={12} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDeleteProductGalleryPhoto(prod.id, photoIdx)
                                      }
                                      title="이 사진 삭제"
                                      className="p-1 border border-red-500/40 text-red-400 hover:bg-red-950/60"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>

                                <div className="relative aspect-[4/3] bg-neutral-900 border border-white/20 overflow-hidden">
                                  <img
                                    src={imgUrl}
                                    alt={`${prod.name} ${photoIdx + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>

                                <label className="block w-full py-2 px-2.5 bg-white/10 hover:bg-white hover:text-black border border-white/30 text-center font-mono text-[11px] uppercase cursor-pointer transition-colors">
                                  <span>
                                    {uploadingField === fieldKey
                                      ? '업로드 중...'
                                      : '내 기기에서 이 사진 변경'}
                                  </span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="sr-only"
                                    onChange={(e) =>
                                      handleFileUpload(
                                        e,
                                        (newUrl) =>
                                          handleUpdateProductGalleryPhoto(
                                            prod.id,
                                            photoIdx,
                                            newUrl
                                          ),
                                        fieldKey
                                      )
                                    }
                                  />
                                </label>

                                <input
                                  type="text"
                                  value={imgUrl}
                                  onChange={(e) =>
                                    handleUpdateProductGalleryPhoto(
                                      prod.id,
                                      photoIdx,
                                      e.target.value
                                    )
                                  }
                                  placeholder="/images/product.jpg"
                                  className="w-full bg-black border border-white/20 p-1.5 text-[10px] text-white/70"
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 4: MULTI-SESSION JOIN RECRUITMENT (동시 다중 세션 모집 관리) */}
        {/* ================================================================== */}
        {activeTab === 'notice' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/20 pb-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-syne font-bold uppercase tracking-tight text-white">
                  MULTI-SESSION RECRUITMENT (다중 세션 동시 모집 관리)
                </h3>
                <p className="text-xs font-mono text-white/50 tracking-wider mt-1">
                  여러 개의 모집 세션을 동시에 활성화하면 3. JOIN 페이지 상단에 탭으로 표시되어 참가자가 원하는 세션을 선택해 신청할 수 있습니다.
                </p>
              </div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  onClick={handleAddJoinSession}
                  className="px-4 py-2.5 bg-white text-black font-mono text-xs font-bold tracking-[0.18em] uppercase hover:bg-white/90 transition-all flex items-center gap-2 border border-white whitespace-nowrap shrink-0"
                >
                  <Plus size={15} />
                  <span>+ 새 모집 세션 추가</span>
                </button>
              </div>
            </div>

            {/* Quick Import from Existing Activities */}
            <div className="border border-white/15 bg-white/5 p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="font-mono text-xs">
                <span className="text-white font-bold uppercase tracking-wider block">
                  QUICK IMPORT FROM ACTIVITIES (액티비티에서 모집 세션 즉시 생성)
                </span>
                <span className="text-white/50 text-[11px]">
                  등록된 액티비티의 제목·설명·코스 사진을 그대로 가져와 새로운 모집 세션 탭으로 추가합니다.
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {data.activities.map((act) => (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => handleImportActivityToJoinSession(act)}
                    className="px-3 py-1.5 border border-white/30 hover:border-white bg-black hover:bg-white hover:text-black text-[11px] font-mono tracking-wider uppercase transition-colors flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <CopyPlus size={12} />
                    <span>{act.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sessions Grid */}
            <div className="space-y-6">
              {joinNoticesList.map((session, idx) => (
                <div
                  key={session.id}
                  className={`border p-4 sm:p-6 space-y-5 transition-colors ${
                    session.isActive
                      ? 'border-white/50 bg-black'
                      : 'border-white/15 bg-black/50 opacity-75'
                  }`}
                >
                  {/* Session Card Top Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/15 pb-3.5">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono text-xs font-bold tracking-[0.2em] text-white border border-white/30 px-2.5 py-1 bg-white/5">
                        SESSION #{String(idx + 1).padStart(2, '0')}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateJoinSession(session.id, { isActive: !session.isActive })
                        }
                        className={`px-3 py-1 font-mono text-xs font-bold tracking-[0.15em] uppercase border flex items-center gap-1.5 transition-colors ${
                          session.isActive
                            ? 'bg-white text-black border-white'
                            : 'bg-transparent text-white/50 border-white/25 hover:border-white/60 hover:text-white'
                        }`}
                      >
                        {session.isActive ? (
                          <>
                            <Eye size={13} />
                            <span>모집 활성화됨 (JOIN 탭 노출)</span>
                          </>
                        ) : (
                          <>
                            <EyeOff size={13} />
                            <span>모집 대기/숨김 (클릭하여 활성화)</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => handleMoveJoinSession(idx, 'up')}
                        disabled={idx === 0}
                        title="탭 순서 위로 이동"
                        className="p-2 border border-white/20 hover:border-white disabled:opacity-30 text-white transition-colors"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveJoinSession(idx, 'down')}
                        disabled={idx === joinNoticesList.length - 1}
                        title="탭 순서 아래로 이동"
                        className="p-2 border border-white/20 hover:border-white disabled:opacity-30 text-white transition-colors"
                      >
                        <ArrowDown size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteJoinSession(session.id, session.title)}
                        title="세션 삭제"
                        className="p-2 border border-red-500/40 text-red-400 hover:bg-red-950/60 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Form Fields + Photo Upload Split */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono text-xs">
                    {/* Left 7 cols: Text Details */}
                    <div className="lg:col-span-7 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-white/50 mb-1">상단 일정 태그 (TAG)</label>
                          <input
                            type="text"
                            value={session.tag}
                            onChange={(e) =>
                              handleUpdateJoinSession(session.id, { tag: e.target.value })
                            }
                            placeholder="UPCOMING EXPEDITION · 2027.01"
                            className="w-full bg-black border border-white/30 focus:border-white p-2.5 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-white/50 mb-1">
                            신청서 자동 기입 세션명 (TARGET SESSION)
                          </label>
                          <input
                            type="text"
                            value={session.targetSession}
                            onChange={(e) =>
                              handleUpdateJoinSession(session.id, {
                                targetSession: e.target.value,
                              })
                            }
                            className="w-full bg-black border border-white/30 focus:border-white p-2.5 text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-white/50 mb-1">
                          세션 영문 타이틀 (JOIN 탭 이름 & 공지 제목)
                        </label>
                        <input
                          type="text"
                          value={session.title}
                          onChange={(e) =>
                            handleUpdateJoinSession(session.id, { title: e.target.value })
                          }
                          className="w-full bg-black border border-white/30 focus:border-white p-2.5 text-white text-sm font-syne font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-white/50 mb-1">한글 소제목 (SUBTITLE)</label>
                        <input
                          type="text"
                          value={session.sub}
                          onChange={(e) =>
                            handleUpdateJoinSession(session.id, { sub: e.target.value })
                          }
                          className="w-full bg-black border border-white/30 focus:border-white p-2.5 text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-white/50 mb-1">
                          모집 안내 상세 설명 (DESCRIPTION)
                        </label>
                        <textarea
                          rows={3}
                          value={session.description}
                          onChange={(e) =>
                            handleUpdateJoinSession(session.id, { description: e.target.value })
                          }
                          className="w-full bg-black border border-white/30 focus:border-white p-2.5 text-white resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-white/50 mb-1">사진 좌상단 캡션</label>
                          <input
                            type="text"
                            value={session.photoArchiveTag}
                            onChange={(e) =>
                              handleUpdateJoinSession(session.id, {
                                photoArchiveTag: e.target.value,
                              })
                            }
                            className="w-full bg-black border border-white/25 focus:border-white p-2 text-white/80"
                          />
                        </div>
                        <div>
                          <label className="block text-white/50 mb-1">사진 우하단 코스 캡션</label>
                          <input
                            type="text"
                            value={session.photoTrailTag}
                            onChange={(e) =>
                              handleUpdateJoinSession(session.id, {
                                photoTrailTag: e.target.value,
                              })
                            }
                            className="w-full bg-black border border-white/25 focus:border-white p-2 text-white/80"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right 5 cols: 4:3 Course Photo Preview & Upload */}
                    <div className="lg:col-span-5 space-y-3">
                      <span className="block text-white/60 uppercase tracking-wider">
                        코스 아카이브 사진 (가로 4:3 비율)
                      </span>
                      <div className="relative aspect-[4/3] w-full bg-neutral-900 border border-white/20 overflow-hidden">
                        <img
                          src={session.coursePhoto}
                          alt={session.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <label className="block w-full py-2.5 px-3 bg-white/10 hover:bg-white hover:text-black border border-white/30 text-center font-mono text-xs tracking-[0.15em] uppercase cursor-pointer transition-colors">
                        <span>
                          {uploadingField === `notice-course-${session.id}`
                            ? '업로드 중...'
                            : '내 기기에서 이 세션 코스 사진 변경'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) =>
                            handleFileUpload(
                              e,
                              (newUrl) =>
                                handleUpdateJoinSession(session.id, { coursePhoto: newUrl }),
                              `notice-course-${session.id}`
                            )
                          }
                        />
                      </label>

                      <div>
                        <label className="block text-white/40 mb-1 text-[11px]">
                          사진 파일 경로 직접 입력
                        </label>
                        <input
                          type="text"
                          value={session.coursePhoto}
                          onChange={(e) =>
                            handleUpdateJoinSession(session.id, { coursePhoto: e.target.value })
                          }
                          className="w-full bg-black border border-white/20 p-2 text-[11px] text-white/70"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ==================================================================== */}
      {/* CONSOLE FOOTER */}
      {/* ==================================================================== */}
      <footer className="border-t border-white/20 bg-black px-4 sm:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 text-xs font-mono text-white/50 tracking-wider">
        <div className="flex items-center gap-2">
          <span>NAGA™ ADMIN CONSOLE</span>
          <span>·</span>
          <span>ACTIVE RECRUITMENT SESSIONS: {activeJoinCount}</span>
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
