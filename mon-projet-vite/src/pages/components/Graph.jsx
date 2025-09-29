import React from 'react';
import { Pie } from 'react-chartjs-2';
import Chart from 'chart.js/auto';

export default function Graph(props) {
    return (
        <div className="divCentrer">
            <Pie
                key={`pie-chart-${JSON.stringify(props.data?.labels)}`}
                style={{width: '100%'}}
                data={props.data}
            />
        </div>
    );
}
