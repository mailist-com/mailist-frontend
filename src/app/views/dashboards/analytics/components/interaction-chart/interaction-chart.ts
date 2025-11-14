import { Component } from '@angular/core';
import { ApexOptions } from 'ng-apexcharts';
import { Apexchart } from "../../../../../components/apexchart/apexchart";
import { CustomDropdown, DropdownOption } from '../../../../../components/custom-dropdown/custom-dropdown';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-interaction-chart',
  imports: [Apexchart, CustomDropdown, FormsModule],
  templateUrl: './interaction-chart.html',
  styles: ``
})
export class InteractionChart {

  periodOptions: DropdownOption[] = [
    { value: 'yearly', label: 'This Yearly' },
    { value: '6m', label: '6 Monthly' },
    { value: '3m', label: '3 Monthly' },
    { value: '1m', label: '1 Monthly' },
    { value: '1w', label: '1 Weekly' }
  ];
  selectedPeriod = 'yearly';

  interactionChartOptions: () => ApexOptions = () => ({
     series: [{
                name: 'Viewers',
                data: [20, 13, 19, 23, 29, 42, 33, 29, 37, 46, 40, 49]
            },
                // {
                //     name: 'Followers',
                //     data: [10, 18, 13, 23, 33, 39, 30, 21, 36, 42, 39, 46]
                // }
            ],
            chart: {
                height: 350,
                type: 'bar',
                toolbar: {
                    show: false,
                }
            },
            plotOptions: {
                bar: {
                    borderRadius: 10,
                    dataLabels: {
                        position: 'top', // top, center, bottom
                    },
                }
            },
            dataLabels: {
                enabled: true,
                offsetY: -20,
                style: {
                    fontSize: '12px',
                    colors: ["#304758"]
                }
            },

            xaxis: {
                categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                position: 'bottom',
                axisBorder: {
                    show: false
                },
                axisTicks: {
                    show: false
                },
                crosshairs: {
                    fill: {
                        type: 'gradient',
                        gradient: {
                            colorFrom: '#D8E3F0',
                            colorTo: '#BED1E6',
                            stops: [0, 100],
                            opacityFrom: 0.4,
                            opacityTo: 0.5,
                        }
                    }
                },
                tooltip: {
                    enabled: true,
                }
            },
            yaxis: {
                axisBorder: {
                    show: false
                },
                axisTicks: {
                    show: false,
                },
                labels: {
                    show: false,
                }
            },
            stroke: {
                show: true,
                width: 4,
                colors: ['transparent']
            },
            grid: {
                show: false,
                padding: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: -10
                },
            },
            colors: ["#2b7fff", "#00c951"],
  });

}
