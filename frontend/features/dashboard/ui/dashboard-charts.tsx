"use client";

import { ChartNoAxesCombined, GitBranch, ChartPie, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useReducedMotion } from "motion/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { DashboardCharts as DashboardChartsData } from "../lib/dashboard.types";

type Props = {
  charts: DashboardChartsData;
};

const stageColors: Record<string, string> = {
  NEW: "#38bdf8",
  CONTACTED: "#818cf8",
  SITE_VISIT: "#c084fc",
  INTERESTED: "#f472b6",
  NEGOTIATION: "#fbbf24",
  BOOKED: "#34d399",
  LOST: "#fb7185",
};

const bookingColors: Record<string, string> = {
  PENDING: "#f59e0b",
  CONFIRMED: "#10b981",
  CANCELLED: "#f43f5e",
};

const chartPalette = {
  monthlyStart: "#38bdf8",
  monthlyEnd: "#6366f1",
  teamLeads: "#2dd4bf",
  teamBookings: "#fb923c",
  pipeline: "#a78bfa",
};

const muted = "var(--muted-foreground)";
const border = "var(--border)";
const primary = "var(--primary)";

function label(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function ChartCard({
  title,
  description,
  icon: Icon,
  iconColor,
  children,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  children: React.ReactNode;
}) {
  return (
    <article className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card">
      <header className="flex items-center gap-3 px-4 pt-4 sm:px-5">
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-xl"
          style={{
            backgroundColor: `${iconColor}20`,
            color: iconColor,
          }}
        >
          <Icon size={19} strokeWidth={2} aria-hidden="true" />
        </div>

        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-foreground sm:text-base">
            {title}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
      </header>

      <div className="px-3 pb-4 pt-3 sm:px-4">{children}</div>
    </article>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-full min-h-24 items-center justify-center rounded-lg border border-dashed border-border px-4 text-center text-sm text-muted-foreground">
      No data available yet.
    </div>
  );
}

function ChartTooltip({
  active,
  payload,
  label: tooltipLabel,
}: {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number | string;
    color?: string;
    payload?: {
      fill?: string;
      status?: string;
      stage?: string;
      employeeName?: string;
    };
  }>;
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;

  const title =
    typeof tooltipLabel === "string"
      ? tooltipLabel
      : tooltipLabel != null
        ? String(tooltipLabel)
        : "";

  return (
    <div className="rounded-xl border border-border bg-popover px-3 py-2.5 text-popover-foreground shadow-xl">
      {title && (
        <p className="mb-1.5 text-xs font-semibold text-popover-foreground">
          {label(title)}
        </p>
      )}

      {payload.map((item, index) => (
        <div
          key={`${item.name ?? "value"}-${index}`}
          className="flex items-center gap-2 py-0.5 text-xs"
        >
          <span
            className="size-2 shrink-0 rounded-full"
            style={{
              backgroundColor: item.color ?? item.payload?.fill ?? primary,
            }}
          />

          <span className="text-muted-foreground">
            {item.name ? label(item.name) : "Count"}
          </span>

          <span className="ml-auto pl-3 font-semibold tabular-nums text-popover-foreground">
            {Number(item.value ?? 0).toLocaleString("en-IN")}
          </span>
        </div>
      ))}
    </div>
  );
}

function MonthlyLeads({ data }: { data: DashboardChartsData["monthlyLeads"] }) {
  const reduceMotion = useReducedMotion();

  return (
    <ChartCard
      title="Monthly Leads"
      description="Lead generation throughout the year"
      icon={ChartNoAxesCombined}
      iconColor={chartPalette.monthlyStart}
    >
      {data.length === 0 ? (
        <div className="h-44 sm:h-52">
          <EmptyChart />
        </div>
      ) : (
        <div className="h-52 min-w-0 text-foreground sm:h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 8, right: 12, left: 4, bottom: 4 }}
              barCategoryGap="25%"
            >
              <defs>
                <linearGradient
                  id="monthlyLeadsGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={chartPalette.monthlyStart} />
                  <stop offset="100%" stopColor={chartPalette.monthlyEnd} />
                </linearGradient>
              </defs>

              <CartesianGrid
                vertical={false}
                stroke={border}
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{
                  fill: "var(--foreground)",
                  fontSize: 11,
                }}
                tickMargin={10}
                minTickGap={8}
                interval="preserveStartEnd"
              />

              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{
                  fill: "var(--foreground)",
                  fontSize: 11,
                }}
                tickMargin={8}
                width={40}
              />

              <Tooltip
                content={<ChartTooltip />}
                cursor={{
                  fill: border,
                  fillOpacity: 0.3,
                }}
              />

              <Bar
                dataKey="count"
                name="Leads"
                fill="url(#monthlyLeadsGradient)"
                radius={[4, 4, 0, 0]}
                maxBarSize={30}
                isAnimationActive={!reduceMotion}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}

function LeadPipeline({ data }: { data: DashboardChartsData["leadPipeline"] }) {
  const reduceMotion = useReducedMotion();

  return (
    <ChartCard
      title="Lead Pipeline"
      description="Leads by current stage"
      icon={GitBranch}
      iconColor="#a78bfa"
    >
      {data.length === 0 ? (
        <div className="h-44 sm:h-52">
          <EmptyChart />
        </div>
      ) : (
        <div className="h-52 min-w-0 text-foreground sm:h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
              barCategoryGap="24%"
            >
              <CartesianGrid
                horizontal={false}
                stroke={border}
                strokeDasharray="3 3"
              />

              <XAxis
                type="number"
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{
                  fill: "var(--foreground)",
                  fontSize: 11,
                }}
                tickMargin={8}
              />

              <YAxis
                type="category"
                dataKey="stage"
                tickLine={false}
                axisLine={false}
                width={100}
                tick={{
                  fill: "var(--foreground)",
                  fontSize: 10,
                }}
                tickMargin={8}
                tickFormatter={label}
              />

              <Tooltip
                content={<ChartTooltip />}
                cursor={{
                  fill: border,
                  fillOpacity: 0.3,
                }}
              />

              <Bar
                dataKey="count"
                name="Leads"
                radius={[0, 4, 4, 0]}
                maxBarSize={18}
                isAnimationActive={!reduceMotion}
              >
                {data.map((item) => (
                  <Cell
                    key={item.stage}
                    fill={stageColors[item.stage] ?? chartPalette.pipeline}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}

function BookingStatus({
  data,
}: {
  data: DashboardChartsData["bookingStatuses"];
}) {
  const reduceMotion = useReducedMotion();
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <ChartCard
      title="Booking Status"
      description="Current booking distribution"
      icon={ChartPie}
      iconColor="#34d399"
    >
      {data.length === 0 || total === 0 ? (
        <div className="h-40 sm:h-44">
          <EmptyChart />
        </div>
      ) : (
        <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-2">
          <div className="relative mx-auto h-40 w-full min-w-0 sm:h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="count"
                  nameKey="status"
                  innerRadius="62%"
                  outerRadius="82%"
                  paddingAngle={3}
                  stroke="none"
                  isAnimationActive={!reduceMotion}
                >
                  {data.map((item) => (
                    <Cell
                      key={item.status}
                      fill={bookingColors[item.status] ?? chartPalette.pipeline}
                    />
                  ))}
                </Pie>

                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-semibold tabular-nums text-foreground">
                {total.toLocaleString("en-IN")}
              </span>
              <span className="text-[11px] text-muted-foreground">
                Bookings
              </span>
            </div>
          </div>

          <div className="space-y-3 px-1">
            {data.map((item) => {
              const percentage = Math.round((item.count / total) * 100);
              const color = bookingColors[item.status] ?? chartPalette.pipeline;

              return (
                <div key={item.status} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="truncate text-muted-foreground">
                        {label(item.status)}
                      </span>
                    </div>

                    <span className="font-medium tabular-nums text-foreground">
                      {item.count.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-[width] duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </ChartCard>
  );
}

function TeamPerformance({
  data,
}: {
  data: DashboardChartsData["teamPerformance"];
}) {
  const reduceMotion = useReducedMotion();

  return (
    <ChartCard
      title="Team Performance"
      description="Leads assigned vs. bookings created"
      icon={Users}
      iconColor="#fb923c"
    >
      {data.length === 0 ? (
        <div className="h-44 sm:h-52">
          <EmptyChart />
        </div>
      ) : (
        <div className="h-52 min-w-0 text-foreground sm:h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 8, right: 8, left: 4, bottom: 4 }}
              barCategoryGap="22%"
              barGap={3}
            >
              <CartesianGrid
                vertical={false}
                stroke={border}
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="employeeName"
                tickLine={false}
                axisLine={false}
                tick={{
                  fill: "var(--foreground)",
                  fontSize: 10,
                }}
                tickMargin={8}
                interval="preserveStartEnd"
                minTickGap={8}
                tickFormatter={(value: string) =>
                  value.length > 9 ? `${value.slice(0, 8)}…` : value
                }
              />

              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{
                  fill: "var(--foreground)",
                  fontSize: 11,
                }}
                tickMargin={8}
                width={40}
              />

              <Tooltip
                content={<ChartTooltip />}
                cursor={{
                  fill: border,
                  fillOpacity: 0.3,
                }}
              />

              <Bar
                dataKey="leadsAssigned"
                name="Leads assigned"
                fill={chartPalette.teamLeads}
                radius={[3, 3, 0, 0]}
                maxBarSize={22}
                isAnimationActive={!reduceMotion}
              />

              <Bar
                dataKey="bookingsCreated"
                name="Bookings created"
                fill={chartPalette.teamBookings}
                radius={[3, 3, 0, 0]}
                maxBarSize={22}
                isAnimationActive={!reduceMotion}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}

export default function DashboardCharts({ charts }: Props) {
  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">
      <MonthlyLeads data={charts.monthlyLeads} />
      <LeadPipeline data={charts.leadPipeline} />
      <BookingStatus data={charts.bookingStatuses} />
      {charts.teamPerformance.length > 0 && (
        <TeamPerformance data={charts.teamPerformance} />
      )}
    </div>
  );
}
