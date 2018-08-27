import {expect} from "chai"
import {clon, createObjectId} from "../src"
import {withoutItemQuantity, withQtCoef} from "../src"

describe("domain", function () {
    it("remove item quantity", () => {
        const item = {_id: createObjectId(), items: [{_id: createObjectId(), quantity: 45}, {_id: createObjectId(), quantity: 46}]}

        const expected = {_id: item._id, items: [{_id: item.items[0]._id, quantity: 45}, {_id: item.items[1]._id}]}

        expect(withoutItemQuantity(item, clon(item.items[1]._id))).to.deep.equal(expected)
    })

    it("gets array withQtCoef", () => {
        expect(withQtCoef([{_id: 321, quantity: {bqt: 2, g: "Nomb"}}], 2)).to.deep.equal([{_id: 321, quantity: {bqt: 4, g: "Nomb"}}])
    })

    it("gets object withQtCoef", () => {
        expect(withQtCoef({_id: 321, quantity: {bqt: 2, g: "Nomb"}}, 2)).to.deep.equal({_id: 321, quantity: {bqt: 4, g: "Nomb"}})
    })
})