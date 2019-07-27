import chai, {expect} from 'chai'
import {assertDb, initDatabase, updateDb} from "./db"
import {removeObjects} from "./util"
import fs from 'fs'
import {map, isFunction} from 'lodash'
import {runBodypath} from "./bodypath"

const debug = require('debug')('test:api')

let api = null

const applyPrechange = async preChange => {
    debug("applying db prechange %o", preChange)
    await updateDb(preChange)
}

const makeDbPrechanges = async spec => {
    if (spec.db && spec.db.preChange) {
        await applyPrechange(spec.db.preChange)
    }
    if (spec.db && spec.db.preChanges) {
        for (let i = 0; i < spec.db.preChanges; i++) {
            await applyPrechange(spec.db.preChanges[i])
        }
    }
    return spec
}

const secure = req => req.catch(res => res.response)
const makeRequest = async test => {
    if (test.req) {
        const m = test.req.method || "GET"
        switch (m) {
            case "GET":
                return {...test, actual: await secure(headers(test.req.headers, request().get(makeUrl(test.req))))}
            case "PUT":
                return {...test, actual: await secure(headers(test.req.headers, request().put(makeUrl(test.req)).send(test.req.body)))}
            case "POST":
                let post = request().post(makeUrl(test.req))
                if (test.req.file) {
                    return {...test, actual: await secure(headers(test.req.headers, post.attach(test.req.file.field, fs.readFileSync(test.req.file.path), test.req.file.field)))}
                } else {
                    return {...test, actual: await secure(headers(test.req.headers, post.send(test.req.body)))}
                }
            case "DELETE":
                return {...test, actual: await secure(headers(test.req.headers, request().del(makeUrl(test.req)).send(test.req.body)))}
        }
    } else {
        return {...test}
    }
}
const assertHttpCode = test => {
    if (test.actual) {
        expect(test.actual.res.statusCode).to.equal(test.res && test.res.code || 200)
    }
    return test
}
const assertDbChanges = async test => {
    if (test.db && test.db.expected)
        await assertDb(test.db.expected)
    return test
}
const assertHttpHeaders = test => {

    if (test.res && test.res.headers) {
        for (let i = 0; i < test.res.headers.length; i++) {
            const header = test.res.headers[i]
            if (header.key) {
                const expectedValue = header.value
                if (expectedValue !== undefined) {
                    expect(test.actual.headers[header.key]).to.equal(expectedValue)
                } else {
                    expect(test.actual.headers[header.key]).to.be.not.null
                }
            }
        }
    }

    return test
}
const assertHttpBody = test => {
    assertBody(test)
    assertBodyInclude(test)
    assertBodypath(test)
}
const assertBody = test => {
    if (test.res && test.res.body !== undefined) {
        if (isFunction(test.res.body)) {
            expect(test.actual.body).to.deep.equal(removeObjects(test.res.body()))
        } else {
            expect(test.actual.body).to.deep.equal(removeObjects(test.res.body))
        }
    }
    return test
}
const assertBodyInclude = test => {
    if (test.res && test.res.bodyInclude !== undefined) {
        expect(test.actual.body).to.deep.include(test.res.bodyInclude)
    }
    return test
}
const assertBodypath = test => {
    if (test.res) {
        if (test.res.bodypath) {
            expect(test.actual.body).to.be.not.null
            runBodypath(test.actual.body, test.res.bodypath)
        }
    }
    return test
}

const makeUrl = ({url, path, param}) => url ? url : path ? path + (param ? param : '') : "test url (url or path+param) not defined"

export const initApi = apiPromise => async () => api = await apiPromise

export const init = (apiPromise, ENV, cols, dbPath) => async function () {
    api = await apiPromise
    await initDatabase(ENV, cols, dbPath)()
}
export const run = job => done => {
    job()
        .then(() => done())
        .catch(err => done(err))
}
export const request = () => chai.request(api)
export const headers = (headers, req) => {
    if (headers) {
        const keys = Object.keys(headers)
        for (let i = 0; i < keys.length; i++) {
            req.set(keys[i], headers[keys[i]])
        }
    }
    return req
}
export const withTest = test => async () => {
    if (Array.isArray(test)) {
        const results = []
        for (let i = 0; i < test.length; i++) {
            const rez = await withTest(test[i])()
            results.push(rez)
        }
        return Promise.all(results)
    } else {
        const testResult = await makeDbPrechanges(test)
            .then(makeRequest)

        let exs = []
        try {
            await assertHttpCode(testResult)
            await assertHttpHeaders(testResult)
            await assertHttpBody(testResult)
        } catch (e) {
            exs.push(e)
        }
        try {
            await assertDbChanges(testResult)
        } catch (e) {
            exs.push(e)
        }
        if (exs.length > 1) {
            throw exs
        } else if (exs.length) {
            throw exs[0]
        }
    }
}