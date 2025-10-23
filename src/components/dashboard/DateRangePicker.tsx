import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
export type TimeRange = '24h' | '7d' | '30d';
interface DateRangePickerProps {
  value: TimeRange;
  onValueChange: (value: TimeRange) => void;
}
export function DateRangePicker({ value, onValueChange }: DateRangePickerProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[180px] bg-card">
        <SelectValue placeholder="Select a time range" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="24h">Last 24 hours</SelectItem>
        <SelectItem value="7d">Last 7 days</SelectItem>
        <SelectItem value="30d">Last 30 days</SelectItem>
      </SelectContent>
    </Select>
  )
}