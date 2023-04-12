import { Component, DoCheck, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BusRouteMappingMetaData, Route } from 'src/app/model/route';

@Component({
  selector: 'app-edit-bus-route-mapping',
  templateUrl: './edit-bus-route-mapping.component.html',
  styleUrls: ['./edit-bus-route-mapping.component.scss']
})
export class EditBusRouteMappingComponent implements OnInit, DoCheck  {

  @Input() busRouteMappingMetaData!: BusRouteMappingMetaData;
  @Input() busRouteDetails!: Route;

  @Output() boardingPointSatusChanged = new EventEmitter();
  @Output() boardingPointETASatusChanged = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  ngDoCheck(): void {
    
  }

  onBusRouteBordingPointStatusChanged() {
    this.boardingPointSatusChanged.emit();
  }

  onBusRouteBordingPointEtaStatusChanged() {
    this.boardingPointETASatusChanged.emit();
  }

}
