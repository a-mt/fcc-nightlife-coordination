'use strict';

var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var GithubUser = new Schema({
    provider: { type: String, default: 'github' },
    username: {
        type: String,
        trim: true,
        required: [true, 'The field "username" is required']
    },
    github_id: {
        type: String,
        required: [true, 'The field "id" is required']
    }
}, { collection: 'users' });

module.exports = mongoose.model('GithubUser', GithubUser);