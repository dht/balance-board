import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { ParentId } from "../../types/custody";
import { formatDuration } from "../../utils/dates";

interface ParentSplitDonutProps {
  hoursByParent: Record<ParentId, number>;
  parentLabels: Record<ParentId, string>;
}

const colors: Record<ParentId, string> = {
  mom: "#14b8a6",
  dad: "#6366f1",
};

export function ParentSplitDonut({ hoursByParent, parentLabels }: ParentSplitDonutProps) {
  const total = hoursByParent.mom + hoursByParent.dad;
  const data = [
    { parentId: "mom" as const, name: parentLabels.mom, value: hoursByParent.mom },
    { parentId: "dad" as const, name: parentLabels.dad, value: hoursByParent.dad },
  ];
  const momPercent = total > 0 ? Math.round((hoursByParent.mom / total) * 100) : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-[8rem_1fr] sm:items-center">
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={38} outerRadius={58}>
              {data.map((entry) => (
                <Cell key={entry.parentId} fill={colors[entry.parentId]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatDuration(Number(value))} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-2 text-sm">
        <p className="text-2xl font-semibold text-slate-900">{momPercent}%</p>
        {data.map((entry) => (
          <div key={entry.parentId} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 font-medium text-slate-700">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: colors[entry.parentId] }}
              />
              {entry.name}
            </span>
            <span className="text-slate-500">{formatDuration(entry.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
