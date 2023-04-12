import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';

import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTreeModule } from '@angular/material/tree';
import { MatBadgeModule } from '@angular/material/badge';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatNativeDateModule } from '@angular/material/core';

import { AppComponent } from './app.component';
import { LoginComponent } from './page/login/login.component';
import { AppNavRootComponent } from './page/app-nav-root/app-nav-root.component';
import { ListOperatorsComponent } from './page/list-operators/list-operators.component';
import { ListBusesComponent } from './page/list-buses/list-buses.component';
import { EditOperatorComponent } from './page/edit-operator/edit-operator.component';
import { EditBusComponent } from './page/edit-bus/edit-bus.component';

import { UploadImagesComponent } from './components/upload-images/upload-images.component';
import { ListRoutesComponent } from './page/list-routes/list-routes.component';
import { ProgressDialogComponent } from './dialog/progress-dialog/progress-dialog.component';
import { EditRouteComponent } from './page/edit-route/edit-route.component';
import { RouteTownComponent } from './components/route-town/route-town.component';
import { ListLocationsComponent } from './page/location/list-locations/list-locations.component';
import { ListDistrictsComponent } from './page/location/list-districts/list-districts.component';
import { ListTownsComponent } from './page/location/list-towns/list-towns.component';
import { ListBusAddasComponent } from './page/location/list-bus-addas/list-bus-addas.component';
import { CreateRouteDialogComponent } from './dialog/create-route-dialog/create-route-dialog.component';
import { RouteTownBoardingpointComponent } from './components/route-town-boardingpoint/route-town-boardingpoint.component';
import { EditDistrictComponent } from './page/location/edit-district/edit-district.component';
import { EditTownComponent } from './page/location/edit-town/edit-town.component';
import { EditBusAddasComponent } from './page/location/edit-bus-addas/edit-bus-addas.component';
import { BusRouteListComponent } from './page/bus-route/bus-route-list/bus-route-list.component';
import { EditBusRouteMetadataComponent } from './page/bus-route/edit-bus-route/edit-bus-route-metadata/edit-bus-route-metadata.component';
import { EditBusRouteMappingComponent } from './page/bus-route/edit-bus-route/edit-bus-route-mapping/edit-bus-route-mapping.component';
import { EditBusRouteComponent } from './page/bus-route/edit-bus-route/edit-bus-route/edit-bus-route.component';
import { BusRouteTownComponent } from './components/bus-route-town/bus-route-town/bus-route-town.component';
import { BusRouteTownBoardingpointComponent } from './components/bus-route-town-boardingpoint/bus-route-town-boardingpoint/bus-route-town-boardingpoint.component';
import { ViaRouteListComponent } from './page/bus-route/via-route-list/via-route-list/via-route-list.component';
import { BusRouteStoppageListComponent } from './page/bus-route/bus-route-stoppage-list/bus-route-stoppage-list/bus-route-stoppage-list.component';
import { MultiplePricingComponent } from './page/pricing/multiple-pricing/multiple-pricing.component';
import { BasePricingComponent } from './page/pricing/base-pricing/base-pricing.component';
import { BusSpecificPricingComponent } from './page/pricing/bus-specific-pricing/bus-specific-pricing.component';
import { BusFilterDialogComponent } from './dialog/bus-filter-dialog/bus-filter-dialog.component';
import { RouteFilterDialogComponent } from './dialog/route-filter-dialog/route-filter-dialog.component';
import { MultipleTicketComponent } from './page/ticket/list-ticket/list-ticket.component';
import { EditTicketComponent } from './page/ticket/edit-ticket/edit-ticket.component';
import { OperatorLedgerComponent } from './page/ledger/operator-ledger/operator-ledger.component';
import { BusLedgerComponent } from './page/ledger/bus-ledger/bus-ledger.component';
import { TicketLedgerComponent } from './page/ledger/ticket-ledger/ticket-ledger.component';
import { TownFilterDialogComponent } from './dialog/town-filter-dialog/town-filter-dialog.component';
import { CategoryFilterDialogComponent } from './dialog/category-filter-dialog/category-filter-dialog.component';
import { AcFilterDialogComponent } from './dialog/ac-filter-dialog/ac-filter-dialog.component';
import { DistrictFilterDialogComponent } from './dialog/district-filter-dialog/district-filter-dialog.component';
import { CreateJourneyDialogComponent } from './dialog/create-journey-dialog/create-journey-dialog.component';
import { DatePipe } from '@angular/common';
import { BusRouteJourneyListComponent } from './page/bus-route/bus-route-journey-list/bus-route-journey-list.component';
import { ConductorPricingComponent } from './page/conductor-pricing/conductor-pricing.component';
import { OwnerNameFilterDialogComponent } from './dialog/owner-name-filter-dialog/owner-name-filter-dialog.component';
import { OwnerMobileFilterDialogComponent } from './dialog/owner-mobile-filter-dialog/owner-mobile-filter-dialog.component';
import { CompanyNameFilterDialogComponent } from './dialog/company-name-filter-dialog/company-name-filter-dialog.component';
import { UploadPricingDialogComponent } from './dialog/upload-pricing-dialog/upload-pricing-dialog.component';
import { EditPosConcessionComponent } from './page/concession/edit-pos-concession/edit-pos-concession.component';
import { ListPosConcessionComponent } from './page/concession/list-pos-concession/list-pos-concession.component';
import { initializeApp,provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideAuth,getAuth } from '@angular/fire/auth';
import { provideFirestore,getFirestore } from '@angular/fire/firestore';
import { AngularFireModule } from '@angular/fire/compat';
import { AuthModule } from '@angular/fire/auth';
import { BusStatusFilterDialogComponent } from './dialog/bus-status-filter-dialog/bus-status-filter-dialog.component';
import { TicktBookingSearchComponent } from './page/ticket-booking/tickt-booking-search/tickt-booking-search.component';
import { PassengerMobileFilterDialogComponent } from './dialog/passenger-mobile-filter-dialog/passenger-mobile-filter-dialog.component';
import { PnrFilterDialogComponent } from './dialog/pnr-filter-dialog/pnr-filter-dialog.component';
import { BookingDateFilterDialogComponent } from './dialog/booking-date-filter-dialog/booking-date-filter-dialog.component';
import { SerachBusesComponent } from './page/ticket/book-ticket/serach-buses/serach-buses.component';
import { SearchedBusesListComponent } from './page/ticket/book-ticket/searched-buses-list/searched-buses-list.component';

