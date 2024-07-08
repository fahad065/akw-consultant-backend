const express = require("express")
const public = require("./auth");
const users = require("./users/users.route");
const roles = require("./roles/roles.route")
const forms = require('./forms/forms.route.js')
const router = express.Router();

const defaultRoutes = [
    {
        path: "/",
        route: public,
    },
    {
        path: "/users",
        route: users,
    },
    {
        path: "/roles",
        route: roles,
    },
    {
        path: '/forms',
        route: forms
    }
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

module.exports = router;
