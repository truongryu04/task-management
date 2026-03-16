const mongoose = require("mongoose")
const TaskSchema = new mongoose.Schema(
    {
        title: String,
        status: String,
        content: String,
        timeStart: Date,
        timeFinish: Date,
        completedAt: Date,
        createdBy: String,
        listUser: Array,
        taskParentId: String,
        tags: Array,
        description: String,
        priority: {
            type: String,
            enum: ["low", "medium", "high", "urgent"],
            default: "medium"
        },
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