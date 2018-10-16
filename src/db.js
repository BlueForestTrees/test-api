import _ from 'lodash'
import read from 'fs-readdir-recursive'
import path from 'path'
import chai, {expect} from 'chai'
import chaiHttp from 'chai-http'
import {addObjects, clon} from "./util"
import {withId} from "./domain"
import _mongodb from 'mongodb'
import {runBodypath} from "./bodypath"

const debug = require('debug')('test:db')

chai.use(chaiHttp)
chai.should()

////////////////copied from mongo-registry
let database = null
const auth = ENV => (ENV.DB_USER && ENV.DB_PWD) ? (ENV.DB_USER + ":" + ENV.DB_PWD + "@") : ""
const dbConnect = (ENV) => Promise
    .resolve(`mongodb://${auth(ENV)}${ENV.DB_HOST}:${ENV.DB_PORT}/${ENV.DB_NAME}?authSource=admin`)
    .then(url => {
        debug(`CONNECTING TO %o`, url)
        return _mongodb.MongoClient.connect(url, {useNewUrlParser: true})
    })
    .then(client => {
        debug("CONNECTED")
        database = client.db(ENV.DB_NAME)
    })
export const col = collectionName => database.collection(collectionName)
///////////////////////////////////////////////////


export const initDatabase = (ENV, cols, dbPath) => () => {
    debug("initDatabase for tests")
    return dbConnect(ENV)
        .then(purgeDatabase(cols))
        .then(() => debug("Purge Ok, construction"))
        .then(buildDatabase(path.resolve(dbPath || "test/database"), cols))
        .then(addInitialData(cols))
}

export const purgeDatabase = cols => () => Promise.all(_.map(cols, colname => {
    debug("Suppression : " + colname)
    return col(colname).deleteMany()
}))

let db = null
const buildDatabase = (dbFolder, cols) => () => {
    debug("Construction depuis " + dbFolder)
    db = _.fromPairs(_.map(cols, colName => [colName, []]))
    read(dbFolder)
        .forEach(function (file) {
            if (file.indexOf(".js") > 1) {
                const dbPart = require(path.join(dbFolder, file)).database
                _.forEach(cols, colName => {
                    if (_.has(dbPart, colName)) {
                        db[colName].push(...dbPart[colName])
                    }
                })
            }
        })

    let objectDB = _.fromPairs(_.map(db, (value, key) => ([key, addObjects(clon(value))])))

    return objectDB
}

export const addInitialData = cols => async objectDB => Promise.all(_.map(cols,
    async (colname) => {
        let datas = objectDB[colname]
        if (datas && datas.length > 0) {
            debug(`Insertion : ${colname} (${datas.length} documents)`)
            return await col(colname).insertMany(datas)
        }
    }))


export const updateDb = async ({colname, doc}) => {
    await col(colname).deleteOne(withId(doc._id))
    await col(colname).insertOne(doc)
}

export const assertDb = async ({list, colname, doc, missingDoc}) => {
    if (list) {
        return Promise.all(_.map(list, expected => assertDb(expected)))
    }
    if (doc) {
        if (doc._id) {
            const dbDoc = await loadFromDbById(colname, doc._id)
            if (doc.bodypath) {
                runBodypath(dbDoc, doc.bodypath)
            } else {
                expect(dbDoc, `DB doc KO: ${colname}`).to.deep.equal(doc)
                debug("assertDb OK, doc by id:", doc._id, dbDoc._id)
            }
        } else {
            const dbDoc = await loadFromDbByDoc(colname, doc)
            expect(dbDoc, "dbDoc by fields not found:\n" + JSON.stringify(doc, null, 2)).to.be.not.null
            debug("assertDb OK, doc by fields", dbDoc)
        }
    }
    if (missingDoc) {
        if (missingDoc._id) {
            const dbDoc = await loadFromDbById(colname, missingDoc._id)
            expect(dbDoc, "missingDoc KO").to.be.null
            debug("not in db", missingDoc)
        } else {
            const dbDoc = await loadFromDbByDoc(colname, missingDoc)
            expect(dbDoc).to.be.null
            debug("not in db", missingDoc)
        }
    }
}

/**
 * @param ext s'il faut chercher avec _id en tant que string si non trouvé comme objectId
 */
export const loadFromDbById = (colname, _id) => col(colname).findOne(withId(_id))

export const loadFromDbByDoc = (colname, doc) => col(colname).findOne(doc)

export const countFromDbByDoc = async (colname, query) => (await col(colname).find(query).toArray()).length

export const withInfos = (colname, items) => _.map(items,
    item => Object.assign(
        item,
        _.pick(
            _.find(db[colname], {_id: item._id}),
            ["name", "color"]
        )
    ))

export const withImpactInfos = (colname, items) => _.map(items,
    item => Object.assign(
        item,
        _.pick(
            _.find(db[colname], {_id: item.impactId}),
            ["name", "color", "g"]
        )
    ))