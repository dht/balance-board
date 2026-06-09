export function AppHeader() {
  return (
    <header className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 pt-8 pb-6 sm:px-6 lg:px-8">
      <p className="text-sm font-medium tracking-[0.16em] text-teal-700 uppercase">
        Family planning dashboard
      </p>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-slate-950 sm:text-5xl">
            BalanceBoard
          </h1>
          <p className="mt-2 max-w-2xl text-base text-slate-600 sm:text-lg">
            Custody time, activities, and family rhythm at a glance
          </p>
        </div>
        <div className="rounded-lg border border-teal-100 bg-teal-50 px-4 py-3 text-sm text-teal-900 shadow-sm">
          June through August 2026
        </div>
      </div>
    </header>
  );
}
