import {removeObjects} from "./util"
import {map} from "lodash"
import jsonpath from 'jsonpath'
import {expect} from 'chai'

export const runBodypath = (doc, bodypath) => {

    console.log(doc)
    console.log(bodypath)

    if (Array.isArray(bodypath)) {
        const errs = []
        for (let i = 0; i < bodypath.length; i++) {
            try {
                assertOneBodypath(doc, bodypath[i])
            } catch (e) {
                errs.push(e)
            }
        }
        if (errs.length > 0) {
            throw {message: "BODYPATH ERRORS \n" + map(errs, err => err.message).join("\n")}
        }
    } else {
        assertOneBodypath(doc, bodypath)
    }
}
const arrayIfNeeded = v => Array.isArray(v) ? v : [v]
const assertOneBodypath = (doc, bodypath) =>
    expect(jsonpath.query(doc, bodypath.path))
        .to.deep.equal(arrayIfNeeded(removeObjects(bodypath.value)), bodypath.path)