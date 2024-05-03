module.exports = {
    multipleMongooseToObject: function (mongooseArrays) {
        return mongooseArrays.map(ele => ele.toObject());
    },
    singleMongooseToObject: function (mongooseElement) {
        return mongooseElement ? mongooseElement.toObject() : mongooseElement;
    }
}