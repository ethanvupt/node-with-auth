module.exports = (sequelize, Sequelize) => {
    const Token = sequelize.define("reset_tokens", {
        email: {
            type: Sequelize.STRING,
        },
        token: {
            type: Sequelize.STRING,
        },
        expiration: {
            type: Sequelize.DATE,
        },
        used: {
            type: Sequelize.INTEGER,
        },
    });

    return Token;
};
