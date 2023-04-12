import { Component, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'apnibus-admin-portal';

  constructor(private matIconRegistry: MatIconRegistry, private router: Router,
    private domSanitizer: DomSanitizer) {
      this.matIconRegistry.addSvgIcon("ticket", this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/img/ticket.svg"));
      this.matIconRegistry.addSvgIcon("dashboard", this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/img/dashboard.svg"));
      this.matIconRegistry.addSvgIcon("bus", this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/img/bus.svg"));
      this.matIconRegistry.addSvgIcon("gps", this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/img/gps.svg"));
      this.matIconRegistry.addSvgIcon("notepad", this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/img/notepad.svg"));
      this.matIconRegistry.addSvgIcon("payment", this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/img/payment.svg"));
      this.matIconRegistry.addSvgIcon("profile", this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/img/profile.svg"));
      this.matIconRegistry.addSvgIcon("receipt", this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/img/receipt.svg"));
      this.matIconRegistry.addSvgIcon("route", this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/img/route.svg"));
      this.matIconRegistry.addSvgIcon("ledger", this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/img/ledger.svg"));

      this.matIconRegistry.addSvgIcon("logo", this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/img/bus-icon-with-bg.svg"));
  }

// LOGOUT FROM ALL ACTIVE TABS WHEN LOGOUT LOGOUT FROM ONE TAB

  ngOnInit(): void {
    window.addEventListener('storage', (event) => {
      if (event.storageArea == localStorage) {
        let token = localStorage.getItem('token');
        if(token == undefined) { 

            this.router.navigate(['/']);
          }
      }
    }, false);

  }

}
