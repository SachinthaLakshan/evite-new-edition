import React from "react";
import { Attendee } from "@/types/event";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent } from "@/components/ui/card";

interface AttendanceChartProps {
  attendees: Attendee[];
  size?: "small" | "large";
}

export function AttendanceChart({ attendees, size = "large" }: AttendanceChartProps) {
  const responseCount = attendees.reduce(
    (acc, attendee) => {
      const response = attendee.response || "pending";
      acc[response] = (acc[response] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const data = [
    { name: "Accepted", value: responseCount.accepted || 0, color: "#22c55e" },
    { name: "Declined", value: responseCount.declined || 0, color: "#ef4444" },
    { name: "Pending", value: responseCount.pending || 0, color: "#94a3b8" },
  ].filter((item) => item.value > 0);

  if (data.length === 0) {
    return null;
  }

  const chartHeight = size === "small" ? 200 : 300;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold">{attendees.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-500">Accepted</p>
            <p className="text-2xl font-bold text-green-600">{responseCount.accepted || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-500">Declined</p>
            <p className="text-2xl font-bold text-red-600">{responseCount.declined || 0}</p>
          </CardContent>
        </Card>
      </div>

      <div style={{ width: '100%', height: chartHeight }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={size === "small" ? 40 : 60}
              outerRadius={size === "small" ? 60 : 80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [
                `${value} attendee${value !== 1 ? 's' : ''}`,
                'Count'
              ]}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value: string) => {
                const item = data.find(d => d.name === value);
                return `${value} (${item?.value || 0})`;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
