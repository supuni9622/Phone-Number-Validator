'use strict';

const Joi = require('joi');
const lodash = require('lodash');
const myCustomJoi = Joi.extend(require('joi-phone-number'));

let MessageSchema = Joi.object().keys({
    source: Joi.string().required(),
    transports: Joi.array().items(),
    content: Joi.object().keys({
        sms: Joi.string().min(1),
        email: Joi.object().keys({
            subject: Joi.string().required().min(1),
            htmlType: Joi.boolean().default(true),
            body: Joi.string().required().min(1),
            cc: Joi.array().items(Joi.string().email()).unique(),
            bcc: Joi.array().items(Joi.string().email()).unique()
        })
    }).or('sms', 'email').required().min(1).max(1),
    priority: Joi.boolean().default(false),
    destinations: Joi.array().items(Joi.string()).required().min(1).max(20)//todo:update the max count accordingly
});

let MessageSchemaSms = Joi.object().keys({
    apiKeyId: Joi.string().required(),
    source: Joi.string().required(),
    content: Joi.string().required(),
    destinations: Joi.array().items(Joi.string()).required().min(1).max(20)//todo:update the max count accordingly
});

let EmailDestinationsSchema = Joi.array().items(Joi.string().email()).unique();
let MobileDestinationsSchema = Joi.array().items(myCustomJoi.string().phoneNumber({ format: 'e164', strict: true })).unique();


class MessageValidator {
    static isValid(payload, callback) {
        try {
            const { error, value: validatedPayload } = MessageSchema.validate(payload);

            if (error) {
                callback(error);
            } else {
                let destinations = validatedPayload['destinations'];
                let transport = lodash.keys(validatedPayload.content)[0];
                switch (transport) {
                    case 'sms':
                        let mappedDestinations = destinations.map((dest) => {
                            return dest.charAt(0) === '+' ? dest : '+' + dest;
                        });
                        const { error: destError } = MobileDestinationsSchema.validate(mappedDestinations);
                        if (destError) {
                            //todo: remove this later. temporary fix for 074 dialog numbers
                            /*let validDialogNumbers = mappedDestinations.reduce((acc, curr) => {
                                if (curr.startsWith('+9474') && curr.length === 12) {
                                    acc.push(curr);
                                }
                                return acc;
                            }, []);
                            if (validDialogNumbers.length > 0 && validDialogNumbers.length === mappedDestinations.length) {
                                validatedPayload['destinations'] = mappedDestinations.map((dest) => {
                                    return dest.substr(1);
                                });
                                callback(null, validatedPayload);
                            } else {
                                callback(destError);
                            }*/
                            callback(destError);
                        } else {
                            validatedPayload['destinations'] = mappedDestinations.map((dest) => {
                                return dest.substr(1);
                            });
                            callback(null, validatedPayload);
                        }
                        /*
                                                Joi.validate(mappedDestinations, MobileDestinationsSchema, (error, validatedDestinations) => {
                                                    
                                                });*/
                        break;
                    case 'email':
                        const { error: emailDestError } = EmailDestinationsSchema.validate(destinations);
                        if (emailDestError) {
                            callback(emailDestError);
                        } else {
                            callback(null, validatedPayload);
                        }
                        break;
                    default:
                        callback(new Error('invalid transport'));
                }
            }
        } catch (err) {
            callback(err);
        }
    }

    static isValidSms(payload, callback) {
        try {
            const { error, value: validatedPayload } = MessageSchemaSms.validate(payload);

            if (error) {
                callback(error);
            } else {
                let destinations = validatedPayload['destinations'];
                let mappedDestinations = destinations.map((dest) => {
                    return dest.charAt(0) === '+' ? dest : '+' + dest;
                });
                const { error: destError } = MobileDestinationsSchema.validate(mappedDestinations);
                if (destError) {
                    //todo: remove this later. temporary fix for 074 dialog numbers
                    /*
                    let validDialogNumbers = mappedDestinations.reduce((acc, curr) => {
                        if (curr.startsWith('+9474') && curr.length === 12) {
                            acc.push(curr);
                        }
                        return acc;
                    }, []);
                    if (validDialogNumbers.length > 0 && validDialogNumbers.length === mappedDestinations.length) {
                        validatedPayload['destinations'] = mappedDestinations.map((dest) => {
                            return dest.substr(1);
                        });
                        callback(null, validatedPayload);
                    } else {
                        callback(destError);
                    }*/
                    callback(destError);
                } else {
                    validatedPayload['destinations'] = mappedDestinations.map((dest) => {
                        return dest.substr(1);
                    });
                    callback(null, validatedPayload);
                }
               
            }
        } catch (err) {
            callback(err);
        }
    }
   
}

// const payload = {
//     "source": "ShoutOUT",
//     "destinations": ['94742082965', '94742436059', '94742419823', '94742126656', '94742799280', '94742944306'] ,
//     "transports": ["sms"] ,
//     "content": {
//      "sms": "Sent via ShoutOUT Gateway"
//     }
//    }

const payload = {
    "source":"ThyagaPROMO",
    "destinations":["94742082965"],
    "content":"Test Message",
    "apiKeyId":"yutut67"
}
MessageValidator.isValidSms(payload, (error, validatedMessage) => {
    if (error) {
        console.error('message validation error ', error.message);
    }
    console.log("Validated message", validatedMessage)
});
