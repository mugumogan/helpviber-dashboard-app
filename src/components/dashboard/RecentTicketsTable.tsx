import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Ticket, TicketStatus, Expert } from '@shared/types';
import { MOCK_EXPERTS } from '@shared/mock-data';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Star, ArrowUpDown } from 'lucide-react';
import { Button } from '../ui/button';
export type SortConfig = {
  key: keyof Ticket;
  direction: 'asc' | 'desc';
};
interface RecentTicketsTableProps {
  tickets: Ticket[];
  isLoading?: boolean;
  sortConfig: SortConfig | null;
  onSort: (key: keyof Ticket) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}
const expertsMap = new Map(MOCK_EXPERTS.map(e => [e.id, e]));
const statusColors: Record<TicketStatus, string> = {
  [TicketStatus.Open]: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
  [TicketStatus.InProgress]: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
  [TicketStatus.Resolved]: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30',
  [TicketStatus.Closed]: 'bg-gray-500/20 text-gray-500 border-gray-500/30',
};
const SortableHeader = ({
  label,
  sortKey,
  sortConfig,
  onSort,
}: {
  label: string;
  sortKey: keyof Ticket;
  sortConfig: SortConfig | null;
  onSort: (key: keyof Ticket) => void;
}) => {
  const isSorted = sortConfig?.key === sortKey;
  const direction = isSorted ? sortConfig.direction : null;
  return (
    <TableHead>
      <Button variant="ghost" onClick={() => onSort(sortKey)} className="-ml-4">
        {label}
        <ArrowUpDown className={cn("ml-2 h-4 w-4", isSorted ? "text-foreground" : "text-muted-foreground")} />
      </Button>
    </TableHead>
  );
};
export function RecentTicketsTable({ tickets, isLoading, sortConfig, onSort, page, totalPages, onPageChange }: RecentTicketsTableProps) {
  const navigate = useNavigate();
  const handleRowClick = (ticketId: string) => {
    navigate(`/tickets/${ticketId}`);
  };
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Tickets</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader label="Ticket ID" sortKey="id" sortConfig={sortConfig} onSort={onSort} />
              <SortableHeader label="Status" sortKey="status" sortConfig={sortConfig} onSort={onSort} />
              <TableHead>Expert</TableHead>
              <SortableHeader label="Created" sortKey="createdAt" sortConfig={sortConfig} onSort={onSort} />
              <SortableHeader label="Satisfaction" sortKey="satisfactionScore" sortConfig={sortConfig} onSort={onSort} />
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.length > 0 ? tickets.map((ticket) => {
              const expert = expertsMap.get(ticket.expertId);
              return (
                <TableRow key={ticket.id} onClick={() => handleRowClick(ticket.id)} className="cursor-pointer hover:bg-accent">
                  <TableCell className="font-medium">{ticket.id}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("border", statusColors[ticket.status])}>
                      {ticket.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{expert?.name || 'Unassigned'}</TableCell>
                  <TableCell>{formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}</TableCell>
                  <TableCell>
                    {ticket.satisfactionScore > 0 ? (
                      <div className="flex items-center justify-start gap-1">
                        {ticket.satisfactionScore}
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      </div>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            }) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No tickets found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      {totalPages > 1 && (
        <CardFooter className="flex items-center justify-between py-4">
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}