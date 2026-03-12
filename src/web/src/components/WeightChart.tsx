import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getWeightEntries } from "@/lib/apiService";
import type { WeightEntry } from "@/types/api";
import { Button } from "@/components/ui/button";

type TimeFilter = "7d" | "30d" | "3m" | "all";

interface WeightChartProps {
  refreshKey: number;
}

const FILTERS: { label: string; value: TimeFilter }[] = [
  { label: "Last 7 Days", value: "7d" },
  { label: "Last 30 Days", value: "30d" },
  { label: "Last 3 Months", value: "3m" },
  { label: "All Time", value: "all" },
];

/** Format ISO date string as DD.MM for X-axis labels. */
function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}`;
}

/**
 * Area chart showing weight over time.
 * entries === null means initial load is in progress.
 * entries === [] means no data for the selected range.
 */
export function WeightChart({ refreshKey }: WeightChartProps) {
  const [activeFilter, setActiveFilter] = useState<TimeFilter>("30d");
  // null = loading (no data shown yet), [] = loaded but empty
  const [entries, setEntries] = useState<WeightEntry[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getWeightEntries({ time_filter: activeFilter, page: 1, page_size: 1000 })
      .then((res) => {
        if (!cancelled) {
          const sorted = [...res.entries].sort(
            (a, b) =>
              new Date(a.recorded_at).getTime() -
              new Date(b.recorded_at).getTime(),
          );
          setEntries(sorted);
        }
      })
      .catch(() => {
        if (!cancelled) setEntries([]);
      });
    return () => {
      cancelled = true;
    };
  }, [activeFilter, refreshKey]);

  const chartData =
    entries?.map((e) => ({
      date: formatDate(e.recorded_at),
      weight: Number(e.weight_value),
    })) ?? [];

  const weights = chartData.map((d) => d.weight);
  const minY = weights.length ? Math.floor(Math.min(...weights)) - 5 : 0;
  const maxY = weights.length ? Math.ceil(Math.max(...weights)) + 5 : 100;

  return (
    <div className="rounded-lg border p-4">
      {/* Time filter buttons */}
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Button
            key={f.value}
            size="sm"
            variant={activeFilter === f.value ? "default" : "outline"}
            onClick={() => setActiveFilter(f.value)}
            data-testid={`filter-${f.value}`}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* Chart area */}
      {entries === null ? (
        <div className="text-muted-foreground flex h-[300px] items-center justify-center text-sm">
          Loading…
        </div>
      ) : entries.length === 0 ? (
        <div
          className="text-muted-foreground flex h-[300px] items-center justify-center text-sm"
          data-testid="chart-empty"
        >
          No data for this period
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={chartData}
            margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis domain={[minY, maxY]} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="weight"
              stroke="hsl(var(--primary, 220 90% 56%))"
              fill="hsl(var(--primary, 220 90% 56%) / 0.2)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
