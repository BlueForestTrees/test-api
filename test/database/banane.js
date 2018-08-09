import {withTrunk} from "../../src/domain";
import cols from "../cols";

export const bananeBC = withTrunk("Banane BC", 1, "Nomb");
export const banane = withTrunk("banane canaries", 1, "Nomb");
export const transport = withTrunk("transport", 1000000, "Long");

export const database = {
    [cols.ONE]: [bananeBC, banane],
    [cols.TWO]: [transport]
};