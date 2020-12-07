const db = require("../models");
const Task = db.task;

exports.all = (req, res) => {
    Task.findAll().then((task) => {
        res.json({
            error: false,
            message: "All Tasks!",
            data: task,
        });
    });
};

exports.create = (req, res) => {
    var name = req.body.name;

    if (name == null) {
        res.send({ message: "Task name cannot be null" });
    }

    Task.create({
        name: name,
    })
        .then((task) => {
            res.send({ message: "Task was registered successfully!" });
        })
        .catch((err) => {
            res.status(500).send({ message: err.message });
        });
};

exports.findById = (req, res) => {
    var id = req.params.id;

    Task.findOne({ where: { id: id } })
        .then((task) => {
            res.json({ data: task });
        })
        .catch((err) => {
            res.status(500).send({ message: err.message });
        });
};

exports.update = (req, res) => {
    var newName = req.body.name;
    var id = req.params.id;

    Task.update(
        {
            name: newName,
        },
        {
            where: {
                id: id,
            },
        }
    )
        .then((task) => {
            res.send({ message: "Task is updated" });
        })
        .catch((err) => {
            res.status(500).send({ message: err.message });
        });
};

exports.destroy = (req, res) => {
    var id = req.params.id;

    Task.destroy({
        where: {
            id: id,
        },
    }).then((task) => {
        res.status(200).send({ message: "Task deleted successfully" });
    });
};
