import type { LucideIcon } from "lucide-react";
import { Card } from "../../components/ui/card";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
}

export const MetricCard = ({ title, value, icon: Icon, trend, trendUp }: MetricCardProps) => {
  return (
    <Card className="p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 bg-card text-card-foreground">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-2">{title}</p>
          <h3 className="text-3xl font-bold mb-1">{value}</h3>
          {trend && (
            <p
              className="text-sm"
              style={{ color: trendUp ? "hsl(140, 55%, 45%)" : "hsl(0, 84%, 60%)" }}
            >
              {trend}
            </p>
          )}
        </div>
        <div
          className="p-3 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: "hsl(180, 100%, 50%, 0.1)" }}
        >
          <Icon className="w-6 h-6" style={{ color: "hsl(180, 100%, 50%)" }} />
        </div>
      </div>
    </Card>
  );
};
