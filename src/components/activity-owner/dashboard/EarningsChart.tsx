
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

interface EarningsChartProps {
  data: { month: string; amount: number }[];
}

export function EarningsChart({ data }: EarningsChartProps) {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Earnings Overview</CardTitle>
        <CardDescription>
          Your earnings over the past months
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <XAxis
              dataKey="month"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `฿${value}`}
            />
            <Tooltip 
              formatter={(value: number) => [`฿${value.toLocaleString()}`, 'Earnings']}
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Bar
              dataKey="amount"
              fill="currentColor"
              radius={[4, 4, 0, 0]}
              className="fill-primary"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
