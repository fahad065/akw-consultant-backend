const express = require('express');
const validateToken = require('../../utils').validateToken;

const rolesController = require('../../controllers/roles/roles.controller');
const router = express.Router();

router.post('/', validateToken, rolesController.createNewRole);
router.get('/', validateToken,  rolesController.getAllRoles);
router.get('/:id', validateToken, rolesController.getRoleById);
router.patch('/:id', validateToken, rolesController.updateRole);
router.get('/server', validateToken, rolesController.getServerSavedRoles);

module.exports = router;
