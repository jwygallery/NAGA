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

export interface ProductItem {
  id: string;
  code: string;
  name: string;
  category: string;
  image: string;
  spec: string;
  usage: string;
}

export interface HeroSlideItem {
  id: string;
  title: string;
  sub: string;
  image: string;
}

export interface JoinNoticeData {
  tag: string;
  title: string;
  sub: string;
  description: string;
  coursePhoto: string;
  photoArchiveTag: string;
  photoTrailTag: string;
  targetSession: string;
}

export interface NagaAppData {
  activities: ActivityItem[];
  heroSlides: HeroSlideItem[];
  products: ProductItem[];
  joinNotice: JoinNoticeData;
}
