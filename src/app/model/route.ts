import { Town, TownBoardingPoint } from "./location";
import {RemarksData } from "./remarks"

export interface RouteMetaData {
    route_id? : string;

    via: string;
    name: string;
    bus_count: number;
    town_count: number;

    fromTown: Town;
    toTown: Town;

    status: string;
}

export interface Route {
    towns: RouteTown[];
}

export interface RouteTown {
    id: string;
    town: Town;
    duration: number;
    distance: number;
    saveState: SaveState;
    boardingPoints: RouteTownBoardingPoint[];
    status: boolean;
    etaStatus: boolean;
    newEtaStatusValue: boolean;

    newDurationValue: number;
    newDistanceValue: number;
    newStatusValue: boolean;
}

export interface RouteTownBoardingPoint {
    id: string;
    townBoardingPoint: TownBoardingPoint;
    duration: number;
    distance: number;
    saveState: SaveState;
    status: boolean;

    etaStatus: boolean;
    newEtaStatusValue: boolean;

    newDurationValue: number;
    newStatusValue: boolean;
    newDistanceValue:number;
}

export enum SaveState {
    Saved = 'Saved',
    Changed = 'Changed',
}

export interface RouteCompleteDetail {
    routeMetaData: RouteMetaData;
    route: Route;
}

export interface BusRouteMappingMetaData {
    id: string;
    routeMetaData: RouteMetaData;
    bus: any;
    name: string;
    startTime: string;
    interval: number;
    isActive: boolean;
    new_is_active: boolean;
}