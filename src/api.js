import chai, {expect} from 'chai';
import {assertDb, initDatabase, updateDb} from "./db";
import jsonpath from 'jsonpath';
import {debug, removeObjects} from "./util"
import fs from 'fs';
import {isFunction} from 'lodash';

let api = null;

export const init = (apiPromise, ENV, cols, dbPath) => async function() {
    api = await apiPromise;
    await initDatabase(ENV, cols, dbPath)();
};

export const request = headers => {
    const req = chai.request(api)
    if (headers) {

    }
    return req
}

export const withTest = test => async () => {
    if (Array.isArray(test)) {
        const results = [];
        for (let i = 0; i < test.length; i++) {
            const rez = await withTest(test[i])();
            results.push(rez)
        }
        return Promise.all(results);
    } else {
        return makeDbPrechanges(test)
            .then(makeRequest)
            .then(assertHttpCode)
            .then(assertDbChanges)
            .then(assertHeaders)
            .then(assertBody)
            .then(assertBodyInclude)
            .then(assertBodypath);
    }
}

const makeDbPrechanges = async spec => {
    if (spec.db && spec.db.preChange) {
        await updateDb(spec.db.preChange);
        debug("db prechange:", spec.db.preChange);
    }
    return spec;
};
const secure = req => req.catch(res => res.response);
const makeRequest = async test => {
    if (test.req) {
        const m = test.req.method || "GET";
        switch (m) {
            case "GET":
                return {...test, actual: await secure(request(test.req.headers).get(makeUrl(test.req)))}
            case "PUT":
                return {...test, actual: await secure(request(test.req.headers).put(makeUrl(test.req)).send(test.req.body))}
            case "POST":
                let post = request(test.req.headers).post(makeUrl(test.req))
                if(test.req.file){
                    return {...test, actual: await secure(post.attach(test.req.file.field, fs.readFileSync(test.req.file.path), test.req.file.field))};
                }else{
                    return {...test, actual: await secure(post.send(test.req.body))};
                }
            case "DELETE":
                return {...test, actual: await secure(request(test.req.headers).del(makeUrl(test.req)).send(test.req.body))}
        }
    } else {
        return {...test};
    }
};
const assertHttpCode = test => {
    if (test.actual) {
        expect(test.actual.res.statusCode).to.equal(test.res && test.res.code || 200);
    }
    return test;
};
const assertDbChanges = async test => {
    if (test.db && test.db.expected)
        await assertDb(test.db.expected);
    return test;
};
const assertHeaders = test => {

    if (test.res && test.res.headers) {
        for (let i = 0; i < test.res.headers.length; i++) {
            const header = test.res.headers[i];
            if (header.key) {
                const expectedValue = header.value;
                if (expectedValue !== undefined) {
                    expect(test.actual.headers[header.key]).to.equal(expectedValue);
                } else {
                    expect(test.actual.headers[header.key]).to.be.not.null;
                }
            }
        }
    }

    return test;
};
const assertBody = test => {
    if (test.res && test.res.body !== undefined) {
        if(isFunction(test.res.body)){
            expect(test.actual.body).to.deep.equal(removeObjects(test.res.body()))
        }else{
            expect(test.actual.body).to.deep.equal(removeObjects(test.res.body))
        }
    }
    return test;
};
const assertBodyInclude = test => {
    if (test.res && test.res.bodyInclude !== undefined) {
        expect(test.actual.body).to.deep.include(test.res.bodyInclude);
    }
    return test;
};
const assertBodypath = test => {
    if (test.res) {
        if (test.res.bodypath) {
            if(Array.isArray(test.res.bodypath)){
                for(let i = 0; i < test.res.bodypath.length; i++){
                    assertOneBodypath(test, test.res.bodypath[i]);
                }
            }else{
                assertOneBodypath(test, test.res.bodypath);
            }
        }
    }
    return test;
};
const assertOneBodypath = (test, bodypath) => expect(jsonpath.query(test.actual.body, bodypath.path)).to.deep.equal(removeObjects(bodypath.value))

export const run = job => done => {
    job()
        .then(() => done())
        .catch(err => done(err));
};

const makeUrl = ({url, path, param}) => url ? url : path ? path + (param ? param : '') : "test url (url or path+param) not defined";