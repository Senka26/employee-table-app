import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Chart } from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

interface Employee {
  Id: string;
  EmployeeName: string;
  StarTimeUtc: string;
  EndTimeUtc: string;
  employeeTotalTime?: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  employees: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getData();
  }

  getData() {
    const apiUrl = 'https://rc-vault-fap-live-1.azurewebsites.net/api/gettimeentries?code=vO17RnE8vuzXzPJo5eaLLjXjmRW07law99QTD90zat9FfOQJKKUcgQ==';

    this.http.get(apiUrl).subscribe((data: any) => {
      const groupedEmployees: any = {};

      data.forEach((employee: Employee) => {
        if (!groupedEmployees[employee.EmployeeName]) {
          groupedEmployees[employee.EmployeeName] = {
            EmployeeName: employee.EmployeeName,
            employeeTotalTime: 0,
            employees: []
          };
        }

        const end = new Date(employee.EndTimeUtc);
        const start = new Date(employee.StarTimeUtc);
        const diffInMilliseconds = end.getTime() - start.getTime();
        const diffInHours = diffInMilliseconds / (1000 * 60 * 60);
        const roundedDiffInHours = Math.round(diffInHours);

        groupedEmployees[employee.EmployeeName].employeeTotalTime += roundedDiffInHours;

        groupedEmployees[employee.EmployeeName].employees.push({
          Id: employee.Id,
          StarTimeUtc: employee.StarTimeUtc,
          EndTimeUtc: employee.EndTimeUtc,
          employeeTotalTime: roundedDiffInHours
        });
      });

      this.employees = Object.values(groupedEmployees);
      this.employees.sort((a, b) => b.employeeTotalTime - a.employeeTotalTime);

      this.createPieChart();
    });

  }

  editEmployee(employee: any) {
    console.log('Editing employee:', employee);
  }

  createPieChart() {
    const canvas: any = document.getElementById('pieChart');
    const ctx = canvas.getContext('2d');
  
    const totalHours = this.employees.reduce((total, employee) => total + employee.employeeTotalTime, 0);

    const data = {
      labels: this.employees.map(employee => employee.EmployeeName),
      datasets: [{
        data: this.employees.map(employee => Math.round((employee.employeeTotalTime / totalHours) * 100)),
        backgroundColor: [
          'rgb(255, 179, 179)',
          'rgb(54, 162, 235)',
          'rgb(255, 206, 86)',
          'rgb(153, 255, 204)',
          'rgb(223, 147, 250)',
          'rgb(0, 204, 153)',
          'rgb(255, 80, 80)',
          'rgb(255, 153, 51)',
          'rgb(252, 192, 252)',
          'rgb(255, 102, 0)',
          'rgb(204, 255, 102)'
        ],
      }],
    };
    
    new Chart(ctx, {
      type: 'pie',
      data: data,
      options: {
        plugins: {
          legend: {
            position: 'bottom' as const,
          },
          tooltip: {
            enabled: false
          },
          datalabels: {
            formatter: ((value, ctx) => {
              const totalSum = ctx.dataset.data.reduce((accumulator: any, currentValue) => {
                return accumulator + currentValue
              }, 0);
              const percentage = value / totalSum * 100;
              return `${percentage.toFixed(0)}%`;
            }),
            color: 'black',
          }
        },
        elements: {
          arc: {
            borderWidth: 0,
          },
        }
      },
      plugins: [ChartDataLabels]
    });
  }
  
}