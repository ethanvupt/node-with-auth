const { authJwt } = require("../middleware");
const controller = require("../controllers/task.controller");

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    // Retrieve all tasks
    app.get("/api/tasks", [authJwt.verifyToken], controller.all);

    // Create a task
    app.post("/api/tasks", [authJwt.verifyToken], controller.create);

    // Retrieve a single task with id
    app.get("/api/tasks/:id", [authJwt.verifyToken], controller.findById);

    // Update a task with id
    app.put("/api/tasks/:id", [authJwt.verifyToken], controller.update);

    // Delete a task with id
    app.delete("/api/tasks/:id", [authJwt.verifyToken, authJwt.isAdmin], controller.destroy);
};
