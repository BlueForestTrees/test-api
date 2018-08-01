import _ from 'lodash';
import mongo from 'mongodb';

export const object = id => new mongo.ObjectID(id);
export const createObjectId = () => object(createStringObjectId());
export const createStringObjectId = () => (new Date().getTime() / 1000 | 0).toString(16) + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, () => (Math.random() * 16 | 0).toString(16)).toLowerCase();

export const debug = (...obj) => {
    try {
        console.log(JSON.stringify(obj, null, 4));
    } catch (e) {
        console.log(obj);
    }
    return Promise.resolve(...obj);
};
export const clon = obj => _.cloneDeep(obj);
export const remove = (obj, prop, criteria) => {
    const clone = clon(obj);
    clone[prop] = _.without(clone[prop], _.find(clone[prop], criteria));
    return clone;
};


export const addObjects = data => {
    let isArray = _.isArray(data);
    if(!isArray){
        data = [data];
    }

    _.forEach(data, item => {
        item._id = object(item._id);
        if (item.items) {
            _.forEach(item.items, subitem => {
                subitem._id = object(subitem._id);
            })
        }
        return item;
    });

    return isArray ? data : data[0];
};

export const removeObjects = data => {
    return _.cloneDeepWith(data, val => {
        if (val && val._bsontype && val._bsontype === "ObjectID") {
            return val.toString();
        } else {
            return undefined;
        }
    });
};