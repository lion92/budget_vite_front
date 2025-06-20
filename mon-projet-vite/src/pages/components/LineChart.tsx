import React, {FunctionComponent} from "react";
import {Line} from "react-chartjs-2";

const LineChart:FunctionComponent<{}>=(props:any)=>{
    return(
        <div className="divCentrer">
            <Line options={props.options} data={props.data}></Line>
        </div>
    )
}

export default LineChart;