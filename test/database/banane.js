import {withDbTrunk} from "../../src/domain";
import cols from "../cols";

export const bananeBC = withDbTrunk("Banane BC", 1, "Nomb");
export const banane = withDbTrunk("banane canaries", 1, "Nomb");
export const transport = withDbTrunk("transport", 1000000, "Long");

export const database = {
    [cols.ONE]: [bananeBC, banane],
    [cols.TWO]: [transport]
};