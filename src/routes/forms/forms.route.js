const express = require('express')
const validateToken = require('../../utils').validateToken
const formController = require('../../controllers/forms/forms.controller')
const router = express.Router()
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        return cb(null, "src/uploads/");
        // return cb(null, "./uploads/");
    },
    filename: function (req, file, cb) {
        return cb(null, `${Date.now()}-${file.originalname}`)
    }
});

const upload = multer({ storage: storage })

router.post('/add-form',upload.single('file'),validateToken, formController.addForm)
router.get('/getAll', formController.getAllForms)
router.post('/deleteForm/:id', formController.deleteForm)
router.patch('/update-form/:id', upload.single('file'),validateToken,formController.updateForm)
module.exports = router