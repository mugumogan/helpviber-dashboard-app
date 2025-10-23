import { subDays, formatISO, differenceInMinutes } from 'date-fns';
import { Ticket, Expert, TicketStatus, DashboardMetrics, TrendDataPoint, OverTimeDataPoint } from './types';
export const MOCK_EXPERTS: Expert[] = [
  { id: 'exp1', name: 'Alice Johnson', avatarUrl: 'https://i.pravatar.cc/150?u=exp1' },
  { id: 'exp2', name: 'Bob Williams', avatarUrl: 'https://i.pravatar.cc/150?u=exp2' },
  { id: 'exp3', name: 'Charlie Brown', avatarUrl: 'https://i.pravatar.cc/150?u=exp3' },
  { id: 'exp4', name: 'Diana Miller', avatarUrl: 'https://i.pravatar.cc/150?u=exp4' },
];
const expertIds = MOCK_EXPERTS.map(e => e.id);
const platforms = ['Web App', 'iOS App', 'Android App', 'API', 'Desktop'];
const issueTypes = ['Authentication', 'UI Glitch', 'Performance', 'Security Review', 'Feature Request', 'Billing'];
const statuses = Object.values(TicketStatus);
const generateRandomTicket = (index: number): Ticket => {
  const createdAt = subDays(new Date(), index);
  const status = statuses[index % statuses.length];
  const resolved = status === TicketStatus.Resolved || status === TicketStatus.Closed;
  const resolvedAtDate = resolved ? subDays(createdAt, -1) : undefined;
  return {
    id: `TKT-${1001 + index}`,
    viberQuery: `User is having trouble with ${issueTypes[index % issueTypes.length].toLowerCase()} on the ${platforms[index % platforms.length]}. They mentioned that the login button is unresponsive after the latest update. They have tried clearing their cache and using an incognito window, but the issue persists. Please advise on the next steps.`,
    platform: platforms[index % platforms.length],
    issueType: issueTypes[index % issueTypes.length],
    status: status,
    expertId: expertIds[index % expertIds.length],
    createdAt: formatISO(createdAt),
    resolvedAt: resolvedAtDate ? formatISO(resolvedAtDate) : undefined,
    satisfactionScore: resolved ? (index % 5) + 1 : 0,
    expertResponse: resolved ? `Hello, thank you for reaching out. We've identified a bug in our latest release that was causing this issue. A hotfix has been deployed. Please try logging in again. We apologize for the inconvenience.` : undefined,
    resolutionNotes: resolved ? `Applied patch v2.3.1 which addresses the authentication service failure. Confirmed with the user that the issue is resolved. Monitored logs for 15 minutes post-deployment, no further errors reported.` : undefined,
  };
};
export const MOCK_TICKETS: Ticket[] = Array.from({ length: 50 }, (_, i) => generateRandomTicket(i));
const generateMetrics = (factor: number): DashboardMetrics => ({
  vibersHelped: { value: Math.floor(125 * factor), change: 12.5 * factor },
  avgResolutionTime: { value: Math.floor(35 / factor), change: -5.2 * factor },
  satisfactionRate: { value: Math.round(92.1 * factor), change: 1.8 * factor },
  activeExperts: { value: MOCK_EXPERTS.length, change: 0 },
});
export const MOCK_DASHBOARD_METRICS: Record<string, DashboardMetrics> = {
  '24h': generateMetrics(1),
  '7d': generateMetrics(7),
  '30d': generateMetrics(30),
};
const generateTrendData = (categories: string[], factor: number): TrendDataPoint[] => {
  return categories.map((name, i) => ({
    name,
    count: Math.floor((Math.random() * 50 + 10) * factor * (categories.length - i)),
  })).sort((a, b) => b.count - a.count);
};
export const MOCK_TREND_DATA: Record<string, { platforms: TrendDataPoint[], issues: TrendDataPoint[] }> = {
  '24h': {
    platforms: generateTrendData(platforms, 1).slice(0, 5),
    issues: generateTrendData(issueTypes, 1).slice(0, 5),
  },
  '7d': {
    platforms: generateTrendData(platforms, 7).slice(0, 5),
    issues: generateTrendData(issueTypes, 7).slice(0, 5),
  },
  '30d': {
    platforms: generateTrendData(platforms, 30).slice(0, 5),
    issues: generateTrendData(issueTypes, 30).slice(0, 5),
  },
};
const generateOverTimeData = (days: number): OverTimeDataPoint[] => {
  return Array.from({ length: days }, (_, i) => {
    const date = subDays(new Date(), days - 1 - i);
    const created = Math.floor(Math.random() * 20 + 10);
    const resolved = Math.floor(created * (Math.random() * 0.4 + 0.5));
    return {
      date: formatISO(date, { representation: 'date' }),
      created,
      resolved,
    };
  });
};
export const MOCK_OVER_TIME_DATA: Record<string, OverTimeDataPoint[]> = {
  '24h': generateOverTimeData(1), // This would be better represented hourly, but for mock simplicity we use days.
  '7d': generateOverTimeData(7),
  '30d': generateOverTimeData(30),
};