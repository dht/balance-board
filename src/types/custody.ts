export type ParentId = "mom" | "dad";

export interface Child {
  id: string;
  initial: string;
  bedTime: string;
  wakeUpTime: string;
  schoolHours: Partial<Record<0 | 1 | 2 | 3 | 4, TimeRange>>;
}

export type ActivityType = "class" | "sport" | "social" | "family" | "special";

export interface TimeRange {
  start: string;
  end: string;
}

export interface Activity {
  id: string;
  childIds: Child["id"][];
  title: string;
  time: string;
  type: ActivityType;
  durationHours: number;
}

export interface ChildCustodyHours {
  childId: Child["id"];
  parentId: ParentId;
  transitionParentId?: ParentId;
  transitionHours: number;
  hours: number;
  sleepHours: number;
  schoolHours: number;
  activityHours: number;
  qualityParentHours: number;
  qualityHoursByParent: Record<ParentId, number>;
}

export interface Transition {
  id: string;
  date: string;
  name: string;
  hours: number;
  mainParent: ParentId;
  otherParent: ParentId;
}

export interface CustodyDay {
  date: string;
  parentId: ParentId;
  childIds: Child["id"][];
  childCustody: ChildCustodyHours[];
  activities: Activity[];
  transition?: Transition;
  specialPeriod?: SpecialPeriod;
}

export interface RecurringClass {
  id: string;
  title: string;
  weekday: number;
  time: string;
  type: ActivityType;
  durationHours: number;
}

export interface SpecialPeriod {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  withParent: ParentId;
  note?: string;
}

export interface MonthlyStats {
  monthKey: string;
  monthLabel: string;
  hoursByParent: Record<ParentId, number>;
  percentByParent: Record<ParentId, number>;
}

export interface WeeklyStats {
  weekKey: string;
  weekOfYear: number;
  label: string;
  hoursByParent: Record<ParentId, number>;
}
