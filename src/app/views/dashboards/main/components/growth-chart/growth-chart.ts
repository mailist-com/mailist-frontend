import { Component } from '@angular/core';
import { Apexchart } from "../../../../../components/apexchart/apexchart";
import { ApexOptions } from 'ng-apexcharts';

@Component({
  selector: 'app-growth-chart',
  imports: [Apexchart],
  templateUrl: './growth-chart.html',
  styles: ``
})
export class GrowthChart {

  chartOptions: () => ApexOptions = () => ({
    series: [
      {
        name: 'Kontakty',
        data: [8500, 8750, 9100, 9450, 9800, 10300, 10750, 11200, 11650, 12000, 12250, 12458]
      },
      {
        name: 'Wysłane emaile',
        data: [28000, 31000, 29500, 33000, 35500, 38000, 36500, 40000, 42500, 43000, 44500, 45892]
      }
    ],
    chart: {
      type: 'area',
      height: 350,
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      }
    },
    colors: ["#2b7fff", "#00c951"],
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 90, 100]
      }
    },
    xaxis: {
      categories: ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'],
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: {
      labels: {
        formatter: function (val: number) {
          return val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val.toString();
        }
      }
    },
    grid: {
      borderColor: '#f1f1f1',
      strokeDashArray: 3
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right'
    },
    tooltip: {
      y: {
        formatter: function (val: number) {
          return val.toLocaleString();
        }
      }
    }
  });
}
