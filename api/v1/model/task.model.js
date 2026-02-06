const mongoose = require("mongoose")
const TaskSchema = new mongoose.Schema(
    {
        title: String,
        status: String,
        content: String,
        timeStart: Date,
        timeFinish: Date,
        deleted: {
            type: Boolean,
            default: false,
        },
        deletedAt: Date
    }, {
    timestamps: true
});

const Task = mongoose.model('Task', TaskSchema, "tasks")
module.exports = Task