import { Bus } from "./bus";
import { Operator } from "./operator";


export interface BusOperator {

    operator: Operator;
    bus?: Bus;

}