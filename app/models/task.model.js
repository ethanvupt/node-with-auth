module.exports = (sequelize, Sequelize) => {
    const Task = sequelize.define("tasks", {
        name: {
            type: Sequelize.STRING,
        },
    });

    return Task;
};
