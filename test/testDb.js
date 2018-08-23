import {col, initDatabase} from "../src/db"
import ENV from "./env"
import cols from "./cols"
import {expect} from 'chai'

describe('database', function () {
    it('init, insert', () =>
        initDatabase(ENV, cols)()
            .then(assertDbInited)
    )
})

const assertDbInited = async () =>
    expect((await col(cols.ONE).findOne({name: "banane canaries"})).name)
        .to.equal("banane canaries")