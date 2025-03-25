import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { Skeleton } from "./skeleton";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type ChartType = "line" | "bar" | "pie";

type ChartDataPoint = {
  name: string;
  value?: number;
  [key: string]: any;
};

type AnalyticsChartProps = {
  title: string;
  description?: string;
  data: ChartDataPoint[];
  type?: ChartType;
  dataKeys: string[];
  colors?: string[];
  className?: string;
  loading?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  renderTooltip?: (props: any) => ReactNode;
  legend?: boolean;
  grid?: boolean;
};

export function AnalyticsChart({
  title,
  description,
  data,
  type = "line",
  dataKeys,
  colors = ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444"],
  className,
  loading = false,
  xAxisLabel,
  yAxisLabel,
  renderTooltip,
  legend = true,
  grid = true,
}: AnalyticsChartProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="w-full aspect-[3/2]">
            <Skeleton className="h-full w-full" />
          </div>
        ) : (
          <div className="w-full aspect-[3/2]">
            <ResponsiveContainer width="100%" height="100%">
              {type === "line" ? (
                <LineChart
                  data={data}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 25,
                  }}
                >
                  {grid && <CartesianGrid strokeDasharray="3 3" />}
                  <XAxis 
                    dataKey="name" 
                    label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5 } : undefined}
                  />
                  <YAxis 
                    label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
                  />
                  <Tooltip />
                  {legend && <Legend />}
                  {dataKeys.map((key, index) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={colors[index % colors.length]}
                      activeDot={{ r: 8 }}
                    />
                  ))}
                </LineChart>
              ) : type === "bar" ? (
                <BarChart
                  data={data}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 25,
                  }}
                >
                  {grid && <CartesianGrid strokeDasharray="3 3" />}
                  <XAxis 
                    dataKey="name" 
                    label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5 } : undefined}
                  />
                  <YAxis 
                    label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
                  />
                  <Tooltip />
                  {legend && <Legend />}
                  {dataKeys.map((key, index) => (
                    <Bar
                      key={key}
                      dataKey={key}
                      fill={colors[index % colors.length]}
                    />
                  ))}
                </BarChart>
              ) : (
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey={dataKeys[0]}
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  {legend && <Legend />}
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
