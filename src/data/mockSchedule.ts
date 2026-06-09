import configJson from "./config.json";
import kid001ActivitiesJson from "./kid-001.activities.json";
import kid001ClassesJson from "./kid-001.classes.json";
import kid001SpecialJson from "./kid-001.special.json";
import kid002ActivitiesJson from "./kid-002.activities.json";
import kid002ClassesJson from "./kid-002.classes.json";
import kid002SpecialJson from "./kid-002.special.json";
import type {
  Activity,
  ActivityType,
  Child,
  ChildCustodyHours,
  CustodyDay,
  ParentId,
  RecurringClass,
  SpecialPeriod,
  Transition,
} from "../types/custody";
import {
  addDays,
  daysBetween,
  getMonthDates,
  getTimeRangeHours,
  parseDateKey,
  toDateKey,
} from "../utils/dates";

interface OneOffActivity {
  id: string;
  date: string;
  title: string;
  time: string;
  type: ActivityType;
  durationHours: number;
}

interface KidScheduleFiles {
  childId: Child["id"];
  activities: OneOffActivity[];
  classes: RecurringClass[];
  special: SpecialPeriod[];
}

interface CalendarMonthConfig {
  year: number;
  monthIndex: number;
}

interface CustodyConfig {
  numberOfKids: number;
  children: Child[];
  weekendDays: number[];
  summerVacation: {
    startDate: string;
    endDate: string;
  };
  schoolBreakMonths: number[];
  parents: Record<ParentId, { label: string }>;
  calendarMonths: CalendarMonthConfig[];
  custodyPattern: {
    referenceWeekStart: string;
    alternatingWeekendParents: ParentId[];
    alternatingWeekday: number;
    weekdayRules: Record<ParentId, { fixedWeekdays: number[] }>;
    transition: { name: string; hours: number };
  };
}

export const scheduleConfig = configJson as CustodyConfig;

const kidScheduleFiles: KidScheduleFiles[] = [
  {
    childId: "kid-001",
    activities: kid001ActivitiesJson as OneOffActivity[],
    classes: kid001ClassesJson as RecurringClass[],
    special: kid001SpecialJson as SpecialPeriod[],
  },
  {
    childId: "kid-002",
    activities: kid002ActivitiesJson as OneOffActivity[],
    classes: kid002ClassesJson as RecurringClass[],
    special: kid002SpecialJson as SpecialPeriod[],
  },
].slice(0, scheduleConfig.numberOfKids);

export const children = scheduleConfig.children.slice(0, scheduleConfig.numberOfKids);

export const parentLabels: Record<ParentId, string> = {
  mom: scheduleConfig.parents.mom.label,
  dad: scheduleConfig.parents.dad.label,
};

export const visibleMonths = scheduleConfig.calendarMonths;

export function isConfiguredWeekend(date: Date): boolean {
  return scheduleConfig.weekendDays.includes(date.getDay());
}

export function isSummerVacation(date: Date): boolean {
  const time = date.getTime();
  return (
    time >= parseDateKey(scheduleConfig.summerVacation.startDate).getTime() &&
    time <= parseDateKey(scheduleConfig.summerVacation.endDate).getTime()
  );
}

function getRegularCustodyParent(date: Date): ParentId {
  const pattern = scheduleConfig.custodyPattern;
  const referenceWeekStart = parseDateKey(pattern.referenceWeekStart);
  const weekIndex = Math.floor(daysBetween(referenceWeekStart, date) / 7);
  const weekendParentIndex =
    ((weekIndex % pattern.alternatingWeekendParents.length) +
      pattern.alternatingWeekendParents.length) %
    pattern.alternatingWeekendParents.length;
  const weekendParent = pattern.alternatingWeekendParents[weekendParentIndex];
  const nonWeekendParent = pattern.alternatingWeekendParents.find(
    (parentId) => parentId !== weekendParent,
  );
  const weekday = date.getDay();

  if (isConfiguredWeekend(date)) {
    return weekendParent;
  }

  const fixedWeekdayParent = Object.entries(pattern.weekdayRules).find(([, rule]) =>
    rule.fixedWeekdays.includes(weekday),
  )?.[0] as ParentId | undefined;

  if (fixedWeekdayParent) {
    return fixedWeekdayParent;
  }

  if (weekday === pattern.alternatingWeekday && nonWeekendParent) {
    return nonWeekendParent;
  }

  return weekendParent;
}

function findSpecialPeriod(dateKey: string): SpecialPeriod | undefined {
  const current = parseDateKey(dateKey).getTime();

  return kidScheduleFiles
    .flatMap((kidFile) => kidFile.special)
    .find((period) => {
      const start = parseDateKey(period.startDate).getTime();
      const end = parseDateKey(period.endDate).getTime();
      return current >= start && current <= end;
    });
}

function findChildSpecialPeriod(
  childId: Child["id"],
  dateKey: string,
): SpecialPeriod | undefined {
  const current = parseDateKey(dateKey).getTime();
  const kidFile = kidScheduleFiles.find((file) => file.childId === childId);

  return kidFile?.special.find((period) => {
    const start = parseDateKey(period.startDate).getTime();
    const end = parseDateKey(period.endDate).getTime();
    return current >= start && current <= end;
  });
}

function getCustodyParent(date: Date): ParentId {
  const dateKey = toDateKey(date);
  return findChildSpecialPeriod(children[0].id, dateKey)?.withParent ?? getRegularCustodyParent(date);
}

