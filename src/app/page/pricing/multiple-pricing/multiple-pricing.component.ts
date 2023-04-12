import { Component, OnDestroy, OnInit } from '@angular/core';
import { Event, NavigationStart, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-multiple-pricing',
  templateUrl: './multiple-pricing.component.html',
  styleUrls: ['./multiple-pricing.component.scss']
})
export class MultiplePricingComponent implements OnInit, OnDestroy {

  selectedToggleValue: string = 'RoutePricing';
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
      this.selectedToggleValue = 'RoutePricing';
    } else if(url.endsWith('/listBusSpecificPricing')) {
      this.selectedToggleValue = 'BusSpecificPricing';
    } else {
      //nothing
    }
  }

  onToggleButtonChange(value: any) {
    if(value == 'RoutePricing') {
      this.router.navigateByUrl('/dashboard/listMultiplePricing/listBasePricing');
    } else if(value == 'BusSpecificPricing') {
      this.router.navigateByUrl('/dashboard/listMultiplePricing/listBusSpecificPricing');
    } else {
      //nothing
    }
  }

}
