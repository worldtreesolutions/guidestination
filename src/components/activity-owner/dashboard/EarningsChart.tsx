
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Earning } from "@/types/activity"

interface EarningsChartProps {
  earningsData: Earning[]
}

const chartConfig = {
  earnings: {
    label: "Earnings",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export default function EarningsChart({ earningsData }: EarningsChartProps) {
  const totalEarnings = earningsData.reduce(
    (acc, month) => acc + month.amount,
    0
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Earnings</CardTitle>
        <CardDescription>
          Total Earnings: ${totalEarnings.toFixed(2)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <BarChart data={earningsData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="amount" fill="var(--color-earnings)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
