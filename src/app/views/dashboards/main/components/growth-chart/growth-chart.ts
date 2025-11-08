import { Component, OnInit, inject } from '@angular/core';
import { Apexchart } from "../../../../../components/apexchart/apexchart";
import { ApexOptions } from 'ng-apexcharts';
import { DashboardService } from '../../../../../services/dashboard.service';

@Component({
  selector: 'app-growth-chart',
  imports: [Apexchart],
  templateUrl: './growth-chart.html',
  styles: ``
})
export class GrowthChart implements OnInit {
  private dashboardService = inject(DashboardService);

  loading = true;
  error: string | null = null;
  private _chartData?: ApexOptions;

  ngOnInit() {
    this.loadGrowthData();
  }

  chartOptions = (): ApexOptions => {
    return this._chartData || {
      series: [],
      chart: { type: 'area', height: 350 }
    };
  };

  private loadGrowthData() {
    this.dashboardService.getGrowthData().subscribe({
      next: (data) => {
        this._chartData = {
          series: [
            {
              name: 'Kontakty',
              data: data.contactsByMonth
            },
            {
              name: 'Wysłane emaile',
              data: data.sentEmailsByMonth
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
            categories: data.monthLabels,
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
        };
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading growth data:', err);
        this.error = 'Nie udało się załadować danych wzrostu';
        this.loading = false;
      }
    });
  }
}
