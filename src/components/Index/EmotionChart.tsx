import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, type TooltipProps,
} from "recharts";

// ── Emotion → numeric score (1 low … 5 high) ────────────────────────────────
const SCORE: Record<string, number> = {
  "Bien":        5,
  "Tranquilo/a": 4,
  "Regular":     3,
  "Bajo/a":      2,
  "Triste":      1,
  "Frustrado/a": 2,
};

const EMOJI: Record<string, string> = {
  "Bien":        "😊",
  "Tranquilo/a": "😌",
  "Regular":     "😐",
  "Bajo/a":      "😔",
  "Triste":      "😢",
  "Frustrado/a": "😤",
};

// Color per score level
const DOT_COLOR: Record<number, string> = {
  5: "#7BAE7F",  // sage green
  4: "#68B4C8",  // teal
  3: "#F5C25A",  // yellow
  2: "#F4936A",  // orange
  1: "#E57373",  // red
};

interface ChartPoint {
  day:     string;
  value:   number | null;
  emotion: string | null;
  emoji:   string | null;
}

interface EmotionRecord { date: string; emotion: string; }

// ── Custom dot ───────────────────────────────────────────────────────────────
const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;
  if (payload.value === null || payload.value === undefined) return null;
  const color = DOT_COLOR[Math.round(payload.value)] ?? "#7BAE7F";
  return (
    <g>
      <circle cx={cx} cy={cy} r={6}  fill={color}   stroke="#fff" strokeWidth={2} />
      <text   x={cx}  y={cy - 12} textAnchor="middle" fontSize={14} dominantBaseline="middle">
        {payload.emoji ?? ""}
      </text>
    </g>
  );
};

// ── Custom tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as ChartPoint;
  if (!d.emotion) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2 shadow-lg text-sm">
      <p className="font-semibold text-foreground">{d.emoji} {d.emotion}</p>
      <p className="text-muted-foreground text-xs">{d.day}</p>
    </div>
  );
};

// ── Component ────────────────────────────────────────────────────────────────
const EmotionChart = () => {
  const [data, setData] = useState<ChartPoint[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem("sentir-emotion-history");
    if (!raw) return;

    let history: EmotionRecord[] = [];
    try { history = JSON.parse(raw); } catch { return; }

    const points: ChartPoint[] = Array.from({ length: 8 }, (_, i) => {
      const d       = new Date(Date.now() - (7 - i) * 86_400_000);
      const dateStr = d.toDateString();
      const record  = history.find((r) => r.date === dateStr);
      const isToday = i === 7;
      return {
        day:     isToday ? "Hoy" : d.toLocaleDateString("es-ES", { weekday: "short" }),
        value:   record ? (SCORE[record.emotion] ?? null) : null,
        emotion: record?.emotion ?? null,
        emoji:   record ? (EMOJI[record.emotion] ?? null) : null,
      };
    });

    setData(points);
  }, []);

  const hasData = data.some((d) => d.value !== null);
  if (!hasData) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-card rounded-2xl p-4 border border-border"
    >
      <p className="text-sm font-semibold text-foreground mb-1">Tu semana emocional</p>
      <p className="text-xs text-muted-foreground mb-4">Últimos 7 días</p>

      <ResponsiveContainer width="100%" height={150}>
        <AreaChart data={data} margin={{ top: 20, right: 8, left: -28, bottom: 0 }}>
          <defs>
            <linearGradient id="emotionGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#7BAE7F" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#7BAE7F" stopOpacity={0}    />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            vertical={false}
          />

          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis domain={[0, 5]} hide />

          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }} />

          <Area
            type="monotone"
            dataKey="value"
            stroke="#7BAE7F"
            strokeWidth={2.5}
            fill="url(#emotionGrad)"
            dot={<CustomDot />}
            activeDot={false}
            connectNulls
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex justify-between mt-3 px-1">
        {[
          { label: "😤 😔", desc: "Difícil" },
          { label: "😐",    desc: "Regular" },
          { label: "😌 😊", desc: "Bien"    },
        ].map((l) => (
          <div key={l.desc} className="flex flex-col items-center gap-0.5">
            <span className="text-xs">{l.label}</span>
            <span className="text-[10px] text-muted-foreground">{l.desc}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default EmotionChart;
