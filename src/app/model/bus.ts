import { BusImageData } from "./image-data";

export interface Bus {
    bus_id? : string;

    operator_id?: string;
    operator_name: string;
    operator_number: string;

    bus_number: string;
    bus_make: string;

    seating_type: string;
    total_seats?: number;
    total_upper_sleepers?: number;
    total_upper_sharing_sleepers?: number,
    total_sleepers?: number;
    total_sharing_sleepers?: number,

    layout_type: string;
    gps_status: string;
    status: string;

    bus_type: string;
    type: string;

    has_ac: boolean|undefined;

    driver_name: string;
    driver_number: string;

    conductor_name: string;
    conductor_number: string;
    digital_commission?: number;
    cash_commission?: number;
    ticket_header: string;
    print_bus_number: boolean;
    pos_lock: boolean;


    bookingAllowed: boolean;
    is_pos_connected: boolean;
    bus_rc_images: BusImageData[];
    bus_images: BusImageData[];
    adhaar_images: BusImageData[];


}
