const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Role = db.role;
const ResetToken = db.token;
const nodemailer = require("nodemailer");
const crypto = require("crypto");

var transport = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
    },
});

const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = (req, res) => {
    // Save User to Database
    User.create({
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8),
    })
        .then((user) => {
            if (req.body.roles) {
                Role.findAll({
                    where: {
                        name: {
                            [Op.or]: req.body.roles,
                        },
                    },
                }).then((roles) => {
                    user.setRoles(roles).then(() => {
                        res.send({
                            message: "User was registered successfully!",
                        });
                    });
                });
            } else {
                // user role = 1
                user.setRoles([1]).then(() => {
                    res.send({ message: "User was registered successfully!" });
                });
            }
        })
        .catch((err) => {
            res.status(500).send({ message: err.message });
        });
};

exports.signin = (req, res) => {
    User.findOne({
        where: {
            username: req.body.username,
        },
    })
        .then((user) => {
            if (!user) {
                return res.status(404).send({ message: "User Not found." });
            }

            var passwordIsValid = bcrypt.compareSync(
                req.body.password,
                user.password
            );

            if (!passwordIsValid) {
                return res.status(401).send({
                    accessToken: null,
                    message: "Invalid Password!",
                });
            }

            var token = jwt.sign({ id: user.id }, config.secret, {
                expiresIn: 86400, // 24 hours
            });

            var authorities = [];
            user.getRoles().then((roles) => {
                for (let i = 0; i < roles.length; i++) {
                    authorities.push("ROLE_" + roles[i].name);
                }
                res.status(200).send({
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    roles: authorities,
                    accessToken: token,
                });
            });
        })
        .catch((err) => {
            res.status(500).send({ message: err.message });
        });
};

exports.forgotPassword = (req, res) => {
    User.findOne({
        where: {
            email: req.body.email,
        },
    }).then((user) => {
        if (!user) {
            return res.status(200).send({ message: "Ok" });
        }

        ResetToken.update(
            {
                used: 1,
            },
            {
                where: {
                    email: req.body.email,
                },
            }
        );

        //Create a random reset token
        var token = crypto.randomBytes(64).toString("base64");

        //token expires after one hour
        var expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + 1 / 24);

        //insert token data into DB
        ResetToken.create({
            email: req.body.email,
            expiration: expireDate,
            token: token,
            used: 0,
        });

        //create email
        const message = {
            from: process.env.SENDER_ADDRESS,
            to: req.body.email,
            replyTo: process.env.REPLYTO_ADDRESS,
            subject: process.env.FORGOT_PASS_SUBJECT_LINE,
            text:
                "To reset your password, please click the link below.\n\n" +
                process.env.DOMAIN +
                "/api/auth/reset-password?token=" +
                encodeURIComponent(token) +
                "&email=" +
                req.body.email,
        };

        //send email
        transport.sendMail(message, function (err, info) {
            if (err) {
                console.log(err);
            } else {
                console.log(info);
            }
        });

        return res.status(200).send({ message: "Email Sent" });
    });
};

exports.validateResetLink = (req, res) => {
    ResetToken.destroy({
        where: {
            expiration: { [Op.lt]: db.Sequelize.fn("CURDATE") },
        },
    });

    //find the token
    var record = ResetToken.findOne({
        where: {
            email: req.query.email,
            expiration: { [Op.gt]: db.Sequelize.fn("CURDATE") },
            token: req.query.token,
            used: 0,
        },
    });

    if (record == null) {
        return res.status(200).send({
            message: "Token has expired. Please try password reset again.",
        });
    }

    return res.status(200).send({
        message: record,
    });
};

exports.resetPassword = (req, res) => {
    var record = ResetToken.findOne({
        where: {
            email: req.body.email,
            expiration: { [Op.gt]: db.Sequelize.fn("CURDATE") },
            token: req.body.token,
            used: 0,
        },
    });

    if (record == null) {
        return res.json({
            status: "error",
            message:
                "Token not found. Please try the reset password process again.",
        });
    }

    var upd = ResetToken.update(
        {
            used: 1,
        },
        {
            where: {
                email: req.body.email,
            },
        }
    );

    var newPassword = bcrypt.hashSync(req.body.password, 8);

    User.update(
        {
            password: newPassword,
        },
        {
            where: {
                email: req.body.email,
            },
        }
    );

    return res.json({
        status: "ok",
        message: "Password reset. Please login with your new password.",
    });
};
