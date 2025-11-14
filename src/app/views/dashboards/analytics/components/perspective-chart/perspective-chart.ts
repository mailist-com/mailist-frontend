import { Component } from '@angular/core';
import { ApexOptions } from 'ng-apexcharts';
import { Apexchart } from "../../../../../components/apexchart/apexchart";
import { CustomDropdown, DropdownOption } from '../../../../../components/custom-dropdown/custom-dropdown';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-perspective-chart',
  imports: [Apexchart, CustomDropdown, FormsModule],
  templateUrl: './perspective-chart.html',
  styles: ``
})
export class PerspectiveChart {

  periodOptions: DropdownOption[] = [
    { value: 'yearly', label: 'This Yearly' },
    { value: '6m', label: '6 Monthly' },
    { value: '3m', label: '3 Monthly' },
    { value: '1m', label: '1 Monthly' },
    { value: '1w', label: '1 Weekly' }
  ];
  selectedPeriod = 'yearly';

  platformPerspectiveOptions: () => ApexOptions = () => ({
    series: [
      {
        data: [
          {
            x: 'React',
            y: 218
          },
          {
            x: 'TailwindCSS',
            y: 187
          },
          {
            x: 'Angular',
            y: 134
          },
          {
            x: 'Vue Js',
            y: 55
          },
          {
            x: 'Laravel',
            y: 99
          },
          {
            x: 'PHP',
            y: 34
          },
          {
            x: 'ASP.Net',
            y: 86
          },
          {
            x: 'Django',
            y: 30
          },
          {
            x: 'CI',
            y: 44
          }
        ]
      }
    ],
    legend: {
      show: false
    },
    chart: {
      height: 252,
      type: 'treemap',
      toolbar: {
        show: false
      },
      parentHeightOffset: 0
    },
    xaxis: {
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    grid: {
      show: false,
      padding: {
        top: -15,
        right: 0,
        bottom: 0,
        left: 0
      }
    },
    colors: ['#2b7fff']
  });


}
