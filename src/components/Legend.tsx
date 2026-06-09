import { parentLabels } from "../data/mockSchedule";

export function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-teal-500" />
        <span>{parentLabels.mom}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-indigo-500" />
        <span>{parentLabels.dad}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-amber-400" />
        <span>Activity</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-rose-400" />
        <span>Transition</span>
      </div>
    </div>
  );
}
