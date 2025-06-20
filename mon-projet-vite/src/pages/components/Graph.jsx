import React from 'react';
import {Pie} from 'react-chartjs-2'

export default function Graph(props) {
    return (
        <div className="divCentrer">
            <Pie style={{width: '100%'}} data={props.data}
            />

        </div>
    );
}
