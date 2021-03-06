import {object, remove} from "./util"
import _ from 'lodash'

export const setBqt = (item, bqt) => {
    Object.assign(item, withBqt(bqt))
    return item
}
export const withoutItemQuantity = (item, subItemId) => ({
    ...item,
    items: _.map(item.items, subitem => subitem._id.equals(subItemId) ? _.omit(subitem, "quantity") : subitem)
});
export const replaceItem = (obj, prop, value) => {
    const result = remove(obj, prop, {_id: value._id});
    result[prop].push(value);
    return result;
};
export const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

export const withQtCoef = (items, coef) => Array.isArray(items) ?
    _.map(items, item => ({...item, ...withIdBqtG(item._id, item.quantity.bqt * coef, item.quantity.g)}))
    :
    {...items, ...withIdBqtG(items._id, items.quantity.bqt * coef, items.quantity.g)}

export const withoutQuantity = items => _.map(items, item => _.omit(item, "quantity"));
export const withIdBqtG = (_id, bqt, g) => ({_id, ...withBqtG(bqt, g)})
export const withIdBqt = (_id, bqt) => ({_id, ...withBqt(bqt)})
export const withBqtG = (bqt, g) => ({quantity: {bqt, g}})
export const withBqt = bqt => ({quantity: {bqt}})
export const withIdQuantity = (_id, qt, unit) => ({_id, ...withQuantity(qt, unit)});
export const withIdQuantityRelativeTo = (_id, qt, unit, relativeTo) => ({...withIdQuantity(_id, qt, unit), relativeTo});
export const withIdBqtGRelativeTo = (_id, bqt, g, relativeTo) => ({...withIdBqtG(_id, bqt, g), relativeTo})
export const withId = _id => ({_id});
export const withIds = items => _.map(items, item => ({_id:item._id}));
export const withObjId = id => ({_id: object(id)});
export const withIdQtUnit = (_id, qt, unit) => ({_id, qt, unit});
export const withQuantity = (qt, unit) => ({quantity: {qt, unit}});
const withType = type => type ? ({type}) : ({});

export const withDbTrunk = (name, _id, bqt, g, type) => ({...withType(type), color: getRandomColor(), name, _id: object(_id), ...withBqtG(bqt, g)})

export const withEntry = (_id, name, g) => ({_id:object(_id), color: getRandomColor(), name, g});
export const withValidationError = (prop, location, msg, value) => ({"errorCode": 2, errors: {[prop]: {location, msg, param: prop, value}}, message: "Demande erronée"});
export const withError = (errorCode, message) => ({errorCode, message});

export const oneResponse = {n: 1, ok: 1};
export const zeroDeletionOk = {n: 0, ok: 1};
export const oneDeletionOk = {n: 1, ok: 1};
export const twoDeletionOk = {n: 2, ok: 1};

export const oneModifiedResponse = {nModified: 1, ...oneResponse};
export const noneModifiedResponse = {nModified: 0, ...oneResponse};

export const oneUpsertedResponse = _id => ({
    "n": 1,
    "nModified": 0,
    "ok": 1,
    "upserted": [
        {
            "_id": _id,
            "index": 0
        }
    ]
});

export const ObjectIDRegex = /^[a-fA-F0-9]{24}$/;