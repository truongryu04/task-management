const mongoose = require('mongoose');
const MONGODB_URL = process.env.MONGODB_URL

module.exports.connect = async () => {
    try {
        await mongoose.connect(MONGODB_URL);
        console.log("Connect Success DB")
    } catch (error) {
        console.log("Connect Error")
    }
}