function getChildCustodyParent(childId: Child["id"], date: Date): ParentId {
  const dateKey = toDateKey(date);
  return findChildSpecialPeriod(childId, dateKey)?.withParent ?? getRegularCustodyParent(date);
}

function isSchoolBreakMonth(date: Date): boolean {
  return scheduleConfig.schoolBreakMonths.includes(date.getMonth());
}

function getChildSleepHours(child: Child): number {
  return getTimeRangeHours(child.bedTime, child.wakeUpTime);
}

function getChildSchoolHours(child: Child, date: Date): number {
  if (isSchoolBreakMonth(date)) {
    return 0;
  }

  const weekday = date.getDay() as 0 | 1 | 2 | 3 | 4;
  const schoolHours = child.schoolHours[weekday];

  if (!schoolHours) {
    return 0;
  }

  return getTimeRangeHours(schoolHours.start, schoolHours.end);
}

function getActivities(date: Date): Activity[] {
  const dateKey = toDateKey(date);
  const day = date.getDay();

  return kidScheduleFiles.flatMap((kidFile) => {
    const classes = kidFile.classes
      .filter((kidClass) => kidClass.weekday === day && !isSchoolBreakMonth(date))
      .map<Activity>((kidClass) => ({
        id: `${dateKey}-${kidFile.childId}-${kidClass.id}`,
        childIds: [kidFile.childId],
        title: kidClass.title,
        time: kidClass.time,
        type: kidClass.type,
        durationHours: kidClass.durationHours,
      }));

    const activities = kidFile.activities
      .filter((activity) => activity.date === dateKey)
      .map<Activity>((activity) => ({
        id: activity.id,
        childIds: [kidFile.childId],
        title: activity.title,
        time: activity.time,
        type: activity.type,
        durationHours: activity.durationHours,
      }));

    const special = kidFile.special
      .filter((period) => {
        const current = date.getTime();
        return (
          current >= parseDateKey(period.startDate).getTime() &&
          current <= parseDateKey(period.endDate).getTime()
        );
      })
      .map<Activity>((period) => ({
        id: `${dateKey}-${period.id}`,
        childIds: [kidFile.childId],
        title: period.title,
        time: "All day",
        type: "special",
        durationHours: 0,
      }));

    return [...classes, ...activities, ...special];
  });
}

function getChildActivityHours(childId: Child["id"], activities: Activity[]): number {
  return activities
    .filter((activity) => activity.childIds.includes(childId) && activity.type !== "special")
    .reduce((total, activity) => total + activity.durationHours, 0);
}

function buildChildCustody(
  date: Date,
  activities: Activity[],
  transition?: Transition,
): ChildCustodyHours[] {
  return children.map((child) => {
    const sleepHours = getChildSleepHours(child);
    const schoolHours = getChildSchoolHours(child, date);
    const activityHours = getChildActivityHours(child.id, activities);
    const parentId = getChildCustodyParent(child.id, date);
    const grossQualityHours = Math.max(0, 24 - sleepHours - schoolHours - activityHours);
    const transitionParentId =
      transition?.mainParent === parentId ? transition.otherParent : undefined;
    const transitionHours =
      transition && transitionParentId ? Math.min(transition.hours, grossQualityHours) : 0;
    const qualityParentHours = grossQualityHours - transitionHours;
    const qualityHoursByParent: Record<ParentId, number> = {
      mom: parentId === "mom" ? qualityParentHours : 0,
      dad: parentId === "dad" ? qualityParentHours : 0,
    };

    if (transitionParentId) {
      qualityHoursByParent[transitionParentId] += transitionHours;
    }

    return {
      childId: child.id,
      parentId,
      transitionParentId,
      transitionHours,
      hours: 24,
      sleepHours,
      schoolHours,
      activityHours,
      qualityParentHours,
      qualityHoursByParent,
    };
  });
}

function buildTransitions(): Record<string, Transition> {
  const transitions: Record<string, Transition> = {};
  const lastMonth = visibleMonths[visibleMonths.length - 1];
  const end = new Date(lastMonth.year, lastMonth.monthIndex + 1, 0);
  const firstMonth = visibleMonths[0];
  let cursor = new Date(firstMonth.year, firstMonth.monthIndex, 1);

  while (cursor <= end) {
    const dateKey = toDateKey(cursor);

    if (!findSpecialPeriod(dateKey)) {
      const fromParent = getCustodyParent(addDays(cursor, -1));
      const toParent = getCustodyParent(cursor);

      if (fromParent !== toParent) {
        const transitionConfig = scheduleConfig.custodyPattern.transition;

        transitions[dateKey] = {
          id: `${dateKey}-transition`,
          date: dateKey,
          name: transitionConfig.name,
          hours: transitionConfig.hours,
          mainParent: toParent,
          otherParent: fromParent,
        };
      }
    }

    cursor = addDays(cursor, 1);
  }

  return transitions;
}

export function buildMockCustodySchedule(): CustodyDay[] {
  const transitions = buildTransitions();

  return visibleMonths.flatMap(({ year, monthIndex }) =>
    getMonthDates(year, monthIndex).map((date) => {
      const dateKey = toDateKey(date);
      const specialPeriod = findSpecialPeriod(dateKey);
      const activities = getActivities(date);
      const transition = transitions[dateKey];

      return {
        date: dateKey,
        parentId: getCustodyParent(date),
        childIds: children.map((child) => child.id),
        childCustody: buildChildCustody(date, activities, transition),
        activities,
        transition,
        specialPeriod,
      };
    }),
  );
}

export const mockSchedule = buildMockCustodySchedule();
