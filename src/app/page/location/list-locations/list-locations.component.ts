import { Component, OnDestroy, OnInit } from '@angular/core';
import { Event, NavigationStart, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-list-locations',
  templateUrl: './list-locations.component.html',
  styleUrls: ['./list-locations.component.scss']
})
export class ListLocationsComponent implements OnInit, OnDestroy {

  selectedToggleValue: string = 'Districts';
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
    if(url.endsWith('/listDistrict')) {
      this.selectedToggleValue = 'Districts';
    } else if(url.endsWith('/listTown')) {
      this.selectedToggleValue = 'Towns';
    } else if(url.endsWith('/listBusAdda')) {
      this.selectedToggleValue = 'Bus Addas';
    } else {
      //nothing
    }
  }

  onToggleButtonChange(value: any) {
      if(value == 'Districts') {
        this.router.navigateByUrl('/dashboard/listLocations/listDistrict');
      } else if(value == 'Towns') {
        this.router.navigateByUrl('/dashboard/listLocations/listTown');
      } else if(value == 'Bus Addas') {
        this.router.navigateByUrl('/dashboard/listLocations/listBusAdda');
      } else {
        //nothing
      }
  }

}
