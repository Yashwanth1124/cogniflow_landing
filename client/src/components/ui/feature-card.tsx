import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type FeatureCardProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  iconBackground?: string;
  children?: ReactNode;
  className?: string;
};

export function FeatureCard({
  title,
  description,
  icon: Icon,
  iconColor = "text-white",
  iconBackground = "bg-primary",
  children,
  className,
}: FeatureCardProps) {
  return (
    <Card className={cn("transition-all duration-300 ease-in-out", className)}>
      <CardHeader>
        {Icon && (
          <div className={cn("w-12 h-12 rounded-md flex items-center justify-center mb-4", iconBackground)}>
            <Icon className={cn("h-6 w-6", iconColor)} />
          </div>
        )}
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}
