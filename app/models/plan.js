'use strict';

var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var Plan = new Schema({
    place: {
        type: String,
        trim: true,
        required: [true, 'The field "place" is required']
    },
    date: {
        type: Date,
        required: true
    },
    totalgoing: {
        type: Number,
        default: 0
    },
    going: [{
        type: String,
        ref: 'LocalUser'
    }]
});

module.exports = mongoose.model('Plan', Plan);