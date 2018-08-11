import _ from 'lodash';
import read from 'fs-readdir-recursive';
import path from 'path';
import chai, {expect} from 'chai';
import chaiHttp from 'chai-http';
import {col, dbConnect} from "mongo-connexion";
import {addObjects, clon, removeObjects, debug} from "./util";
import {withId, withObjId} from "./domain";

chai.use(chaiHttp);
chai.should();

let db = null;

export const initDatabase = (ENV, cols, dbPath) => () => {
    console.log("initDatabase for tests");
    return dbConnect(ENV)
        .then(purgeDatabase(cols))
        .then(buildDatabase(path.resolve(dbPath || "test/database"), cols))
        .then(addInitialData(cols));
};

export const purgeDatabase = cols => () => Promise.all(_.map(cols, colname => {
    console.log("Suppression : " + colname);
    return col(colname).deleteMany();
}));

const buildDatabase = (dbFolder, cols) => () => {
    console.log("Construction depuis " + dbFolder);
    db = _.fromPairs(_.map(cols, colName => [colName, []]));
    read(dbFolder)
        .forEach(function (file) {
            if (file.indexOf(".js") > 1) {
                const dbPart = require(path.join(dbFolder, file)).database;
                _.forEach(cols, colName => {
                    if (_.has(dbPart, colName)) {
                        db[colName].push(...dbPart[colName]);
                    }
                });
            }
        });

    return _.fromPairs(_.map(db, (value, key) => ([key, addObjects(clon(value))])))
};

export const addInitialData = cols => async objectDB => Promise.all(_.map(cols,
    async (colname) => {
        let datas = objectDB[colname];
        if (datas && datas.length > 0) {
            console.log(`Insertion : ${colname} (${datas.length} documents)`);
            return await col(colname).insert(datas);
        }
    }));


export const updateDb = async ({colname, doc}) => {
    await col(colname).deleteOne(withId(doc._id))
    await col(colname).insertOne(doc)
};

export const assertDb = async ({list, colname, doc, missingDoc}) => {
    if (list) {
        return Promise.all(_.map(list, expected => assertDb(expected)));
    }
    if (doc) {
        if (doc._id) {
            try {
                const dbDoc = await loadFromDbById(colname, doc._id)
                expect(dbDoc).to.deep.equal(doc);
                debug("assertDb OK, doc by id", dbDoc);
            } catch (e) {
                console.log(`assertDB KO ${colname}`)
                throw e;
            }
        } else {
            const dbDoc = await loadFromDbByDoc(colname, doc);
            expect(dbDoc, "dbDoc by fields not found:\n" + JSON.stringify(doc, null, 2)).to.be.not.null
            debug("assertDb OK, doc by fields", dbDoc);
        }
    }
    if (missingDoc) {
        if (missingDoc._id) {
            const dbDoc = await loadFromDbById(colname, missingDoc._id)
            expect(dbDoc).to.be.null;
            debug("not in db", missingDoc);
        } else {
            const dbDoc = await loadFromDbByDoc(colname, missingDoc);
            expect(dbDoc).to.be.null;
            debug("not in db", missingDoc);
        }
    }
};

/**
 * @param ext s'il faut chercher avec _id en tant que string si non trouvé comme objectId
 */
export const loadFromDbById = async (colname, _id) => await col(colname).findOne(withId(_id));

export const loadFromDbByDoc = async (colname, doc) => await col(colname).findOne(doc);

export const countFromDbByDoc = async (colname, query) => (await col(colname).find(query).toArray()).length

export const withInfos = (colname, items) => _.map(items,
        item => Object.assign(
            item,
            _.pick(
                _.find(db[colname], {_id:item._id}),
                ["name", "color"]
            )
        ));
