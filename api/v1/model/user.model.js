const mongoose = require("mongoose")
// const slug = require('mongoose-slug-updater')
// mongoose.plugin(slug)
const generate = require("../../../helpers/generate")

const UserSchema = new mongoose.Schema({
    fullName: String,
    email: String,
    password: String,
    phone: String,
    avatar: String,

    deleted: {
        type: Boolean,
        default: false,
    },
    deletedAt: Date
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
});

const User = mongoose.model('User', UserSchema, "users")
module.exports = User