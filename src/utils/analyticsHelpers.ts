import {
  VisitorSession,
  AnalyticsSummary,
  ProductPerformance,
  PagePerformance,
  TrafficSourceStats,
  DeviceStats,
  TimeSeriesData,
  ConversionFunnel,
  RealtimeStats,
} from '@/types/analytics';

// Get all analytics sessions from localStorage
export const getAllSessions = (): VisitorSession[] => {
  try {
    const sessions = localStorage.getItem('all_analytics_sessions');
    return sessions ? JSON.parse(sessions) : [];
  } catch (error) {
    console.error('Error loading analytics sessions:', error);
    return [];
  }
};

// Get active sessions (last activity within 30 minutes)
export const getActiveSessions = (): VisitorSession[] => {
  const sessions = getAllSessions();
  const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
  return sessions.filter(session => session.lastActivity > thirtyMinutesAgo);
};

// Calculate analytics summary
export const calculateAnalyticsSummary = (
  sessions: VisitorSession[],
  startDate?: number,
  endDate?: number
): AnalyticsSummary => {
  const filteredSessions = sessions.filter(session => {
    if (startDate && session.startTime < startDate) return false;
    if (endDate && session.startTime > endDate) return false;
    return true;
  });

  const totalVisitors = filteredSessions.length;
  const activeSessions = getActiveSessions();
  const activeVisitors = activeSessions.length;

  // Calculate total page views
  const totalPageViews = filteredSessions.reduce((sum, session) => sum + session.pages.length, 0);

  // Calculate average session duration
  const totalDuration = filteredSessions.reduce((sum, session) => sum + session.totalTimeSpent, 0);
  const averageSessionDuration = totalVisitors > 0 ? totalDuration / totalVisitors : 0;

  // Calculate bounce rate
  const bouncedSessions = filteredSessions.filter(session => session.bounced).length;
  const bounceRate = totalVisitors > 0 ? (bouncedSessions / totalVisitors) * 100 : 0;

  // Calculate conversion rate
  const conversions = filteredSessions.filter(session =>
    session.actions.some(action => action.type === 'checkout_complete')
  ).length;
  const conversionRate = totalVisitors > 0 ? (conversions / totalVisitors) * 100 : 0;

  // Calculate total revenue
  const totalRevenue = filteredSessions.reduce((sum, session) => {
    const checkoutActions = session.actions.filter(action => action.type === 'checkout_complete');
    return sum + checkoutActions.reduce((actionSum, action) => actionSum + (action.data?.orderValue || 0), 0);
  }, 0);

  // Calculate top products
  const topProducts = calculateTopProducts(filteredSessions);

  // Calculate top pages
  const topPages = calculateTopPages(filteredSessions);

  // Calculate traffic sources
  const trafficSources = calculateTrafficSources(filteredSessions);

  // Calculate device breakdown
  const deviceBreakdown = calculateDeviceBreakdown(filteredSessions);

  // Calculate time series data
  const timeSeriesData = calculateTimeSeriesData(filteredSessions);

  return {
    totalVisitors,
    activeVisitors,
    totalPageViews,
    averageSessionDuration,
    bounceRate,
    conversionRate,
    totalRevenue,
    topProducts,
    topPages,
    trafficSources,
    deviceBreakdown,
    timeSeriesData,
  };
};

// Calculate top products
export const calculateTopProducts = (sessions: VisitorSession[]): ProductPerformance[] => {
  const productMap = new Map<string, ProductPerformance>();

  sessions.forEach(session => {
    session.actions.forEach(action => {
      if (action.type === 'product_view' || action.type === 'add_to_cart' || action.type === 'checkout_complete') {
        const productId = action.data?.productId;
        const productName = action.data?.productName;
        
        if (!productId) return;

        if (!productMap.has(productId)) {
          productMap.set(productId, {
            productId,
            productName: productName || 'Unknown Product',
            views: 0,
            addedToCart: 0,
            purchased: 0,
            revenue: 0,
            conversionRate: 0,
          });
        }

        const product = productMap.get(productId)!;

        if (action.type === 'product_view') {
          product.views++;
        } else if (action.type === 'add_to_cart') {
          product.addedToCart++;
        } else if (action.type === 'checkout_complete') {
          product.purchased++;
          product.revenue += action.data?.orderValue || 0;
        }
      }
    });
  });

  // Calculate conversion rates
  productMap.forEach(product => {
    if (product.views > 0) {
      product.conversionRate = (product.purchased / product.views) * 100;
    }
  });

  return Array.from(productMap.values())
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);
};