import { UploadCommuterPricingDialogComponent } from './dialog/upload-commuter-pricing-dialog/upload-commuter-pricing-dialog.component';
import { OperatorInvoiceListComponent } from './page/payment/operator-invoice-list/operator-invoice-list.component';
import { EditOperatorInvoiceComponent } from './page/payment/edit-operator-invoice/edit-operator-invoice.component';
import { RouteCloneDialogComponent } from './dialog/route-clone-dialog/route-clone-dialog.component';
import { NotificationComponent } from './page/notification/notification.component';
import { UploadNotificationImageComponent } from './dialog/upload-notification-image/upload-notification-image.component';
import { ApnibusPaymentToOperatorComponent } from './page/payment/apnibus-payment-to-operator/apnibus-payment-to-operator.component';
import { PaymentSettleComponent } from './dialog/payment-settle/payment-settle.component';
import { BasePaymentComponent } from './page/payment/base-payment/base-payment.component';
import { AddFirstTownInRouteComponent } from './dialog/add-first-town-in-route/add-first-town-in-route.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AppNavRootComponent,
    ListOperatorsComponent,
    ListBusesComponent,
    EditOperatorComponent,
    EditBusComponent,
    UploadImagesComponent,
    ListRoutesComponent,
    ProgressDialogComponent,
    EditRouteComponent,
    RouteTownComponent,
    ListLocationsComponent,
    ListDistrictsComponent,
    ListTownsComponent,
    ListBusAddasComponent,
    CreateRouteDialogComponent,
    RouteTownBoardingpointComponent,
    EditDistrictComponent,
    EditTownComponent,
    EditBusAddasComponent,
    BusRouteListComponent,
    EditBusRouteComponent,
    EditBusRouteMetadataComponent,
    EditBusRouteMappingComponent,
    BusRouteTownComponent,
    BusRouteTownBoardingpointComponent,
    ViaRouteListComponent,
    BusRouteStoppageListComponent,
    MultiplePricingComponent,
    BasePricingComponent,
    BusSpecificPricingComponent,
    BusFilterDialogComponent,
    RouteFilterDialogComponent,
    MultipleTicketComponent,
    EditTicketComponent,
    OperatorLedgerComponent,
    BusLedgerComponent,
    TicketLedgerComponent,
    TownFilterDialogComponent,
    CategoryFilterDialogComponent,
    AcFilterDialogComponent,
    DistrictFilterDialogComponent,
    CreateJourneyDialogComponent,
    BusRouteJourneyListComponent,
    ConductorPricingComponent,
    OwnerNameFilterDialogComponent,
    OwnerMobileFilterDialogComponent,
    CompanyNameFilterDialogComponent,
    UploadPricingDialogComponent,
    EditPosConcessionComponent,
    ListPosConcessionComponent,
    BusStatusFilterDialogComponent,
    TicktBookingSearchComponent,
    PassengerMobileFilterDialogComponent,
    PnrFilterDialogComponent,
    BookingDateFilterDialogComponent,
    SerachBusesComponent,
    SearchedBusesListComponent,
    UploadCommuterPricingDialogComponent,
    OperatorInvoiceListComponent,
    EditOperatorInvoiceComponent,
    RouteCloneDialogComponent,
    NotificationComponent,
    UploadNotificationImageComponent,
    ApnibusPaymentToOperatorComponent,
    PaymentSettleComponent,
    BasePaymentComponent,
    AddFirstTownInRouteComponent,
    ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FlexLayoutModule,

    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,

    MatDialogModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDividerModule,
    MatExpansionModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatPaginatorModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatButtonToggleModule,
    MatTreeModule,

    MatBadgeModule,
    MatGridListModule,
    MatRadioModule,
    MatDatepickerModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatNativeDateModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    AngularFireModule.initializeApp(environment.firebase)
  ],
  exports: [AuthModule],
  providers: [DatePipe, 
    {
    provide: MatDialogRef,
    useValue: {}
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
