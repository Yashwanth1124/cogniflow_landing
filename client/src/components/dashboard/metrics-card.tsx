import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  description?: string;
  change?: number | null;
  className?: string;
  footer?: React.ReactNode;
}

export function MetricsCard({
  title,
  value,
  icon,
  description,
  change = null,
  className,
  footer
}: MetricsCardProps) {
  const showChange = change !== null;
  const isPositiveChange = change && change > 0;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="h-5 w-5 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <CardDescription className="mt-1 text-xs text-muted-foreground">
            {description}
          </CardDescription>
        )}
        {showChange && (
          <div className="mt-4 flex items-center text-xs">
            <div
              className={cn(
                "mr-1 rounded-md p-1",
                isPositiveChange
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-destructive/10 text-destructive"
              )}
            >
              {isPositiveChange ? (
                <ArrowUp className="h-3 w-3" />
              ) : (
                <ArrowDown className="h-3 w-3" />
              )}
            </div>
            <div
              className={cn(
                "font-medium",
                isPositiveChange ? "text-emerald-500" : "text-destructive"
              )}
            >
              {isPositiveChange ? "+" : ""}
              {Math.abs(change).toFixed(2)}%
            </div>
            <div className="ml-1 text-muted-foreground">from last period</div>
          </div>
        )}
        {footer && <div className="mt-4">{footer}</div>}
      </CardContent>
    </Card>
  );
}
