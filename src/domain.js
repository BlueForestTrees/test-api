import {object, remove} from "./util"
import _ from 'lodash'

export const setQuantity = (trunk, qt, unit) => {
    unit = unit ? unit : trunk.quantity.unit;
    trunk.quantity = {qt, unit};
};
export const removeItemQuantity = (item, subItemId) => ({
    ..._.omit(item, "items"),
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

export const withQtCoef = (items, coef) => _.forEach(items, root => root.quantity.qt *= coef || 2);
export const withoutQuantity = items => _.map(items, item => _.omit(item, "quantity"));
export const withIdQuantity = (_id, qt, unit) => ({_id, ...withQuantity(qt, unit)});
export const withIdQuantityRelativeTo = (_id, qt, unit, relativeTo) => ({...withIdQuantity(_id, qt, unit), relativeTo});
export const withId = _id => ({_id});
export const withIds = items => _.map(items, item => ({_id:item._id}));
export const withObjId = id => ({_id: object(id)});
export const withIdQtUnit = (_id, qt, unit) => ({_id, qt, unit});
export const withQuantity = (qt, unit) => ({quantity: {qt, unit}});
const withType = type => type ? ({type}) : ({});

export const withTrunk = (name, _id, qt, unit, type) => ({color: getRandomColor(), name, _id: object(_id), name_lower: name.toLowerCase(), ...withQuantity(qt, unit), ...withType(type)})

export const withEntry = (_id, name, grandeur) => ({_id:object(_id), color: getRandomColor(), name, grandeur, name_lower: name.toLowerCase()});
export const withValidationError = (prop, location, msg, value) => ({"errorCode": 2, errors: {[prop]: {location, msg, param: prop, value}}, message: "validation error(s)"});
export const withError = (errorCode, message) => ({errorCode, message});

export const oneResponse = {n: 1, ok: 1};

export const oneModifiedResponse = {nModified: 1, ...oneResponse};

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

export const notInSearchMixin = ["name_lower"];