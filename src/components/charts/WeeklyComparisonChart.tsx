import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ParentId } from "../../types/custody";
import { formatDuration } from "../../utils/dates";

interface WeeklyComparisonItem {
  key: string;
  label: string;
  hoursByParent: Record<ParentId, number>;
}

interface WeeklyComparisonChartProps {
  items: WeeklyComparisonItem[];
  parentLabels: Record<ParentId, string>;
}

export function WeeklyComparisonChart({ items, parentLabels }: WeeklyComparisonChartProps) {
  const data = items.map((item) => ({
    name: item.label,
    mom: item.hoursByParent.mom,
    dad: item.hoursByParent.dad,
  }));

  return (
    <div className="h-60">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 6, left: -24, bottom: 0 }}>
          <CartesianGrid stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
          <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={formatDuration} />
          <Tooltip formatter={(value, name) => [formatDuration(Number(value)), parentLabels[name as ParentId]]} />
          <Legend
            formatter={(value) => parentLabels[value as ParentId]}
            iconType="circle"
            wrapperStyle={{ fontSize: 12 }}
          />
          <Bar dataKey="mom" fill="#14b8a6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="dad" fill="#6366f1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
