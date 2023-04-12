import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-app-nav-root',
  templateUrl: './app-nav-root.component.html',
  styleUrls: ['./app-nav-root.component.scss']
})
export class AppNavRootComponent implements OnInit {

  userRole!: any;

  constructor(private router: Router, private authService: AuthService,) { }

  ngOnInit(): void {

    let data = JSON.parse(localStorage.getItem('userRole') || '{}');
    this.userRole = data.userRole;
    console.log(this.userRole)

    
  }

  clickOnTickets() {
    this.router.navigateByUrl('/dashboard/listTickets');
  }

  clickOnDashboard() {
    this.router.navigateByUrl('/dashboard');
  }

  clickOnListOperators() {
    this.router.navigateByUrl('/dashboard/listOperators');
  }

  clickOnListBuses() {
    this.router.navigateByUrl('/dashboard/listBuses');
  }

  clickOnNotification() {
    this.router.navigateByUrl('/dashboard/listNotification');
  }

  clickOnListRoutes() {
    this.router.navigateByUrl('/dashboard/listRoutes');
  }

  clickOnListBusRouteMapping() {
    this.router.navigateByUrl('/dashboard/listBusRouteMapping');
  }

  clickOnLedger() {
    this.router.navigateByUrl('/dashboard/operatorLedger');
  }

  clickOnPricing() {
    this.router.navigateByUrl('/dashboard/listMultiplePricing/listBasePricing');
  }

  clickOnConductorPricing() {
    this.router.navigateByUrl('/dashboard/listConductorPricing');
  }

  clickOnListLocations() {
    this.router.navigateByUrl('/dashboard/listLocations/listDistrict');
  }

  clickOnPosConcession(){
    this.router.navigateByUrl('/dashboard/listPosConcession');
  }
  clickOnLogout(){
    this.authService.logout();
    // this.router.navigateByUrl('/dashboard/profile');
  }
  clickOnPayment(){
    this.router.navigateByUrl('/dashboard/listBasePayment/listOperatorInvoice');
  }


}
