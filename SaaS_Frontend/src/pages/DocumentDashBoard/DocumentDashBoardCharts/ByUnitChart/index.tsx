import { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  BubbleController,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(
  BubbleController,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  ChartDataLabels
);

type props = {
  locationData?: any;
  setFilterQuery?: any;
};

const ByUnitChart = ({
  locationData,
  setFilterQuery,
}: props) => {
  const chartRef1 = useRef<any>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    const ctx = chartRef1.current.getContext("2d");
    // Destroy previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    const datas: any = locationData?.map((value: any) => value?.count);
    const BackgroundColor = [
      "#3C42C8",
      "#29DBD5",
      "#ED3B3E",
      "#F38943",
      "#9930DF",
      "#00A3FF",
      "#00C170",
      "#FFB400",
      "#FF61D8",
      "#5E35B1",
      "#00796B",
      "#C0392B",
      "#4A6FA5",
      "#FF9E80",
      "#8BC34A",
      "#1A237E",
      "#FFD700",
    ];

    const backgroundColors = [...BackgroundColor]; // Using predefined colors initially

    // If the number of data points exceeds the number of predefined colors,
    // generate additional random colors
    if (datas?.length > BackgroundColor?.length) {
      const remainingColorsCount = datas?.length - BackgroundColor?.length;
      for (let i = 0; i < remainingColorsCount; i++) {
        const randomColor = `#${Math.floor(Math.random() * 16777215).toString(
          16
        )}`;
        backgroundColors.push(randomColor);
      }
    }

    const getPercentile = (arr: number[], percentile: number) => {
      const sorted = [...arr].sort((a, b) => a - b);
      const index = Math.ceil((percentile / 100) * sorted.length) - 1;
      return sorted[index];
    };

    const counts = locationData.map((d: any) => d.count);
    const maxCount = getPercentile(counts, 90); // 90th percentile to reduce impact of outliers

    const maxRadius = 50; // max bubble size on screen
    const minRadius = 5; // minimum visible bubble size

    chartInstance.current = new ChartJS(ctx, {
      type: "bubble",
      data: {
        datasets: locationData?.map((value: any, index: number) => {
          const scaledR = (value.count / maxCount) * maxRadius;
          const r = Math.max(minRadius, Math.min(scaledR, maxRadius));

          return {
            label: value?.locationName,
            data: [
              {
                x: index + 1,
                y: value?.count,
                r,
              },
            ],
            backgroundColor: backgroundColors[index % backgroundColors.length],
            borderColor: "rgba(0,0,0,0.1)",
            borderWidth: 1,
          };
        }),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: function (context: any) {
                const datasetLabel = context.dataset.label; // this is the entityName
                const count = context.raw.y;
                return `${datasetLabel}: ${count}`;
              },
            },
          },
          datalabels: {
            anchor: "center",
            align: "center",
            color: "white",
            textAlign: "center",
            font: {
              weight: "bold",
              size: 12, // Default font size for the label
            },
            formatter: (value, context: any) => {
              const label = context.dataset.label;
              const count =
                context.chart.data.datasets[context.datasetIndex].data[0].y;
              return [label, `${count}`]; // Multi-line text with label on top and count below
            },
            labels: {
              label: {
                font: {
                  size: 12, // Font size for the label
                },
              },
              count: {
                // textAlign:"center",

                font: {
                  size: 12, // Larger font size for the count
                  weight: "bold", // Optional: make count bold
                },
              },
            },
          },

          title: {
            display: true,
            align: "start",
            text: "Published Documents By Unit",
            font: {
              size: 14,
              weight: "600",
              family: "'Poppins', sans-serif",
            },
            color: "black",
            padding: {
              top: 10,
              bottom: 60,
            },
          },
        },
        scales: {
          x: {
            display: false, // hides the entire x-axis including ticks and grid lines
            grid: {
              display: false,
              drawBorder: false,
            },
            ticks: {
              display: false,
            },
          },
          y: {
            display: false, // hides the entire y-axis
            grid: {
              display: false,
              drawBorder: false,
            },
            ticks: {
              display: false,
            },
          },
        },
        onClick: (e, index: any) => {
          const datasetIndex = index[0]?.datasetIndex;
          if (typeof datasetIndex === "number") {
            setFilterQuery({
              locationId: locationData[datasetIndex]?.locationId,
            });
          }
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [locationData, setFilterQuery]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <div style={{ width: "100%", height: "100%" }}>
        <canvas ref={chartRef1} style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
};

export default ByUnitChart;
