export interface AdminAnalyticsSummary {
  range: string;
  period: { start: string | null; end: string };
  orderCount: number;
  revenue: number;
  averageOrderValue: number;
  ordersByStatus: Record<string, number>;
  revenueByDay: { date: string; orderCount: number; revenue: number }[];
  trends: {
    orderCount: number;
    revenue: number;
    averageOrderValue: number;
  };
  previousPeriod: {
    orderCount: number;
    revenue: number;
  };
}

export interface AdminProductStats {
  total: number;
  active: number;
  inactive: number;
  preorder: number;
}
