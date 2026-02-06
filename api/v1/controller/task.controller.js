const Task = require("../model/task.model")
const paginationHelper = require("../../../helpers/pagination")

// [GET] api/v1/tasks
module.exports.index = async (req, res) => {
    const find = {
        deleted: false
    }
    if (req.query.status) {
        find.status = req.query.status
    }
    // Phân quyền
    let initPagination = {
        currentPage: 1,
        limitItems: 2
    }
    const countTask = await Task.countDocuments(find)
    const objectPagination = paginationHelper(initPagination, req.query, countTask)


    // Sort
    const sort = {}
    if (req.query.sortKey && req.query.sortValue) {
        sort[req.query.sortKey] = req.query.sortValue
    }


    const task = await Task.find(find).sort(sort).limit(objectPagination.limitItems).skip(objectPagination.skip)
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