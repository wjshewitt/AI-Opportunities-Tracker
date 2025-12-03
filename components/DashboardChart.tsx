import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { Recommendation, Status } from '../types';

interface DashboardChartProps {
  data: Recommendation[];
}

const DashboardChart: React.FC<DashboardChartProps> = ({ data }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const completed = data.filter(r => r.status === Status.COMPLETED).length;
    const onTrack = data.filter(r => r.status === Status.ON_TRACK).length;
    const partially = data.filter(r => r.status === Status.PARTIALLY).length;
    const delayed = data.filter(r => r.status === Status.DELAYED).length;
    const notStarted = data.filter(r => r.status === Status.NOT_STARTED).length;

    const ctx = chartRef.current.getContext('2d');
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Completed', 'On Track', 'Partially', 'Delayed', 'Not Started'],
          datasets: [{
            data: [completed, onTrack, partially, delayed, notStarted],
            backgroundColor: [
              '#122623', // Primary (Completed)
              '#D9F85E', // Accent (On Track)
              '#FFB800', // Amber (Partially)
              '#FF4D00', // Alert Orange (Delayed)
              '#CDCBC4'  // Border/Grey (Not Started)
            ],
            borderColor: '#F2F0E9', // Match bg cream
            borderWidth: 2,
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false // Hide default legend to build custom one
            },
            tooltip: {
              backgroundColor: '#122623',
              titleFont: { family: 'JetBrains Mono' },
              bodyFont: { family: 'Inter' },
              cornerRadius: 0,
              padding: 12,
              displayColors: false
            }
          },
          cutout: '85%'
        }
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  return (
    <div className="h-64 w-full relative group">
      <canvas ref={chartRef} />
      {/* Center Text Overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <span className="block text-4xl font-bold text-primary tracking-tighter">{data.length}</span>
          <span className="text-[10px] font-mono uppercase tracking-widest text-subtle">Total Items</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardChart;