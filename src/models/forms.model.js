const mongoose = require('mongoose');

const formSchema = new mongoose.Schema(
    {
        form_name: {
            type: String,
            required: true,
        },
        user_id: {
            type: String
        },
        created_by: {
            type: String,
            ref: 'User',
        },
        file:{
            type: String 
        },
        is_deleted: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Form', formSchema);
