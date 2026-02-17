import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Users,
  ShoppingCart,
  DollarSign,
  Eye,
  Activity,
  Clock,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  ArrowUp,
  ArrowDown,
  Calendar,
  Filter,
  Download,
  RefreshCw,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  getAllSessions,
  calculateAnalyticsSummary,
  calculateConversionFunnel,
  getRealtimeStats,
  formatDuration,
  formatCurrency,
} from '@/utils/analyticsHelpers';
import { AnalyticsSummary } from '@/types/analytics';

const AdminDashboard = () => {
  const [dateRange, setDateRange] = useState<'today' | '7days' | '30days' | 'all'>('7days');
  const [isLoading, setIsLoading] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [realtimeStats, setRealtimeStats] = useState(getRealtimeStats());

  // Calculate date range
  const getDateRange = () => {
    const now = Date.now();
    switch (dateRange) {
      case 'today':
        return { start: startOfDay(now).getTime(), end: endOfDay(now).getTime() };
      case '7days':
        return { start: subDays(now, 7).getTime(), end: now };
      case '30days':
        return { start: subDays(now, 30).getTime(), end: now };
      case 'all':
        return { start: 0, end: now };
      default:
        return { start: subDays(now, 7).getTime(), end: now };
    }
  };

  // Load analytics data
  const loadAnalytics = () => {
    setIsLoading(true);
    const sessions = getAllSessions();
    const { start, end } = getDateRange();
    const summary = calculateAnalyticsSummary(sessions, start, end);
    setAnalytics(summary);
    setIsLoading(false);
  };

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  // Refresh realtime stats every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeStats(getRealtimeStats());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Calculate conversion funnel
  const conversionFunnel = useMemo(() => {
    const sessions = getAllSessions();
    const { start, end } = getDateRange();
    const filteredSessions = sessions.filter(s => s.startTime >= start && s.startTime <= end);
    return calculateConversionFunnel(filteredSessions);
  }, [dateRange]);

  if (!analytics) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-white sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-elegant">Analytics Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Track your store performance and customer behavior
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
                <SelectTrigger className="w-[140px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={loadAnalytics}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Real-time Stats Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary animate-pulse" />
              <span className="font-medium">Real-time Activity</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{realtimeStats.activeVisitors}</div>
                <div className="text-xs text-muted-foreground">Active Now</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{realtimeStats.recentActions.length}</div>
                <div className="text-xs text-muted-foreground">Actions (10m)</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <MetricCard
            title="Total Visitors"
            value={analytics.totalVisitors.toLocaleString()}
            icon={Users}
            trend={12.5}
            color="bg-blue-500"
          />
          <MetricCard
            title="Page Views"
            value={analytics.totalPageViews.toLocaleString()}
            icon={Eye}
            trend={8.3}
            color="bg-purple-500"
          />
          <MetricCard
            title="Conversion Rate"
            value={`${analytics.conversionRate.toFixed(1)}%`}
            icon={ShoppingCart}
            trend={-2.1}
            color="bg-green-500"
          />
          <MetricCard
            title="Total Revenue"
            value={formatCurrency(analytics.totalRevenue)}
            icon={DollarSign}
            trend={15.8}
            color="bg-orange-500"
          />
        </div>

        {/* Charts Section */}
        <Tabs defaultValue="overview" className="mb-8">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="traffic">Traffic</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="realtime">Real-time</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Visitors & Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Visitors & Revenue Over Time</CardTitle>
                <CardDescription>Daily breakdown of visitors and revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={analytics.timeSeriesData}>
                    <defs>
                      <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                      stroke="#6b7280"
                    />
                    <YAxis yAxisId="left" stroke="#8b5cf6" />
                    <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
                      labelFormatter={(date) => format(new Date(date), 'MMM dd, yyyy')}
                    />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="visitors"
                      stroke="#8b5cf6"
                      fillOpacity={1}
                      fill="url(#colorVisitors)"
                      name="Visitors"
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                      name="Revenue ($)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Conversion Funnel */}
              <Card>
                <CardHeader>
                  <CardTitle>Conversion Funnel</CardTitle>
                  <CardDescription>User journey from visit to purchase</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {conversionFunnel.map((stage, index) => (
                      <div key={stage.stage}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{stage.stage}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold">{stage.users}</span>
                            <span className="text-xs text-muted-foreground">
                              ({stage.percentage.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                        <div className="relative h-8 bg-secondary rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${stage.percentage}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent"
                          />
                        </div>
                        {index < conversionFunnel.length - 1 && stage.dropOffRate > 0 && (
                          <div className="text-xs text-destructive mt-1">
                            ↓ {stage.dropOffRate.toFixed(1)}% drop-off
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Device Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Device Breakdown</CardTitle>
                  <CardDescription>Visitors by device type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics.deviceBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ device, percentage }) => `${device} ${percentage.toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="visitors"
                      >
                        {analytics.deviceBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {analytics.deviceBreakdown.map((device, index) => {
                      const Icon = device.device === 'mobile' ? Smartphone : device.device === 'tablet' ? Tablet : Monitor;
                      return (
                        <div key={device.device} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <Icon className="h-4 w-4" />
                            <span className="text-sm capitalize">{device.device}</span>
                          </div>
                          <span className="text-sm font-medium">{device.visitors}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Traffic Tab */}
          <TabsContent value="traffic" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Traffic Sources */}
              <Card>
                <CardHeader>
                  <CardTitle>Traffic Sources</CardTitle>
                  <CardDescription>Where your visitors come from</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.trafficSources}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="source" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }} />
                      <Bar dataKey="visitors" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-3">
                    {analytics.trafficSources.map((source) => (
                      <div key={source.source} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                        <div>
                          <div className="font-medium capitalize">{source.source}</div>
                          <div className="text-xs text-muted-foreground">
                            {source.visitors} visitors • {source.percentage.toFixed(1)}%
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-green-600">
                            {source.conversionRate.toFixed(1)}% CVR
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatCurrency(source.revenue)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Pages */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Pages</CardTitle>
                  <CardDescription>Most visited pages</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.topPages.slice(0, 10).map((page, index) => (
                      <div key={page.path} className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{page.path}</div>
                          <div className="text-xs text-muted-foreground">
                            {page.views} views • {page.uniqueVisitors} unique
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{formatDuration(page.averageTimeSpent)}</div>
                          <div className="text-xs text-muted-foreground">avg time</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
                <CardDescription>Best performing products</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topProducts.map((product, index) => (
                    <div key={product.productId} className="p-4 bg-secondary rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{product.productName}</div>
                            <div className="text-xs text-muted-foreground">ID: {product.productId}</div>
                          </div>
                        </div>
                        <Badge variant={product.conversionRate > 5 ? 'default' : 'secondary'}>
                          {product.conversionRate.toFixed(1)}% CVR
                        </Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div>
                          <div className="text-lg font-bold">{product.views}</div>
                          <div className="text-xs text-muted-foreground">Views</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold">{product.addedToCart}</div>
                          <div className="text-xs text-muted-foreground">Added</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold">{product.purchased}</div>
                          <div className="text-xs text-muted-foreground">Sold</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-green-600">{formatCurrency(product.revenue)}</div>
                          <div className="text-xs text-muted-foreground">Revenue</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Real-time Tab */}
          <TabsContent value="realtime" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Active Pages */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary animate-pulse" />
                    Active Pages Right Now
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {realtimeStats.activePages.length > 0 ? (
                      realtimeStats.activePages.map((page) => (
                        <div key={page.path} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                          <span className="text-sm font-medium truncate">{page.path}</span>
                          <Badge variant="default">{page.visitors} active</Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No active visitors</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Top Products Being Viewed */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Trending Products (5m)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {realtimeStats.topProducts.length > 0 ? (
                      realtimeStats.topProducts.map((product, index) => (
                        <div key={product.id} className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium">{product.name}</div>
                            <div className="text-xs text-muted-foreground">{product.views} views</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No recent product views</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity (Last 10 minutes)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {realtimeStats.recentActions.length > 0 ? (
                    realtimeStats.recentActions.map((action, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 hover:bg-secondary rounded-lg transition-colors">
                        <div className="text-xs text-muted-foreground w-16">
                          {format(action.timestamp, 'HH:mm:ss')}
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {action.type.replace('_', ' ')}
                        </Badge>
                        <div className="text-sm flex-1 truncate">{action.page}</div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No recent activity</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Avg. Session Duration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatDuration(analytics.averageSessionDuration)}</div>
              <p className="text-xs text-muted-foreground mt-1">Time spent per visit</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Bounce Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics.bounceRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground mt-1">Single-page visits</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pages per Session</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {analytics.totalVisitors > 0 ? (analytics.totalPageViews / analytics.totalVisitors).toFixed(1) : '0'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Average pages viewed</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCard = ({
  title,
  value,
  icon: Icon,
  trend,
  color,
}: {
  title: string;
  value: string;
  icon: any;
  trend: number;
  color: string;
}) => {
  const isPositive = trend > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
              <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
            </div>
            <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              {Math.abs(trend)}%
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold mb-1">{value}</div>
          <div className="text-sm text-muted-foreground">{title}</div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AdminDashboard;
