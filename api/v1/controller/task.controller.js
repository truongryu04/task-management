const Task = require("../model/task.model")


// [GET] api/v1/tasks
module.exports.index = async (req, res) => {
    const find = {
        deleted: false
    }
    if (req.query.status) {
        find.status = req.query.status
    }
    // Sort
    const sort = {}
    if (req.query.sortKey && req.query.sortValue) {
        sort[req.query.sortKey] = req.query.sortValue
    }
    const task = await Task.find(find).sort(sort)
    res.json(task)
}
// [GET] api/v1/tasks/detail/:id
module.exports.detail = async (req, res) => {
    try {
        const id = req.params.id
        const task = await Task.find({
            _id: id,
            deleted: false
        })
        res.json(task)
    } catch {
        res.json("Không tìm thấy!")
    }

}