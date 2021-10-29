import React from "react";
import { Bar } from "react-chartjs-2";

//-------------------------------------------------------------
//* COMPONENT START
//-------------------------------------------------------------
function TablespaceOccupancyBarChart({ labels, data }) {
  return (
    <Bar
      type="bar"
      data={{
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: "rgba(54, 162, 235, 0.5)",
            tension: 0.1,
            borderColor: "rgba(36, 209, 209, 0.8)",
            borderWidth: 1,
          },
        ],
      }}
      options={{
        plugins: {
          title: { display: true, text: "Tablespace Occupancy" },
          legend: {
            display: false,
          },
        },
        maintainAspectRatio: false,
        indexAxis: "y",
        scales: {
          x: { beginAtZero: true, max: 100 },
          xAxes: [
            {
              ticks: {
                min: 0,
                max: 100,
                stepSize: 20,
              },
            },
          ],
        },
      }}
    />
  );
}

export default TablespaceOccupancyBarChart;
