import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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

    });

  }

  editEmployee(employee: any) {
    console.log('Editing employee:', employee);
  }
  
}