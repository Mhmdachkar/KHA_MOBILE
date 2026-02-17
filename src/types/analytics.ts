// Analytics Types for Admin Dashboard

export interface VisitorSession {
  sessionId: string;
  userId?: string;
  startTime: number;
  lastActivity: number;
  pages: PageView[];
  actions: UserAction[];
  device: DeviceInfo;
  location: LocationInfo;
  referrer: TrafficSource;
  isActive: boolean;
  totalTimeSpent: number;
  bounced: boolean;
}

export interface PageView {
  path: string;
  title: string;
  timestamp: number;
  timeSpent: number;
  scrollDepth: number;
}

export interface UserAction {
  type: 'page_view' | 'product_view' | 'add_to_cart' | 'remove_from_cart' | 
        'add_to_favorites' | 'search' | 'filter' | 'checkout_start' | 
        'checkout_complete' | 'click' | 'scroll';
  timestamp: number;
  data: any;
  page: string;
}

export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  os: string;
  browser: string;
  screenWidth: number;
  screenHeight: number;
  userAgent: string;
}

export interface LocationInfo {
  country?: string;
  city?: string;
  region?: string;
  timezone: string;
  language: string;
}

export interface TrafficSource {
  source: 'direct' | 'organic' | 'social' | 'referral' | 'email' | 'paid' | 'other';
  medium?: string;
  campaign?: string;
  referrerUrl?: string;
  utmParams?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
}

export interface AnalyticsSummary {
  totalVisitors: number;
  activeVisitors: number;
  totalPageViews: number;
  averageSessionDuration: number;
  bounceRate: number;
  conversionRate: number;
  totalRevenue: number;
  topProducts: ProductPerformance[];
  topPages: PagePerformance[];
  trafficSources: TrafficSourceStats[];
  deviceBreakdown: DeviceStats[];
  timeSeriesData: TimeSeriesData[];
}

export interface ProductPerformance {
  productId: string;
  productName: string;
  views: number;
  addedToCart: number;
  purchased: number;
  revenue: number;
  conversionRate: number;
}

export interface PagePerformance {
  path: string;
  title: string;
  views: number;
  uniqueVisitors: number;
  averageTimeSpent: number;
  bounceRate: number;
  exitRate: number;
}

export interface TrafficSourceStats {
  source: string;
  visitors: number;
  percentage: number;
  bounceRate: number;
  conversionRate: number;
  revenue: number;
}

export interface DeviceStats {
  device: string;
  visitors: number;
  percentage: number;
  averageSessionDuration: number;
}

export interface TimeSeriesData {
  timestamp: number;
  date: string;
  visitors: number;
  pageViews: number;
  revenue: number;
  conversions: number;
}

export interface ConversionFunnel {
  stage: string;
  users: number;
  percentage: number;
  dropOffRate: number;
}

export interface RealtimeStats {
  activeVisitors: number;
  activePages: { path: string; visitors: number }[];
  recentActions: UserAction[];
  topProducts: { id: string; name: string; views: number }[];
}
