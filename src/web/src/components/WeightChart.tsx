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
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type TimeFilter = "7d" | "30d" | "3m" | "all";

interface WeightChartProps {
  refreshKey: number;
}

const FILTERS: { label: string; value: TimeFilter }[] = [
  { label: "7D", value: "7d" },
  { label: "30D", value: "30d" },
  { label: "3M", value: "3m" },
  { label: "All", value: "all" },
];

/** Axis tick rendered with inline style so CSS variables resolve correctly inside SVG. */
function AxisTick({ x, y, payload, anchor = "middle" }: {
  x?: number; y?: number; payload?: { value: string };
  anchor?: "start" | "middle" | "end" | "inherit";
}) {
  return (
    <text
      x={x}
      y={y}
      dy={4}
      textAnchor={anchor}
      style={{ fill: "var(--muted-foreground)", fontSize: 11 }}
    >
      {payload?.value}
    </text>
  );
}

/** Format ISO date string as MM.DD for X-axis labels. */
function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${mm}.${dd}`;
}

/**
 * Area chart showing weight over time, styled as a shadcn dashboard card.
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
    <Card>
      <CardHeader className="border-b pb-4">
        <div>
          <CardTitle>Weight Trend</CardTitle>
          <CardDescription>Your weight over time</CardDescription>
        </div>
        <CardAction>
          <div className="flex gap-1">
            {FILTERS.map((f) => (
              <Button
                key={f.value}
                size="sm"
                variant={activeFilter === f.value ? "default" : "ghost"}
                className="h-7 px-2.5 text-xs"
                onClick={() => setActiveFilter(f.value)}
                data-testid={`filter-${f.value}`}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </CardAction>
      </CardHeader>

      <CardContent className="pt-4">
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
              margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
            >
              <defs>
                <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                stroke="var(--border)"
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="date"
                tick={<AxisTick anchor="middle" />}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                domain={[minY, maxY]}
                tick={<AxisTick anchor="end" />}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "var(--card-foreground)",
                }}
                cursor={{ stroke: "var(--border)" }}
              />
              <Area
                type="monotone"
                dataKey="weight"
                stroke="var(--primary)"
                fill="url(#weightGradient)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "var(--primary)" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
