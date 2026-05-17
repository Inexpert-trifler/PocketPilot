import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 md:space-y-8 p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48 rounded-xl bg-white/5" />
          <Skeleton className="h-4 w-64 rounded-lg bg-white/5" />
        </div>
        <div className="hidden md:flex gap-3">
          <Skeleton className="h-10 w-32 rounded-full bg-white/5" />
          <Skeleton className="h-10 w-40 rounded-full bg-white/5" />
        </div>
      </div>

      <Skeleton className="h-32 w-full rounded-3xl bg-white/5" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-64 md:col-span-2 rounded-3xl bg-white/5" />
        <div className="flex md:flex-col gap-4 overflow-hidden">
          <Skeleton className="h-48 min-w-[280px] w-full rounded-3xl bg-white/5" />
          <Skeleton className="h-48 min-w-[280px] w-full rounded-3xl bg-white/5" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-80 w-full rounded-3xl bg-white/5" />
        <Skeleton className="h-80 w-full rounded-3xl bg-white/5" />
      </div>
    </div>
  );
}
