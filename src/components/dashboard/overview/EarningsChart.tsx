import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart } from "@/components/ui/chart";

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
        <BarChart
          data={chartData}
          index="month"
          categories={["earnings"]}
          colors={["primary"]}
          valueFormatter={(value: number) => `฿${value.toLocaleString()}`}
          yAxisWidth={60}
          height={300}
        />
      </CardContent>
    </Card>
  );
}