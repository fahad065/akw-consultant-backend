const express = require("express");
const authController = require("../controllers/auth.controller");
const validateToken = require('../utils').validateToken;
const router = express.Router();

router.get("/", authController.landing);
router.post("/login", authController.login);
router.get("/profile", validateToken, authController.profile);
router.post("/refresh-token", authController.refreshToken);

// router.get("/all-routes", (req, res) => {
//   const data = router.stack.map((item) => {
//     return {
//       route: item.route.path,
//       method: item.route.methods,
//     };
//   });

//   res.status(200).json({ data });
// });

module.exports = router;
