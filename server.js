require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./app/models");
const Role = db.role;

db.sequelize.sync({ force: true }).then(() => {
    console.log("Drop and Resync Db");
    initial();
});

function initial() {
    Role.create({
        id: 1,
        name: "user",
    });

    Role.create({
        id: 2,
        name: "moderator",
    });

    Role.create({
        id: 3,
        name: "admin",
    });
}

const app = express();

var corsOptions = {
    origin: "http://localhost:8797",
};

app.use(cors(corsOptions));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

// routes
app.get("/", (req, res) => {
    res.json({ message: "Welcome to my application" });
});
require("./app/routes/auth.routes")(app);
require("./app/routes/task.routes")(app);
require("./app/routes/user.routes")(app);

const PORT = process.env.PORT || 8797;
app.listen(PORT, () => {
    console.log(`Server is running on: http://localhost:${PORT}.`);
});
