export interface ViaRoute {
    id: string;
    fromTownName: string;
    toTownName: string;
    status: boolean;

    newStatusValue: boolean;
}

export interface BusRouteStoppage {
    id: string;
    townName: string;
    townStoppage: TownStoppage;
    status: string;

    latitude: number;
    longitude: number;

    newLatitudeValue: number;
    newLongitudeValue: number;

    editStatus: string;
}

export interface TownStoppage {
    name: string;
    latitude: number;
    longitude: number;
    geoFenceRadius: number;
}

export interface BusRouteJourney {
    id: string;
    busRouteId: string;
    
    busNumber: string;
    routeName: string;
    startTime: string;
    isActive: boolean;

    newActiveValue: boolean;
}

export enum EditState {
    Saved = 'Saved',
    Changed = 'Changed',
}