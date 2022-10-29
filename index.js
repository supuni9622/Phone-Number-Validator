'use strict';

const Joi = require('joi');
const myCustomJoi = Joi.extend(require('joi-phone-number'));

let MobileDestinationsSchema = Joi.array().items(myCustomJoi.string().phoneNumber({ format: 'e164', strict: true })).unique();

const destinationsTest = ['94742082965', '94742436059', '94742419823', '94742126656', '94742799280', '94742944306'];
//const destinationsTest = ['94742944306'];
const destinationsValid = ['94776449328'];
const destinationsInvalid = ['947764493288', '0776449328'];

let mappedDestinationsTest = destinationsTest.map((dest) => {
    return dest.charAt(0) === '+' ? dest : '+' + dest;
});
let mappedDestinationsValid = destinationsValid.map((dest) => {
    return dest.charAt(0) === '+' ? dest : '+' + dest;
});
let mappedDestinationsInvalid = destinationsInvalid.map((dest) => {
    return dest.charAt(0) === '+' ? dest : '+' + dest;
});
// const { error: destError } = MobileDestinationsSchema.validate(mappedDestinations);
// console.log("Error", destError);
const response1 = MobileDestinationsSchema.validate(mappedDestinationsTest);
console.log("Response1", response1);

const response2 = MobileDestinationsSchema.validate(mappedDestinationsValid);
console.log("Response2", response2);

const response3 = MobileDestinationsSchema.validate(mappedDestinationsInvalid);
console.log("Response3", response3);