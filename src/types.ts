export interface ActivityItem {
  id: string;
  code: string;
  date: string;
  title: string;
  distance: string;
  keyPoints: string;
  location: string;
  elevation: string;
  gearRequired: string;
  recoveryProtocol: string;
  description: string;
  images: string[];
}

export interface RecoveryContentBlock {
  id: string;
  type: 'text' | 'image';
  content: string;
  caption?: string;
}

export interface ProductItem {
  id: string;
  code?: string;
  name: string;
  subtitle?: string;
  category: string;
  image: string;
  spec?: string;
  usage: string;
  detailDescription?: string;
  images?: string[];
  blocks?: RecoveryContentBlock[];
}

export interface HeroSlideItem {
  id: string;
  image: string;
  title?: string;
  sub?: string;
}

export interface JoinNoticeData {
  id?: string;
  isActive?: boolean;
  tag: string;
  title: string;
  sub: string;
  description: string;
  coursePhoto: string;
  photoArchiveTag: string;
  photoTrailTag: string;
  targetSession: string;
}

export interface JoinNoticeItem extends JoinNoticeData {
  id: string;
  isActive: boolean;
}

export interface NagaAppData {
  activities: ActivityItem[];
  heroSlides: HeroSlideItem[];
  products: ProductItem[];
  joinNotice: JoinNoticeData;
  joinNotices?: JoinNoticeItem[];
}
