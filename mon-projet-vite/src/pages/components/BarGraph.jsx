import React from 'react';
import { Bar } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register additional plugins
Chart.register(ChartDataLabels);

export default function BarGraph(props) {
    return (
        <div className="divCentrer">
            <Bar
                key={`bar-chart-${JSON.stringify(props.data?.labels)}`}
                data={props.data}
            />
        </div>
    );
}
