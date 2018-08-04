import {expect} from 'chai';
import {replaceItem, withObjId, withTrunk} from "../src/domain";
import {addObjects, clon, createObjectId, createStringObjectId, object, remove, removeObjects} from "../src/util"
import mongo from "mongodb";

describe('mongo-connexion', function () {

    describe('util', function () {

        it('doit bien gérer les object id', function(){
            let id = createStringObjectId();
            expect(withObjId(id)._id instanceof(mongo.ObjectID)).to.equal(true);
            expect(withObjId(id)._id.toString()).to.equal(id);
        });

        it('generer un string objectid au bon format', function(){
            expect(createStringObjectId().length).to.equal(24);
        });

        it('generate unique objectIds', function () {
            const count = 10000;
            const objs = {};
            for (let i = 0; i < count; i++) {
                objs[createStringObjectId()] = true;
            }
            expect(Object.keys(objs).length).to.equal(count);
        });

        it('add ObjectID', function () {

            const docs = [{_id: "5a6a03c03e77667641d2d2c0"}];
            const expected = [{_id: new mongo.ObjectID("5a6a03c03e77667641d2d2c0")}];

            addObjects(docs);

            expect(docs).to.deep.equal(expected);
        });
        // it('add ObjectID 2', function () {
        //     expect(_.find(initialDB[cols.TRUNK],{name:"Bière Heineken"})._id).to.deep.equal(new mongo.ObjectID("6a6a03c03e77667641d2d2c3"));
        // });


        it('remove ok', function () {
            expect(remove(
                {
                    items: [{i: 1}, {i: 2}, {i: 3}]
                },
                "items",
                {i: 2})
            ).to.deep.equal(
                {
                    items: [{i: 1}, {i: 3}]
                });
        });

        it('replace ok', function () {
            expect(replaceItem(
                {
                    items: [{i: 1}, {i: 3}, {_id: 2, oldVal: 7}]
                },
                "items",
                {_id: 2, newVal: 5})
            ).to.deep.equal(
                {
                    items: [{i: 1}, {i: 3}, {_id: 2, newVal: 5}]
                });
        });

        const trunk = withTrunk("Gateau au chocolat", 200, "g");
        it('withTrunk ok', function () {
            expect(trunk)
                .to.deep.equal({
                color: trunk.color,
                _id: trunk._id,
                name: "Gateau au chocolat",
                name_lower: "gateau au chocolat",
                quantity: {
                    "qt": 200,
                    "unit": "g"
                }
            });
        });

        it('remove objects', function(){
            expect(removeObjects({toto: {titi: {tutu: object("5a6a03c03e77667641d2d2c3")}}}))
                .to.deep.equal({toto: {titi: {tutu: "5a6a03c03e77667641d2d2c3"}}})
        });

        it('clon mongo ids', function(){
            const id = createObjectId();
            expect(clon(id)).to.deep.equal(id)
        })

    });
});