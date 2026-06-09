import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ParentId } from "../../types/custody";
import { formatDuration } from "../../utils/dates";

interface TimeBarItem {
  key: string;
  label: string;
  hoursByParent: Record<ParentId, number>;
}

interface StackedTimeBarsProps {
  items: TimeBarItem[];
  parentLabels: Record<ParentId, string>;
}

export function StackedTimeBars({ items, parentLabels }: StackedTimeBarsProps) {
  const data = items.map((item) => ({
    name: item.label,
    mom: item.hoursByParent.mom,
    dad: item.hoursByParent.dad,
  }));

  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 6, left: -24, bottom: 0 }}>
          <CartesianGrid stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
          <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={formatDuration} />
          <Tooltip formatter={(value, name) => [formatDuration(Number(value)), parentLabels[name as ParentId]]} />
          <Bar dataKey="mom" stackId="parents" fill="#14b8a6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="dad" stackId="parents" fill="#6366f1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
