const mongoose = require("mongoose");

const Users = new mongoose.Schema(
    {
        tokens: {
            type: Array,
            default: []
        },
        image_url: {
            type: String,
            default: "",
        },
        user_status: {
            type: String,
            default: 'Active'
        },
        is_deleted: {
            type: Boolean,
            default: false
        },
        email: {
            type: String,
            required: true
        },
        first_name: {
            type: String,
            required: true,
        },
        last_name: {
            type: String,
        },
        middle_name: {
            type: String,
        },
        password: {
            type: String,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        role: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Role",
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("User", Users);
