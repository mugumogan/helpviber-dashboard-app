import { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { DateRangePicker, TimeRange } from '@/components/dashboard/DateRangePicker';
import { StatCard } from '@/components/dashboard/StatCard';
import { TrendsChart } from '@/components/dashboard/TrendsChart';
import { OverTimeChart } from '@/components/dashboard/OverTimeChart';
import { RecentTicketsTable, SortConfig } from '@/components/dashboard/RecentTicketsTable';
import { TicketsTableToolbar } from '@/components/dashboard/TicketsTableToolbar';
import { api } from '@/lib/api-client';
import { DashboardMetrics, TrendDataPoint, OverTimeDataPoint, Ticket, PaginatedResponse } from '@shared/types';
import { Users, Clock, Smile, ShieldCheck } from 'lucide-react';
import { Toaster, toast } from '@/components/ui/sonner';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useDebounce } from 'react-use';interface Card {id?: string | number;[key: string]: unknown;}interface CardProps {children?: React.ReactNode;className?: string;style?: React.CSSProperties;[key: string]: unknown;}
export function HomePage() {

  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [trends, setTrends] = useState<{platforms: TrendDataPoint[];issues: TrendDataPoint[];} | null>(null);
  const [performance, setPerformance] = useState<OverTimeDataPoint[] | null>(null);
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);

  const [ticketsData, setTicketsData] = useState<PaginatedResponse<Ticket> | null>(null);
  const [isTicketsLoading, setIsTicketsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [platformFilter, setPlatformFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>({ key: 'createdAt', direction: 'desc' });
  const [page, setPage] = useState(1);
  const pageSize = 10;
  useDebounce(() => setDebouncedSearchQuery(searchQuery), 300, [searchQuery]);
  const fetchDashboardData = useCallback(async () => {
    setIsDashboardLoading(true);
    try {
      const [metricsData, trendsData, performanceData] = await Promise.all([
      api<DashboardMetrics>(`/api/dashboard/metrics?range=${timeRange}`),
      api<{platforms: TrendDataPoint[];issues: TrendDataPoint[];}>(`/api/dashboard/trends?range=${timeRange}`),
      api<OverTimeDataPoint[]>(`/api/dashboard/performance?range=${timeRange === '24h' ? '7d' : timeRange}`)]
      );
      setMetrics(metricsData);
      setTrends(trendsData);
      setPerformance(performanceData);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast.error('Failed to load dashboard data.');
    } finally {
      setIsDashboardLoading(false);
    }
  }, [timeRange]);
  const fetchTickets = useCallback(async () => {
    setIsTicketsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        q: debouncedSearchQuery,
        status: statusFilter === 'All' ? '' : statusFilter,
        platform: platformFilter === 'All' ? '' : platformFilter,
        sortBy: sortConfig?.key || 'createdAt',
        sortOrder: sortConfig?.direction || 'desc'
      });
      const data = await api<PaginatedResponse<Ticket>>(`/api/tickets?${params.toString()}`);
      setTicketsData(data);
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
      toast.error('Failed to load tickets.');
    } finally {
      setIsTicketsLoading(false);
    }
  }, [page, debouncedSearchQuery, statusFilter, platformFilter, sortConfig]);
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);
  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);
  const handleSort = (key: keyof Ticket) => {
    setSortConfig((prev) => {
      const isSameKey = prev?.key === key;
      const newDirection = isSameKey && prev.direction === 'desc' ? 'asc' : 'desc';
      return { key, direction: newDirection };
    });
  };
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= (ticketsData?.totalPages || 1)) {
      setPage(newPage);
    }
  };
  return (
    <AppLayout>
      <ThemeToggle className="absolute top-6 right-6" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold font-display tracking-tight text-foreground">VibePulse Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, Admin. Here's what's happening.</p>
            </div>
            <DateRangePicker value={timeRange} onValueChange={setTimeRange} />
          </div>
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <StatCard title="Vibers Helped" value={metrics?.vibersHelped.value.toString() || '0'} change={metrics?.vibersHelped.change || 0} icon={<Users className="h-5 w-5" />} isLoading={isDashboardLoading} />
              <StatCard title="Avg. Resolution Time" value={`${metrics?.avgResolutionTime.value || 0} min`} change={metrics?.avgResolutionTime.change || 0} icon={<Clock className="h-5 w-5" />} isLoading={isDashboardLoading} />
              <StatCard title="Satisfaction Rate" value={`${metrics?.satisfactionRate.value || 0}%`} change={metrics?.satisfactionRate.change || 0} icon={<Smile className="h-5 w-5" />} isLoading={isDashboardLoading} />
              <StatCard title="Active Experts" value={metrics?.activeExperts.value.toString() || '0'} change={metrics?.activeExperts.change || 0} icon={<ShieldCheck className="h-5 w-5" />} isLoading={isDashboardLoading} />
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <TrendsChart title="Trending Platforms" data={trends?.platforms || []} isLoading={isDashboardLoading} />
              <TrendsChart title="Top Issue Types" data={trends?.issues || []} isLoading={isDashboardLoading} />
            </div>
            <div className="grid gap-6">
              <OverTimeChart data={performance || []} isLoading={isDashboardLoading} />
            </div>
            <Card>
              <TicketsTableToolbar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                platformFilter={platformFilter}
                onPlatformChange={setPlatformFilter} />

              <RecentTicketsTable
                tickets={ticketsData?.items || []}
                isLoading={isTicketsLoading}
                sortConfig={sortConfig}
                onSort={handleSort}
                page={page}
                totalPages={ticketsData?.totalPages || 1}
                onPageChange={handlePageChange} />

            </Card>
          </div>
        </div>
      </main>
      <Toaster richColors />
    </AppLayout>);

}