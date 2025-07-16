import {
    Chart as ChartJS,
    RadialTickOptions,
    RadialLinearScale,
} from "chart.js";
import React from 'react';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
    RadialLinearScale
  );

interface RadarChartProps {
    auditList: {
      auditCheckList: string;
      totalAuditChecklistScore: number;
      obtainedAuditChecklistScore: number;
    }[];
}

const RadarChartComponent: React.FC<RadarChartProps> = ({ auditList }) => {
  const labels = auditList.map((audit : any) => audit.auditCheckList);
  const data = auditList.map(
    (audit : any) => (audit.obtainedAuditChecklistScore / audit.totalAuditChecklistScore) * 100
  );

  const radarData = {
    labels: labels,
    datasets: [
      {
        data: data,
        borderColor: 'red',
      },
    ],
  };

  const radarOptions = {
    type: 'radar',
    scales: {
      r: {
        angleLines: {
          display: false,
        },
        ticks: {
            beginAtZero: true,
            font: {
                size: 20,
              },
        } as unknown as RadialTickOptions,
        pointLabels: {
            font : {
                size :35,
                family: 'Arial, sans-serif',
             },
            color : 'red'
          } as any,
        grid : {
            color : 'rgba(0,0,0,0.3)'
        }
      },
    },
    plugins: { 
        legend: {
            display: false, // Set to false to hide legends
          },
      } as any
  };

  return <Radar data={radarData} options={radarOptions}/>;
};

export default RadarChartComponent;
