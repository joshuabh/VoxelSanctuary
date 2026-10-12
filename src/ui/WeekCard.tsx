import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function WeekCard({ points, todayIndex }: { points: number[]; todayIndex: number }) {
  const total = points.reduce((a, b) => a + b, 0);
  const data = points.map((wp, i) => ({ day: DAYS[i], wp }));
  return (
    <div className="card">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <span className="label">This week</span>
        <span>
          <span className="num font-display text-lg font-medium">{total.toLocaleString("en-GB")}</span>{" "}
          <span className="label tracking-[0.06em]">WP</span>
        </span>
      </div>
      <div className="h-[120px]" role="img" aria-label={`Wellbeing points per day this week: ${data.map((d) => `${d.day} ${d.wp}`).join(", ")}`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="#222a2e" />
            <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "#66746f", fontSize: 10, fontFamily: "JetBrains Mono" }} tickFormatter={(d: string) => d[0]} />
            <YAxis hide domain={[0, (max: number) => Math.max(50, Math.ceil(max / 50) * 50)]} />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,.03)" }}
              contentStyle={{ background: "#111416", border: "1px solid #2a3337", borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: "#9aa8a3" }}
              itemStyle={{ color: "#e6ece9" }}
              formatter={(v: number) => [`${v} WP`, ""]}
              separator=""
            />
            <Bar dataKey="wp" radius={[4, 4, 0, 0]} maxBarSize={28} isAnimationActive={false}>
              {data.map((d, i) => (
                <Cell key={d.day} fill={i === todayIndex ? "#43d39a" : "#1f5c45"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
