import { OperatorImageData } from "./image-data";
import { RemarksData } from "./remarks";

export interface Operator {
    operator_id?: string;

    company_name: string;
    company_name_hindi: string;
    owner_name: string;
    owner_number: string;
    email: string;

    poc_name: string;
    poc_number: string;
    town: string;
    address: string;
    bus_counts: number|undefined;
    onboarded_bus_count: number|undefined;

    gst_number: string;
    adhaar_number: string;
    pan_number: string;
    status: string;

    account_type: string,
    bank_name: string;
    account_name: string;
    account_number: string;
    ifsc_code: string;

    cancel_cheque_images: OperatorImageData[];
    gst_images: OperatorImageData[];
    adhaar_images: OperatorImageData[];
    pan_images: OperatorImageData[];
    remarks: RemarksData;

    is_active: boolean;
}
