import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TicketStatus } from "@shared/types";
import { Search, X } from "lucide-react";
import { Button } from "../ui/button";
interface TicketsTableToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  platformFilter: string;
  onPlatformChange: (platform: string) => void;
}
const platforms = ['All', 'Web App', 'iOS App', 'Android App', 'API', 'Desktop'];
const statuses = ['All', ...Object.values(TicketStatus)];
export function TicketsTableToolbar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  platformFilter,
  onPlatformChange,
}: TicketsTableToolbarProps) {
  const isFiltered = statusFilter !== 'All' || platformFilter !== 'All' || searchQuery !== '';
  const clearFilters = () => {
    onSearchChange('');
    onStatusChange('All');
    onPlatformChange('All');
  };
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-card border-b">
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by ID or query..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="flex w-full sm:w-auto items-center gap-2">
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {statuses.map(status => (
              <SelectItem key={status} value={status}>{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={platformFilter} onValueChange={onPlatformChange}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Filter by platform" />
          </SelectTrigger>
          <SelectContent>
            {platforms.map(platform => (
              <SelectItem key={platform} value={platform}>{platform}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isFiltered && (
          <Button variant="ghost" onClick={clearFilters} size="icon">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}