import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
}

export const StatCard = ({
  title,
  value,
  description,
  icon,
  variant = "default",
}: StatCardProps) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "success":
        return "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30";
      case "warning":
        return "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30";
      case "danger":
        return "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30";
      default:
        return "";
    }
  };

  return (
    <Card className={cn("overflow-hidden", getVariantClasses())}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
          <div>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
};
