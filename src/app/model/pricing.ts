export interface BasePricing {
    id: string;
    fromTownName: string;
    toTownName: string;
    isAcAvailable: boolean;
    category: string;

    normalSeatPrice: number;
    upperSingleSleeperPrice: number;
    upperShareSleeperPrice: number;
    lowerSingleSleeperPrice: number;
    lowerShareSleeperPrice: number;

    newNormalSeatPrice: number;
    newUpperSingleSleeperPrice: number;
    newUpperShareSleeperPrice: number;
    newLowerSingleSleeperPrice: number;
    newLowerShareSleeperPrice: number;
}

export interface BusSpecificPricing {
    
    id: string;
    busNumber: string;

    fromTownName: string;
    toTownName: string;
    isAcAvailable: boolean;
    category: string;

    normalSeatPrice: number;
    upperSingleSleeperPrice: number;
    upperShareSleeperPrice: number;
    lowerSingleSleeperPrice: number;
    lowerShareSleeperPrice: number;

    newNormalSeatPrice: number;
    newUpperSingleSleeperPrice: number;
    newUpperShareSleeperPrice: number;
    newLowerSingleSleeperPrice: number;
    newLowerShareSleeperPrice: number;

}

export interface ConductorPricing {
    
    id: string;
    busNumber: string;

    fromTownName: string;
    toTownName: string;
    isAcAvailable: boolean;
    category: string;

    normalSeatPrice: number;
    upperSingleSleeperPrice: number;
    upperShareSleeperPrice: number;
    lowerSingleSleeperPrice: number;
    lowerShareSleeperPrice: number;

    newNormalSeatPrice: number;
    newUpperSingleSleeperPrice: number;
    newUpperShareSleeperPrice: number;
    newLowerSingleSleeperPrice: number;
    newLowerShareSleeperPrice: number;

    pricingType: string;

}