// Calculate top pages
export const calculateTopPages = (sessions: VisitorSession[]): PagePerformance[] => {
  const pageMap = new Map<string, { views: number; uniqueVisitors: Set<string>; totalTime: number; exits: number }>();

  sessions.forEach(session => {
    session.pages.forEach((page, index) => {
      if (!pageMap.has(page.path)) {
        pageMap.set(page.path, {
          views: 0,
          uniqueVisitors: new Set(),
          totalTime: 0,
          exits: 0,
        });
      }

      const pageData = pageMap.get(page.path)!;
      pageData.views++;
      pageData.uniqueVisitors.add(session.sessionId);
      pageData.totalTime += page.timeSpent;

      // Check if this is the last page (exit)
      if (index === session.pages.length - 1) {
        pageData.exits++;
      }
    });
  });

  const pagePerformance: PagePerformance[] = [];

  pageMap.forEach((data, path) => {
    const uniqueVisitors = data.uniqueVisitors.size;
    const averageTimeSpent = data.views > 0 ? data.totalTime / data.views : 0;
    const exitRate = data.views > 0 ? (data.exits / data.views) * 100 : 0;
    const bounceRate = 0; // Simplified for now

    pagePerformance.push({
      path,
      title: path,
      views: data.views,
      uniqueVisitors,
      averageTimeSpent,
      bounceRate,
      exitRate,
    });
  });

  return pagePerformance.sort((a, b) => b.views - a.views).slice(0, 10);
};

// Calculate traffic sources
export const calculateTrafficSources = (sessions: VisitorSession[]): TrafficSourceStats[] => {
  const sourceMap = new Map<string, { visitors: number; bounced: number; conversions: number; revenue: number }>();

  sessions.forEach(session => {
    const source = session.referrer.source;

    if (!sourceMap.has(source)) {
      sourceMap.set(source, {
        visitors: 0,
        bounced: 0,
        conversions: 0,
        revenue: 0,
      });
    }

    const sourceData = sourceMap.get(source)!;
    sourceData.visitors++;

    if (session.bounced) {
      sourceData.bounced++;
    }

    const hasConversion = session.actions.some(action => action.type === 'checkout_complete');
    if (hasConversion) {
      sourceData.conversions++;
      const revenue = session.actions
        .filter(action => action.type === 'checkout_complete')
        .reduce((sum, action) => sum + (action.data?.orderValue || 0), 0);
      sourceData.revenue += revenue;
    }
  });

  const totalVisitors = sessions.length;
  const trafficSources: TrafficSourceStats[] = [];

  sourceMap.forEach((data, source) => {
    const percentage = totalVisitors > 0 ? (data.visitors / totalVisitors) * 100 : 0;
    const bounceRate = data.visitors > 0 ? (data.bounced / data.visitors) * 100 : 0;
    const conversionRate = data.visitors > 0 ? (data.conversions / data.visitors) * 100 : 0;

    trafficSources.push({
      source,
      visitors: data.visitors,
      percentage,
      bounceRate,
      conversionRate,
      revenue: data.revenue,
    });
  });

  return trafficSources.sort((a, b) => b.visitors - a.visitors);
};

// Calculate device breakdown
export const calculateDeviceBreakdown = (sessions: VisitorSession[]): DeviceStats[] => {
  const deviceMap = new Map<string, { visitors: number; totalDuration: number }>();

  sessions.forEach(session => {
    const device = session.device.type;

    if (!deviceMap.has(device)) {
      deviceMap.set(device, {
        visitors: 0,
        totalDuration: 0,
      });
    }

    const deviceData = deviceMap.get(device)!;
    deviceData.visitors++;
    deviceData.totalDuration += session.totalTimeSpent;
  });

  const totalVisitors = sessions.length;
  const deviceStats: DeviceStats[] = [];

  deviceMap.forEach((data, device) => {
    const percentage = totalVisitors > 0 ? (data.visitors / totalVisitors) * 100 : 0;
    const averageSessionDuration = data.visitors > 0 ? data.totalDuration / data.visitors : 0;

    deviceStats.push({
      device,
      visitors: data.visitors,
      percentage,
      averageSessionDuration,
    });
  });

  return deviceStats.sort((a, b) => b.visitors - a.visitors);
};

