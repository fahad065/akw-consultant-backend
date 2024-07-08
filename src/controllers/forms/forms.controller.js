const { Form } = require('../../models')
const { ObjectId } = require('mongodb')
const path = require('path');
const fs = require('fs');

const addForm = async (req, res) => {

    try{
        const fileUrl = `/uploads/${req.file.filename}`;
        // console.log(fileUrl, '------fileUrl') 

        const newFile = new Form({
            'user_id': req.user._id,
            'file': fileUrl,
            'form_name': req.body.form_name,
            'created_by': req.user.first_name,
        });



        await newFile.save();
        return res.status(200).send('Form Created Successfully')
    }catch(err){
        res.status(500).json({message: err.message})
    }
};

const getAllForms = async (req, res) => {
    try{
        const forms = await Form.aggregate([
            {$match: { "is_deleted": false } },
            {
                $sort: { "createdAt": -1 }
            }
        ])

        return res.status(200).json({ data: forms, total: forms.length })
    }catch(err){
        return res.status(500).json({ message: err.message });
    }
}

const deleteForm = async (req, res) => {
    try{
        const id = req.params.id
        const filter = { "_id": id };

        const form_delete = await Form.findOneAndUpdate(filter, { 'is_deleted': true });

        return res.status(200).json({ data: form_delete })
    }catch(err){
        return res.status(500).json({ message: err.message });
    }
}

const updateForm = async (req, res) => {
    try{
        const id = req.params.id
        const fileUrl = `/uploads/${req.file.filename}`;

        const body = {
            "form_name": req.body.form_name,
            "file": fileUrl,
            'created_by': req.user.first_name,
        }

        const form = await Form.findByIdAndUpdate(req.params.id, body, {
            new: true,
        });

        return res.status(200).send('Form Updated Successfully')
    }catch(err){
        return res.status(500).json({ message: err.message });
    }
}


module.exports = {
    addForm,
    getAllForms,
    deleteForm,
    updateForm
}