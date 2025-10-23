import { Hono } from "hono";
import type { Env } from './core-utils';
import { TicketEntity, ExpertEntity } from "./entities";
import { ok, bad, notFound } from './core-utils';
import { Ticket, TicketStatus, OverTimeDataPoint, TrendDataPoint, PaginatedResponse } from '@shared/types';
import { subDays, startOfDay, endOfDay, formatISO, differenceInMinutes } from 'date-fns';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // Ensure seed data for entities
  app.use('/api/*', async (c, next) => {
    await ExpertEntity.ensureSeed(c.env);
    await TicketEntity.ensureSeed(c.env);
    await next();
  });
  const getRangeDates = (range: string): { from: Date, to: Date } => {
    const to = new Date();
    let days;
    switch (range) {
      case '7d': days = 7; break;
      case '30d': days = 30; break;
      default: days = 1; break; // '24h'
    }
    const from = subDays(to, days);
    return { from, to };
  };
  app.get('/api/dashboard/metrics', async (c) => {
    const range = c.req.query('range') || '24h';
    const { from, to } = getRangeDates(range);
    const allTickets = (await TicketEntity.list(c.env)).items;
    const filterTicketsByDate = (tickets: Ticket[], startDate: Date, endDate: Date) =>
      tickets.filter(t => {
        const createdAt = new Date(t.createdAt);
        return createdAt >= startDate && createdAt <= endDate;
      });
    const currentPeriodTickets = filterTicketsByDate(allTickets, from, to);
    const prevDays = range === '24h' ? 1 : (range === '7d' ? 7 : 30);
    const prevFrom = subDays(from, prevDays);
    const previousPeriodTickets = filterTicketsByDate(allTickets, prevFrom, from);
    const calculateMetrics = (tickets: Ticket[]) => {
      const resolvedTickets = tickets.filter(t => t.status === TicketStatus.Resolved || t.status === TicketStatus.Closed);
      const vibersHelped = resolvedTickets.length;
      const totalResolutionTime = resolvedTickets.reduce((sum, t) => {
        if (t.resolvedAt) {
          return sum + differenceInMinutes(new Date(t.resolvedAt), new Date(t.createdAt));
        }
        return sum;
      }, 0);
      const avgResolutionTime = vibersHelped > 0 ? Math.round(totalResolutionTime / vibersHelped) : 0;
      const totalSatisfaction = resolvedTickets.reduce((sum, t) => sum + t.satisfactionScore, 0);
      const satisfactionRate = vibersHelped > 0 ? Math.round((totalSatisfaction / (vibersHelped * 5)) * 100) : 0;
      return { vibersHelped, avgResolutionTime, satisfactionRate };
    };
    const currentMetrics = calculateMetrics(currentPeriodTickets);
    const previousMetrics = calculateMetrics(previousPeriodTickets);
    const getChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100);
    };
    const activeExperts = (await ExpertEntity.list(c.env)).items.length;
    return ok(c, {
      vibersHelped: { value: currentMetrics.vibersHelped, change: getChange(currentMetrics.vibersHelped, previousMetrics.vibersHelped) },
      avgResolutionTime: { value: currentMetrics.avgResolutionTime, change: getChange(currentMetrics.avgResolutionTime, previousMetrics.avgResolutionTime) * -1 }, // Inverted change
      satisfactionRate: { value: currentMetrics.satisfactionRate, change: getChange(currentMetrics.satisfactionRate, previousMetrics.satisfactionRate) },
      activeExperts: { value: activeExperts, change: 0 },
    });
  });
  app.get('/api/dashboard/trends', async (c) => {
    const range = c.req.query('range') || '24h';
    const { from, to } = getRangeDates(range);
    const tickets = (await TicketEntity.list(c.env)).items.filter(t => {
      const createdAt = new Date(t.createdAt);
      return createdAt >= from && createdAt <= to;
    });
    const aggregateCount = (key: 'platform' | 'issueType'): TrendDataPoint[] => {
      const counts = tickets.reduce((acc, ticket) => {
        acc[ticket[key]] = (acc[ticket[key]] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      return Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    };
    return ok(c, {
      platforms: aggregateCount('platform'),
      issues: aggregateCount('issueType'),
    });
  });
  app.get('/api/dashboard/performance', async (c) => {
    const range = c.req.query('range') || '7d';
    const days = range === '30d' ? 30 : 7;
    const allTickets = (await TicketEntity.list(c.env)).items;
    const data: OverTimeDataPoint[] = Array.from({ length: days }, (_, i) => {
      const date = subDays(new Date(), days - 1 - i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      const created = allTickets.filter(t => {
        const createdAt = new Date(t.createdAt);
        return createdAt >= dayStart && createdAt <= dayEnd;
      }).length;
      const resolved = allTickets.filter(t => {
        if (!t.resolvedAt) return false;
        const resolvedAt = new Date(t.resolvedAt);
        return resolvedAt >= dayStart && resolvedAt <= dayEnd;
      }).length;
      return {
        date: formatISO(date, { representation: 'date' }),
        created,
        resolved,
      };
    });
    return ok(c, data);
  });
  app.get('/api/tickets', async (c) => {
    const { q, status, platform, sortBy, sortOrder, page, pageSize } = c.req.query();
    const pageNum = parseInt(page || '1', 10);
    const size = parseInt(pageSize || '10', 10);
    let allTickets = (await TicketEntity.list(c.env)).items;
    // Filtering
    if (q) {
      const lowerCaseQuery = q.toLowerCase();
      allTickets = allTickets.filter(t => 
        t.id.toLowerCase().includes(lowerCaseQuery) || 
        t.viberQuery.toLowerCase().includes(lowerCaseQuery)
      );
    }
    if (status) {
      allTickets = allTickets.filter(t => t.status === status);
    }
    if (platform) {
      allTickets = allTickets.filter(t => t.platform === platform);
    }
    // Sorting
    if (sortBy) {
      allTickets.sort((a, b) => {
        const valA = a[sortBy as keyof Ticket];
        const valB = b[sortBy as keyof Ticket];
        let comparison = 0;
        if (valA > valB) {
          comparison = 1;
        } else if (valA < valB) {
          comparison = -1;
        }
        return sortOrder === 'desc' ? comparison * -1 : comparison;
      });
    }
    // Pagination
    const totalCount = allTickets.length;
    const totalPages = Math.ceil(totalCount / size);
    const paginatedItems = allTickets.slice((pageNum - 1) * size, pageNum * size);
    const response: PaginatedResponse<Ticket> = {
      items: paginatedItems,
      totalCount,
      page: pageNum,
      pageSize: size,
      totalPages,
    };
    return ok(c, response);
  });
  app.get('/api/tickets/:id', async (c) => {
    const { id } = c.req.param();
    const ticket = new TicketEntity(c.env, id);
    if (await ticket.exists()) {
      return ok(c, await ticket.getState());
    }
    return notFound(c, 'Ticket not found');
  });
}