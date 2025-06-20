import React from 'react';
import {Bar} from 'react-chartjs-2'
import ChartDataLabels from 'chartjs-plugin-datalabels';
export default function BarGraph(props) {

    return (
        <div className="divCentrer">
            <Bar data={props.data} plugins={[ChartDataLabels]}></Bar>
        </div>
    );
}
