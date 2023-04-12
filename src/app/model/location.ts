export interface TownBoardingPoint {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    town: Town;
    status: string;
    type: string;

    geofenceRadius: number;
    nameTranslation: any;
}

export interface Town {
    id: string;
    name: string;
    district: District;
    status: string;
    townStoppageCount: number;
    type: string;

    nameTranslation: any;
}

export interface District {
    id: string;
    name: string;
    state: State;
}

export interface State {
    id: string;
    name: string;
}

export interface BusesLocationData {
    name: string;
    lat: any;
    lng: any;
    date: any;
}