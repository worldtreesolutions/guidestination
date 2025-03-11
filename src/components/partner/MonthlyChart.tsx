
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

const data = {
  labels,
  datasets: [
    {
      label: "Commission Earned (THB)",
      data: [12000, 19000, 15000, 25000, 22000, 30000, 35000, 32000, 38000, 42000, 45000, 48000],
      borderColor: "rgb(34, 197, 94)",
      backgroundColor: "rgba(34, 197, 94, 0.1)",
      fill: true,
    }
  ]
}

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value: any) => `฿${value.toLocaleString()}`
      }
    }
  }
}

export const MonthlyChart = () => {
  return (
    <div className="w-full h-[400px]">
      <Line data={data} options={options} />
    </div>
  )
}
