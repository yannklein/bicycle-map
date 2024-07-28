import 'chart.js';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export default class ElevationChart {
  constructor() {
    return this.initChart();
  }
  initChart() {
    const elevationCanvas = document.querySelector('#bicycle-trip-elevation');
    console.log(elevationCanvas.width);
    const gradient = elevationCanvas
      .getContext('2d')
      .createLinearGradient(0, 0, elevationCanvas.width * 3, 0);
    gradient.addColorStop(0, '#7b4397');
    gradient.addColorStop(1, '#dc2430');
  
    var data = {
      labels: [...Array(7).keys()],
      datasets: [
        {
          label: 'Altitude',
          backgroundColor: gradient,
          borderColor: 'black',
          borderWidth: 2,
          hoverBackgroundColor: 'rgba(255,99,132,0.4)',
          hoverBorderColor: 'black',
          data: [65, 59, 20, 81, 56, 55, 40],
          fill: true,
          pointStyle: false,
        },
      ],
    };
    const fontSize = window.innerWidth <= 1000 ? 16 : 32;
  
    const config = {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Distance (km)",
              align: 'end',
              font: {
                size: fontSize,
              },
            },
            ticks: {
              font: {
                size: fontSize,
              },
            },
          },
          y: {
            title: {
              display: true,
              text: "Altitude (m)",
              align: 'end',
              font: {
                size: fontSize,
              },
            },
            ticks: {
              font: {
                size: fontSize,
              },
            },
            suggestedMax: 100,
          },
        },
      },
    };
    return new Chart('bicycle-trip-elevation', config);
  };
}