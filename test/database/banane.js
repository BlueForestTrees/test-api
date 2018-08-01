import {withTrunk} from "../../src/domain";
import cols from "../cols";

export const bananeBC = withTrunk("Banane BC", "6b6a03c03e77667641d2d2c3", 1, "count");
export const banane = withTrunk("banane canaries", "7b6a03c03e77667641d2d2c3", 1, "count");
export const transport = withTrunk("transport", "8b6a03c03e77667641d2d2c3", 1000, "km");

export const database = {
    [cols.ONE]: [bananeBC, banane],
    [cols.TWO]: [transport]
};