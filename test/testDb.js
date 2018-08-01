import {initDatabase} from "../src/db";
import ENV from "./env"
import cols from "./cols";
import {col} from "mongo-connexion";
import {expect} from 'chai';

describe('test-api-express-mongo', function () {
    it('initDatabase', () => initDatabase(ENV, cols)().then(assertDbInited));
});

const assertDbInited = async () =>
    expect((await col(cols.ONE).findOne({name:"banane canaries"})).name)
    .to.equal("banane canaries");