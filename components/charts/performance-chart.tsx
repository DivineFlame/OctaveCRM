"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type ChartRow = {
  platform: string;
  reach: number;
  engagement: number;
  leads: number;
};

export function PerformanceChart({ data }: { data: ChartRow[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="platform" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip cursor={{ fill: "rgba(14, 165, 233, 0.08)" }} />
          <Bar dataKey="engagement" fill="#0891b2" radius={[6, 6, 0, 0]} />
          <Bar dataKey="leads" fill="#16a34a" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
