import {removeItemQuantity} from "../src/domain"
import {expect} from "chai"
import {clon, createObjectId} from "../src/util"

describe("domain", function () {
    it("remove item quantity", () => {
        const item = {_id: createObjectId(), items: [{_id: createObjectId(), quantity: 45}, {_id: createObjectId(), quantity: 46}]}

        const expected = {_id: item._id, items: [{_id: item.items[0]._id, quantity: 45}, {_id: item.items[1]._id}]}

        expect(removeItemQuantity(item, clon(item.items[1]._id))).to.deep.equal(expected)
    })
})