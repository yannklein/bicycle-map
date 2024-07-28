import 'chart.js';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export default class ElevationChart {
  constructor(gradientColors) {
    this.canvas = document.querySelector('#bicycle-trip-elevation');
    this.gradientColors = gradientColors;
    this.baseData = {
      labels: [...Array(7).keys()],
      datasets: [
        {
          label: 'Altitude',
          backgroundColor: this.generateGradient(),
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
    this.id = 'bicycle-trip-elevation';
    this.chart = this.initChart();
  }

  initChart() {
    const fontSize = window.innerWidth <= 1000 ? 16 : 32;
    const config = {
      type: 'line',
      data: this.baseData,
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
              text: 'Distance (km)',
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
              text: 'Altitude (m)',
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
    return new Chart(this.id, config);
  }

  generateGradient() {
    const gradient = this.canvas
      .getContext('2d')
      .createLinearGradient(0, 0, this.canvas.width * 3, 0);
    gradient.addColorStop(0, this.gradientColors[0]);
    gradient.addColorStop(1, this.gradientColors[1]);
    return gradient;
  }

  updateData(elevations, distances) {
    this.chart.data.labels = distances.map((dist) =>
      dist.toFixed(distances.at(-1) > 100 ? 0 : 1),
    );
    this.chart.data.datasets[0].data = elevations;
    this.chart.update();
  }
}
