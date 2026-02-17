import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  VisitorSession,
  UserAction,
  DeviceInfo,
  LocationInfo,
  TrafficSource,
  PageView,
} from '@/types/analytics';

interface AnalyticsContextType {
  trackPageView: (path: string, title: string) => void;
  trackAction: (action: Omit<UserAction, 'timestamp' | 'page'>) => void;
  trackProductView: (productId: string, productName: string) => void;
  trackAddToCart: (productId: string, productName: string, price: number) => void;
  trackRemoveFromCart: (productId: string) => void;
  trackSearch: (query: string) => void;
  trackCheckoutStart: (cartValue: number) => void;
  trackCheckoutComplete: (orderId: string, orderValue: number) => void;
  currentSession: VisitorSession | null;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within AnalyticsProvider');
  }
  return context;
};

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [currentSession, setCurrentSession] = useState<VisitorSession | null>(null);
  const [pageStartTime, setPageStartTime] = useState<number>(Date.now());

  // Generate or retrieve session ID
  const getSessionId = useCallback((): string => {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }, []);

  // Get device information
  const getDeviceInfo = useCallback((): DeviceInfo => {
    const userAgent = navigator.userAgent;
    const screenWidth = window.innerWidth;
    
    let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    if (screenWidth < 768) deviceType = 'mobile';
    else if (screenWidth < 1024) deviceType = 'tablet';

    let os = 'Unknown';
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';

    let browser = 'Unknown';
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) browser = 'Chrome';
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Edg')) browser = 'Edge';

    return {
      type: deviceType,
      os,
      browser,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      userAgent,
    };
  }, []);

  // Get location information
  const getLocationInfo = useCallback((): LocationInfo => {
    return {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
    };
  }, []);

  // Get traffic source
  const getTrafficSource = useCallback((): TrafficSource => {
    const referrer = document.referrer;
    const urlParams = new URLSearchParams(window.location.search);

    const utmParams = {
      source: urlParams.get('utm_source') || undefined,
      medium: urlParams.get('utm_medium') || undefined,
      campaign: urlParams.get('utm_campaign') || undefined,
      term: urlParams.get('utm_term') || undefined,
      content: urlParams.get('utm_content') || undefined,
    };

    let source: TrafficSource['source'] = 'direct';
    
    if (utmParams.source) {
      if (utmParams.medium === 'email') source = 'email';
      else if (utmParams.medium === 'cpc' || utmParams.medium === 'paid') source = 'paid';
      else if (utmParams.medium === 'social') source = 'social';
      else source = 'other';
    } else if (referrer) {
      if (referrer.includes('google') || referrer.includes('bing') || referrer.includes('yahoo')) {
        source = 'organic';
      } else if (referrer.includes('facebook') || referrer.includes('twitter') || 
                 referrer.includes('instagram') || referrer.includes('linkedin')) {
        source = 'social';
      } else {
        source = 'referral';
      }
    }

    return {
      source,
      referrerUrl: referrer || undefined,
      utmParams: Object.values(utmParams).some(v => v) ? utmParams : undefined,
    };
  }, []);

  // Initialize session
  useEffect(() => {
    const sessionId = getSessionId();
    const existingSession = localStorage.getItem(`analytics_session_${sessionId}`);

    if (existingSession) {
      const parsed = JSON.parse(existingSession);
      setCurrentSession({
        ...parsed,
        lastActivity: Date.now(),
        isActive: true,
      });
    } else {
      const newSession: VisitorSession = {
        sessionId,
        startTime: Date.now(),
        lastActivity: Date.now(),
        pages: [],
        actions: [],
        device: getDeviceInfo(),
        location: getLocationInfo(),
        referrer: getTrafficSource(),
        isActive: true,
        totalTimeSpent: 0,
        bounced: true,
      };
      setCurrentSession(newSession);
      localStorage.setItem(`analytics_session_${sessionId}`, JSON.stringify(newSession));
    }

    // Track session end on page unload
    const handleBeforeUnload = () => {
      if (currentSession) {
        const updatedSession = {
          ...currentSession,
          isActive: false,
          totalTimeSpent: Date.now() - currentSession.startTime,
        };
        localStorage.setItem(`analytics_session_${sessionId}`, JSON.stringify(updatedSession));
        
        // Send to analytics storage
        const allSessions = JSON.parse(localStorage.getItem('all_analytics_sessions') || '[]');
        allSessions.push(updatedSession);
        localStorage.setItem('all_analytics_sessions', JSON.stringify(allSessions));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [getSessionId, getDeviceInfo, getLocationInfo, getTrafficSource]);

  // Track page views
  const trackPageView = useCallback((path: string, title: string) => {
    if (!currentSession) return;

    const now = Date.now();
    const timeSpent = now - pageStartTime;

    const pageView: PageView = {
      path,
      title,
      timestamp: now,
      timeSpent,
      scrollDepth: 0,
    };

    const updatedSession: VisitorSession = {
      ...currentSession,
      pages: [...currentSession.pages, pageView],
      lastActivity: now,
      bounced: currentSession.pages.length > 0 ? false : currentSession.bounced,
    };

    setCurrentSession(updatedSession);
    localStorage.setItem(`analytics_session_${currentSession.sessionId}`, JSON.stringify(updatedSession));
    setPageStartTime(now);

    // Track action
    trackAction({
      type: 'page_view',
      data: { path, title },
    });
  }, [currentSession, pageStartTime]);

  // Track generic action
  const trackAction = useCallback((action: Omit<UserAction, 'timestamp' | 'page'>) => {
    if (!currentSession) return;

    const userAction: UserAction = {
      ...action,
      timestamp: Date.now(),
      page: location.pathname,
    };

    const updatedSession: VisitorSession = {
      ...currentSession,
      actions: [...currentSession.actions, userAction],
      lastActivity: Date.now(),
    };

    setCurrentSession(updatedSession);
    localStorage.setItem(`analytics_session_${currentSession.sessionId}`, JSON.stringify(updatedSession));
  }, [currentSession, location.pathname]);

  // Track product view
  const trackProductView = useCallback((productId: string, productName: string) => {
    trackAction({
      type: 'product_view',
      data: { productId, productName },
    });
  }, [trackAction]);

  // Track add to cart
  const trackAddToCart = useCallback((productId: string, productName: string, price: number) => {
    trackAction({
      type: 'add_to_cart',
      data: { productId, productName, price },
    });
  }, [trackAction]);

  // Track remove from cart
  const trackRemoveFromCart = useCallback((productId: string) => {
    trackAction({
      type: 'remove_from_cart',
      data: { productId },
    });
  }, [trackAction]);

  // Track search
  const trackSearch = useCallback((query: string) => {
    trackAction({
      type: 'search',
      data: { query },
    });
  }, [trackAction]);

  // Track checkout start
  const trackCheckoutStart = useCallback((cartValue: number) => {
    trackAction({
      type: 'checkout_start',
      data: { cartValue },
    });
  }, [trackAction]);

  // Track checkout complete
  const trackCheckoutComplete = useCallback((orderId: string, orderValue: number) => {
    trackAction({
      type: 'checkout_complete',
      data: { orderId, orderValue },
    });
  }, [trackAction]);

  // Track page view on route change
  useEffect(() => {
    const title = document.title;
    trackPageView(location.pathname, title);
  }, [location.pathname]);

  // Track scroll depth
  useEffect(() => {
    let maxScroll = 0;
    
    const handleScroll = () => {
      const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      maxScroll = Math.max(maxScroll, scrollPercentage);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const value: AnalyticsContextType = {
    trackPageView,
    trackAction,
    trackProductView,
    trackAddToCart,
    trackRemoveFromCart,
    trackSearch,
    trackCheckoutStart,
    trackCheckoutComplete,
    currentSession,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};
