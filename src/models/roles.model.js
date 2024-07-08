const mongoose = require('mongoose');

const rolesSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        permissions: {
            type: Array
        },
        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        updated_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        is_deleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Role', rolesSchema);
