import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: string | number;
    positive: boolean;
    label?: string;
  };
  className?: string;
}

export default function StatCard({ title, value, icon, trend, className = "" }: StatCardProps) {
  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-6">
        <div className="flex justify-between">
          <div>
            <p className="text-sm font-medium text-text-muted mb-1">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            
            {trend && (
              <div className="mt-1 flex items-center text-xs">
                <span className={trend.positive ? "text-green-600" : "text-red-600"}>
                  {trend.positive ? "↑" : "↓"} {trend.value}
                </span>
                <span className="text-text-muted ml-1">
                  {trend?.label ? trend.label : "from last week"}
                </span>
              </div>
            )}
          </div>
          
          {icon && <div className="text-brand-blue opacity-80">{icon}</div>}
        </div>
      </CardContent>
    </Card>
  );
}
