import { Component, OnDestroy, OnInit } from '@angular/core';
import { Event, NavigationStart, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-base-payment',
  templateUrl: './base-payment.component.html',
  styleUrls: ['./base-payment.component.scss']
})
export class BasePaymentComponent implements OnInit, OnDestroy {

  selectedToggleValue: string = 'OperatorInvoice';
  routerEventSubscription!: Subscription;

  constructor(private router: Router) { 
    this.routerEventSubscription = router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        this.setToggleValueBasedOnRouterUrl(event.url);
      }
    });
  }
  ngOnInit(): void {
    this.setToggleValueBasedOnRouterUrl(this.router.url);
  }

  ngOnDestroy(): void {
    if(this.routerEventSubscription != null) {
      this.routerEventSubscription.unsubscribe();
    }
  }

  setToggleValueBasedOnRouterUrl(url: string) {
    if(url.endsWith('/listBasePricing')) {
      this.selectedToggleValue = 'OperatorInvoice';
    } else if(url.endsWith('/listBusSpecificPricing')) {
      this.selectedToggleValue = 'ApnibusPayment';
    } else {
      //nothing
    }
  }

  onToggleButtonChange(value: any) {
    if(value == 'OperatorInvoice') {
      this.router.navigateByUrl('/dashboard/listBasePayment/listOperatorInvoice');
    } else if(value == 'ApnibusPayment') {
      this.router.navigateByUrl('/dashboard/listBasePayment/listApnibusPayment');
    } else {
      //nothing
    }
  }

}

