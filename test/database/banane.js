import {withTrunk} from "../../src/domain";
import cols from "../cols";

export const bananeBC = withTrunk("Banane BC", 1, "count");
export const banane = withTrunk("banane canaries", 1, "count");
export const transport = withTrunk("transport", 1000, "km");

export const database = {
    [cols.ONE]: [bananeBC, banane],
    [cols.TWO]: [transport]
};