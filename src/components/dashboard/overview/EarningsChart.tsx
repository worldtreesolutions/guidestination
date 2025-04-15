
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart } from "@/components/ui/chart"

interface EarningsChartProps {
  data: {
    month: string
    amount: number
  }[]
}

export function EarningsChart({ data }: EarningsChartProps) {
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Monthly Earnings</CardTitle>
        <CardDescription>
          Your earnings over the past months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <BarChart 
            data={data.map(item => ({
              name: item.month,
              total: item.amount
            }))}
            categories={["total"]}
            index="name"
            colors={["#22C55E"]}
            valueFormatter={(value) => `${value.toLocaleString()} THB`}
            yAxisWidth={60}
          />
        </div>
      </CardContent>
    </Card>
  )
}
