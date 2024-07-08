const express = require("express");
const usersController = require("../../controllers/users/users.controller");

const router = express.Router();

router.post("/add-users", usersController.addUser);
router.get("/all-users", usersController.allUsers);
router.get('/all-users-by-role', usersController.allUsersByRole);

router.get("/get-user/:id", usersController.getUserById);
router.patch("/update-user/:user", usersController.updateUser);

module.exports = router;
