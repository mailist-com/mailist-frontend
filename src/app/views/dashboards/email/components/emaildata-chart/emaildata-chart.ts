import { Component } from '@angular/core';
import { ApexOptions } from 'ng-apexcharts';
import { Apexchart } from "../../../../../components/apexchart/apexchart";
import { CustomDropdown, DropdownOption } from '../../../../../components/custom-dropdown/custom-dropdown';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-emaildata-chart',
  imports: [Apexchart, CustomDropdown, FormsModule],
  templateUrl: './emaildata-chart.html',
  styles: ``
})
export class EmaildataChart {

  periodOptions: DropdownOption[] = [
    { value: 'yearly', label: 'This Yearly' },
    { value: '6m', label: '6 Monthly' },
    { value: '3m', label: '3 Monthly' },
    { value: '1m', label: '1 Monthly' },
    { value: '1w', label: '1 Weekly' }
  ];
  selectedPeriod = 'yearly';

  emailDataOptions: () => ApexOptions = () => ({
    series: [
      {
        name: "Open Rate",
        data: [28, 29, 31, 36, 32, 32, 33, 40, 37]
      },
      {
        name: "Click Rate",
        data: [26, 41, 40, 51, 49, 62, 69, 52, 58]
      }
    ],
    chart: {
      height: 333,
      type: 'line',
      dropShadow: {
        enabled: true,
        color: '#000',
        top: 18,
        left: 7,
        blur: 10,
        opacity: 0.2
      },
      toolbar: {
        show: false
      },
    },
    colors: ["#2b7fff", "var(--color-purple-500)"],
    stroke: {
      curve: 'smooth',
      width: 3
    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'right',
      floating: true,
      offsetY: -15,
    },
    markers: {
      size: 5,
      hover: {
        sizeOffset: 1
      }
    },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    }
  })

}