// Calculate time series data
export const calculateTimeSeriesData = (sessions: VisitorSession[]): TimeSeriesData[] => {
  const dateMap = new Map<string, { visitors: number; pageViews: number; revenue: number; conversions: number }>();

  sessions.forEach(session => {
    const date = new Date(session.startTime).toISOString().split('T')[0];

    if (!dateMap.has(date)) {
      dateMap.set(date, {
        visitors: 0,
        pageViews: 0,
        revenue: 0,
        conversions: 0,
      });
    }

    const dateData = dateMap.get(date)!;
    dateData.visitors++;
    dateData.pageViews += session.pages.length;

    const checkoutActions = session.actions.filter(action => action.type === 'checkout_complete');
    if (checkoutActions.length > 0) {
      dateData.conversions++;
      dateData.revenue += checkoutActions.reduce((sum, action) => sum + (action.data?.orderValue || 0), 0);
    }
  });

  const timeSeriesData: TimeSeriesData[] = [];

  dateMap.forEach((data, date) => {
    timeSeriesData.push({
      timestamp: new Date(date).getTime(),
      date,
      visitors: data.visitors,
      pageViews: data.pageViews,
      revenue: data.revenue,
      conversions: data.conversions,
    });
  });

  return timeSeriesData.sort((a, b) => a.timestamp - b.timestamp);
};

// Calculate conversion funnel
export const calculateConversionFunnel = (sessions: VisitorSession[]): ConversionFunnel[] => {
  const totalVisitors = sessions.length;
  const productViews = sessions.filter(s => s.actions.some(a => a.type === 'product_view')).length;
  const addedToCart = sessions.filter(s => s.actions.some(a => a.type === 'add_to_cart')).length;
  const checkoutStarted = sessions.filter(s => s.actions.some(a => a.type === 'checkout_start')).length;
  const checkoutCompleted = sessions.filter(s => s.actions.some(a => a.type === 'checkout_complete')).length;

  return [
    {
      stage: 'Visitors',
      users: totalVisitors,
      percentage: 100,
      dropOffRate: 0,
    },
    {
      stage: 'Product Views',
      users: productViews,
      percentage: totalVisitors > 0 ? (productViews / totalVisitors) * 100 : 0,
      dropOffRate: totalVisitors > 0 ? ((totalVisitors - productViews) / totalVisitors) * 100 : 0,
    },
    {
      stage: 'Added to Cart',
      users: addedToCart,
      percentage: totalVisitors > 0 ? (addedToCart / totalVisitors) * 100 : 0,
      dropOffRate: productViews > 0 ? ((productViews - addedToCart) / productViews) * 100 : 0,
    },
    {
      stage: 'Checkout Started',
      users: checkoutStarted,
      percentage: totalVisitors > 0 ? (checkoutStarted / totalVisitors) * 100 : 0,
      dropOffRate: addedToCart > 0 ? ((addedToCart - checkoutStarted) / addedToCart) * 100 : 0,
    },
    {
      stage: 'Purchase Complete',
      users: checkoutCompleted,
      percentage: totalVisitors > 0 ? (checkoutCompleted / totalVisitors) * 100 : 0,
      dropOffRate: checkoutStarted > 0 ? ((checkoutStarted - checkoutCompleted) / checkoutStarted) * 100 : 0,
    },
  ];
};

// Get realtime stats
export const getRealtimeStats = (): RealtimeStats => {
  const activeSessions = getActiveSessions();
  
  // Get active pages
  const pageMap = new Map<string, number>();
  activeSessions.forEach(session => {
    const lastPage = session.pages[session.pages.length - 1];
    if (lastPage) {
      pageMap.set(lastPage.path, (pageMap.get(lastPage.path) || 0) + 1);
    }
  });

  const activePages = Array.from(pageMap.entries())
    .map(([path, visitors]) => ({ path, visitors }))
    .sort((a, b) => b.visitors - a.visitors)
    .slice(0, 5);

  // Get recent actions (last 10 minutes)
  const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
  const recentActions = activeSessions
    .flatMap(session => session.actions)
    .filter(action => action.timestamp > tenMinutesAgo)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 20);

  // Get top products being viewed right now
  const productMap = new Map<string, { name: string; views: number }>();
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  
  activeSessions.forEach(session => {
    session.actions
      .filter(action => action.type === 'product_view' && action.timestamp > fiveMinutesAgo)
      .forEach(action => {
        const id = action.data?.productId;
        const name = action.data?.productName;
        if (id) {
          const existing = productMap.get(id);
          productMap.set(id, {
            name: name || existing?.name || 'Unknown',
            views: (existing?.views || 0) + 1,
          });
        }
      });
  });

  const topProducts = Array.from(productMap.entries())
    .map(([id, data]) => ({ id, name: data.name, views: data.views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  return {
    activeVisitors: activeSessions.length,
    activePages,
    recentActions,
    topProducts,
  };
};

// Format duration
export const formatDuration = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

// Format currency
export const formatCurrency = (amount: number): string => {
  return `$${amount.toFixed(2)}`;
};
