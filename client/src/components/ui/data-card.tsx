import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./card";
import { Skeleton } from "./skeleton";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type DataCardProps = {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  footer?: ReactNode;
  className?: string;
  loading?: boolean;
};

export function DataCard({
  title,
  value,
  icon: Icon,
  trend,
  description,
  footer,
  className,
  loading = false,
}: DataCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-[120px]" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        {trend && (
          <p className="text-xs text-muted-foreground">
            <span
              className={
                trend.isPositive ? "text-green-500" : "text-red-500"
              }
            >
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
            </span>{" "}
            from last month
          </p>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
}
