import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// @ Ensure correct import path if moved
// import { ... } from "@/components/ui/chart" 

interface EarningsChartProps {
  data?: {
    month: string;
    earnings: number;
  }[];
}

export function EarningsChart({ data }: EarningsChartProps) {
  // Default data if none provided
  const chartData = data || [
    { month: "Jan", earnings: 2500 },
    { month: "Feb", earnings: 3200 },
    { month: "Mar", earnings: 4100 },
    { month: "Apr", earnings: 3800 },
    { month: "May", earnings: 5200 },
    { month: "Jun", earnings: 4800 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Earnings</CardTitle>
        <CardDescription>Your earnings over the past 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-end justify-between">
          {chartData.map((month) => (
            <div key={month.month} className="flex flex-col items-center">
              <div 
                className="bg-primary w-12 rounded-t-md" 
                style={{ 
                  height: `${(month.earnings / Math.max(...chartData.map(m => m.earnings))) * 250}px` 
                }}
              ></div>
              <div className="mt-2 text-xs">{month.month}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}