import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { RouterModule, Router } from '@angular/router';
import { DashboardService, ChartData, ChartResponse } from './dashboard.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgChartsModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  sidebarOpen = true;
  sidebarCollapsed = false;
  activeMenu: 'dashboard' | 'myticket' | 'settings'  | 'logout' = 'dashboard';

  isDarkMode = false;

  stats: any[] = [];
  charts: ChartResponse[] = [];
  monthlyTrend: ChartData = { labels: [], datasets: [] };

  availableDates: string[] = [];
  // selectedDate: string = '';
  startDate: string = '';
  endDate: string = '';

  filterType: string = 'all';
  employees: any[] = [];
  companies: any[] = [];
  selectedEmployee: string = '';
  selectedCompany: string = '';

  showAdvancedFilters: boolean = false;

  constructor(
    private dashboardService: DashboardService,
    private router: Router,
    private cdRef: ChangeDetectorRef
    , public auth: AuthService
  ) {}


  ngOnInit(): void {
    this.loadFilters();
  }

  loadFilters() {
    this.dashboardService.getEmployees().subscribe(res => this.employees = res);
    this.dashboardService.getCompanies().subscribe(res => this.companies = res);
  }

  applyFilters() {
    const filter = this.startDate && this.endDate ? `${this.startDate} AND ${this.endDate}` : '';
    let EmployeefilterValue = '';
    let CompanyfilterValue = '';
    // if (this.selectedEmployee != '') EmployeefilterValue = this.selectedEmployee;
    // if (this.selectedCompany != '') CompanyfilterValue = this.selectedCompany;

    EmployeefilterValue = this.selectedEmployee != '' ? this.selectedEmployee : 'all';
    CompanyfilterValue = this.selectedCompany != '' ? this.selectedCompany : 'all';

    this.dashboardService.getStats(filter, EmployeefilterValue, CompanyfilterValue,this.filterType)
      .subscribe(s => this.stats = s);

    this.dashboardService.getCharts(filter, EmployeefilterValue, CompanyfilterValue)
      .subscribe(c => { this.charts = c; this.cdRef.detectChanges(); });

    this.dashboardService.getMonthlyTrends(EmployeefilterValue, CompanyfilterValue)
      .subscribe(m => { this.monthlyTrend = m; this.cdRef.detectChanges(); });
  }

  // loadDates() {
  //   this.dashboardService.getDates().subscribe(d => {
  //     this.availableDates = d;
  //     if (d.length > 0) {
  //       this.selectedDate = d[0];
  //       this.applyFilters();
  //     }
  //   });
  // }

  getLightColor(label: string) {
    switch (label) {
      case 'Tickets': return '#f3f4ff';
      case 'Open': return '#fff0f2';
      case 'Resolved': return '#e8f7f9';
      case 'Closed': return '#eefbe8';
      default: return '#ffffff';
    }
  }

  toggleSidebar() {
    if (window.innerWidth <= 920) this.sidebarOpen = !this.sidebarOpen;
    else { this.sidebarCollapsed = false; this.sidebarOpen = true; }
  }

  toggleCollapse() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    localStorage.setItem('helpdesk:collapsed', this.sidebarCollapsed ? '1' : '0');
  }

  selectMenu(menu: any) {
    this.activeMenu = menu;
    if (window.innerWidth <= 920) this.sidebarOpen = false;

    if (menu === 'logout') this.logout();
    if (menu === 'myticket') this.router.navigate(['/my-ticket']); // navigate to My Ticket (Agent-only)
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('helpdesk:isDark', this.isDarkMode ? '1' : '0');
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  // ---------------- Export PDF Function ----------------
  exportPDF() {
    const data: any = document.querySelector('.main');
    if (!data) return;

    const advancedFilters = data.querySelector('.advanced-filters') as HTMLElement;
    const wasHidden = advancedFilters ? !advancedFilters.classList.contains('open') : false;
    if (advancedFilters && wasHidden) advancedFilters.classList.add('open');

    // Dynamically import to avoid SSR errors
    Promise.all([import('html2canvas'), import('jspdf')]).then(([html2canvasMod, jspdfMod]) => {
      const html2canvas = (html2canvasMod as any).default || html2canvasMod;
      const jsPDF = (jspdfMod as any).default || jspdfMod;
      html2canvas(data, {
        scale: 2,
        useCORS: true,
        scrollY: -window.scrollY,
        allowTaint: true,
        logging: false
      }).then((canvas: any) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = (pdf as any).internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        (pdf as any).addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        (pdf as any).save('dashboard.pdf');

        if (advancedFilters && wasHidden) advancedFilters.classList.remove('open');
      }).catch((err: any) => console.error('PDF export error:', err));
    }).catch(err => console.error('Failed to load PDF libs:', err));
  }
}




