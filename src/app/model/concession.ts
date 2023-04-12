import { Bus } from "./bus";

export interface Concession {
    concession_id: string;
    bus_id?: string;
    bus_number: string;

    name: string;
    value: string;
    is_active: boolean;
    new_is_active: boolean;
}
