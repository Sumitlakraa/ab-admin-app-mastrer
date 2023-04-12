import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './page/login/login.component';
import { AppNavRootComponent } from './page/app-nav-root/app-nav-root.component';
import { ListOperatorsComponent } from './page/list-operators/list-operators.component';
import { EditOperatorComponent } from './page/edit-operator/edit-operator.component';
import { ListBusesComponent } from './page/list-buses/list-buses.component';
import { EditBusComponent } from './page/edit-bus/edit-bus.component';
import { ListRoutesComponent } from './page/list-routes/list-routes.component';
import { EditRouteComponent } from './page/edit-route/edit-route.component';
import { ListLocationsComponent } from './page/location/list-locations/list-locations.component';
import { ListBusAddasComponent } from './page/location/list-bus-addas/list-bus-addas.component';
import { ListTownsComponent } from './page/location/list-towns/list-towns.component';
import { ListDistrictsComponent } from './page/location/list-districts/list-districts.component';
import { EditDistrictComponent } from './page/location/edit-district/edit-district.component';
import { EditTownComponent } from './page/location/edit-town/edit-town.component';
import { EditBusAddasComponent } from './page/location/edit-bus-addas/edit-bus-addas.component';
import { BusRouteListComponent } from './page/bus-route/bus-route-list/bus-route-list.component';
import { EditBusRouteComponent } from './page/bus-route/edit-bus-route/edit-bus-route/edit-bus-route.component';
import { ViaRouteListComponent } from './page/bus-route/via-route-list/via-route-list/via-route-list.component';
import { BusRouteStoppageListComponent } from './page/bus-route/bus-route-stoppage-list/bus-route-stoppage-list/bus-route-stoppage-list.component';
import { MultiplePricingComponent } from './page/pricing/multiple-pricing/multiple-pricing.component';
import { BasePricingComponent } from './page/pricing/base-pricing/base-pricing.component';
import { BusSpecificPricingComponent } from './page/pricing/bus-specific-pricing/bus-specific-pricing.component';
import { MultipleTicketComponent } from './page/ticket/list-ticket/list-ticket.component';
import { EditTicketComponent } from './page/ticket/edit-ticket/edit-ticket.component';
import { OperatorLedgerComponent } from './page/ledger/operator-ledger/operator-ledger.component';
import { BusLedgerComponent } from './page/ledger/bus-ledger/bus-ledger.component';
import { TicketLedgerComponent } from './page/ledger/ticket-ledger/ticket-ledger.component';
import { BusRouteJourneyListComponent } from './page/bus-route/bus-route-journey-list/bus-route-journey-list.component';
import { ConductorPricingComponent } from './page/conductor-pricing/conductor-pricing.component';
import { ListPosConcessionComponent } from './page/concession/list-pos-concession/list-pos-concession.component';
import { EditPosConcessionComponent } from './page/concession/edit-pos-concession/edit-pos-concession.component';
import { AngularFireAuthGuard, hasCustomClaim, redirectUnauthorizedTo, redirectLoggedInTo } from '@angular/fire/compat/auth-guard';
import { EditOperatorInvoiceComponent } from './page/payment/edit-operator-invoice/edit-operator-invoice.component';
import { OperatorInvoiceListComponent } from './page/payment/operator-invoice-list/operator-invoice-list.component';
import { NotificationComponent } from './page/notification/notification.component';
import { ApnibusPaymentToOperatorComponent } from './page/payment/apnibus-payment-to-operator/apnibus-payment-to-operator.component';
import { BasePaymentComponent } from './page/payment/base-payment/base-payment.component';




const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['']);



const routes: Routes = [
  {
    path : '', 
    component: LoginComponent
  },
  {
    path : 'dashboard', 
    component: AppNavRootComponent,
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
    children: [
      {
        path: 'listOperators',
        component: ListOperatorsComponent,
      },
      {
        path: 'editOperator',
        component: EditOperatorComponent,
      },
      {
        path: 'listBuses',
        component: ListBusesComponent,
      },
      {
        path: 'editBus',
        component: EditBusComponent,
      },
      {
        path: 'listRoutes',
        component: ListRoutesComponent,
      },
      {
        path: 'editRoute',
        component: EditRouteComponent,
      },
      {
        path: 'listLocations',
        component: ListLocationsComponent,
        children: [
          {
            path: 'listDistrict',
            component: ListDistrictsComponent,
          },
          {
            path: 'listTown',
            component: ListTownsComponent,
          },
          {
            path: 'listBusAdda',
            component: ListBusAddasComponent,
          }
        ]
      },
      {
        path: 'editDistrict',
        component: EditDistrictComponent,
      },
      {
        path: 'editTown',
        component: EditTownComponent,
      },
      {
        path: 'editBusAdda',
        component: EditBusAddasComponent,
      },
      {
        path: 'listBusRouteMapping',
        component: BusRouteListComponent,
      },
      {
        path: 'editBusRouteMapping',
        component: EditBusRouteComponent,
      },
      {
        path: 'listViaRoute',
        component: ViaRouteListComponent,
      },
      {
        path: 'listBusRouteStoppage',
        component: BusRouteStoppageListComponent,
      },
      {
        path: 'listBusRouteJourney',
        component: BusRouteJourneyListComponent,
      },
      {
        path: 'listConductorPricing',
        component: ConductorPricingComponent,
      },
      {
        path: 'listMultiplePricing',
        component: MultiplePricingComponent,
        children: [
          {
            path: 'listBasePricing',
            component: BasePricingComponent,
          },
          {
            path: 'listBusSpecificPricing',
            component: BusSpecificPricingComponent,
          }
        ]
      },


      {
        path: 'listBasePayment',
        component: BasePaymentComponent,
        children: [
          {
            path: 'listApnibusPayment',
            component: ApnibusPaymentToOperatorComponent,
          },
          {
            path: 'listOperatorInvoice',
            component: OperatorInvoiceListComponent,
          }

        ]
      },


      {
        path: 'listTickets',
        component: MultipleTicketComponent,
      },
      {
        path: 'editTicket',
        component: EditTicketComponent,
      },
      {
        path: 'operatorLedger',
        component: OperatorLedgerComponent,
      },
      {
        path: 'busLedger',
        component: BusLedgerComponent,
      },
      {
        path: 'ticketLedger',
        component: TicketLedgerComponent,
      },
      {
        path: 'listPosConcession',
        component: ListPosConcessionComponent,
      },
      {
        path: 'editPosConcession',
        component: EditPosConcessionComponent,
      },
      {
        path: 'editOperatorInvoice',
        component: EditOperatorInvoiceComponent,
      },
      {
        path: 'listOperatorInvoice',
        component: OperatorInvoiceListComponent,
      },
      {
        path: 'listNotification',
        component: NotificationComponent,
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
