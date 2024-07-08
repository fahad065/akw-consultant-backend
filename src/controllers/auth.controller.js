const bcrypt = require("bcrypt");
const { User,Role } = require("../models");
const {GenerateToken} = require('../services/token_service')

const landing = (req, res) => {
    res.status(200).json({ Message: "Welcome to Backend" });
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const searchedUser = await User.findOne({ email: email.toLowerCase(), is_deleted: false });
        // const searchedUser = await User.aggregate([
        //     { $match: { "email": email.toLowerCase(), "is_deleted": false } },
        //     {
        //         $addFields: { companyObjID: { $toObjectId: "$parent_company_id" } },
        //     },
        //     {
        //         $lookup: {
        //             from: "roles",
        //             localField: "role",
        //             foreignField: "_id",
        //             as: "role",
        //             pipeline: [
        //                 {
        //                     $project: {
        //                         _id: 0,
        //                         company_name: 1
        //                     }
        //                 }
        //             ]
        //         }
        //     },
        //     { $unwind: "$role" },
        //     {
        //         $project: {
        //             _id: 1,
        //             email: 1,
        //             first_name: 1,
        //             last_name: 1,
        //             middle_name: 1,
        //             role: "$role",
        //             password: 1,
        //             user_status: 1,
        //             image_url: 1
        //         }
        //     }
        // ])
        if (searchedUser === null || undefined || searchedUser.length == 0) {
            res.status(404).json({ message: "Error" });
        } else {
            bcrypt.compare(password, searchedUser.password, function (err, result) {
                if (result) {
                    // const token = GenerateToken(searchedUser);
                    const userData = {
                        "_id": searchedUser._id,
                        "role": searchedUser.role,
                        "email": searchedUser.email,
                        "first_name": searchedUser.first_name,
                        "last_name": searchedUser.last_name
                    }

                    const token = GenerateToken(searchedUser)

                    return res.status(200).json({ token: token });
                } else {
                    return res.status(401).json({ err: "Error" });
                }
            });
        }
    } catch (error) {
        return res.status(500).json({ Message: "Server side error" });
    }
};

const profile = async (req, res) => {
    try {
        const loggedInUser = await User.findOne({_id: req.user._id});
        
        const userRole = await Role.findOne({_id: req.user.role});

        loggedInUser.role = userRole;
        
        return res.status(200).json({user: loggedInUser})
    } catch (error) {
        return res.status(500).json({ Message: "Server side error" });
    }
};

const refreshToken = async (req, res) => {
    try {
        const searchedUser = await User.findOne({
            _id: req.body.id,
            is_deleted: false,
        });

        if (searchedUser === null || undefined) {
            res.status(404).json({ message: "User not found" });
        } else {
            const token = GenerateToken(searchedUser);
            return res.status(200).json({ token: token });
        }
    } catch (error) {
        return res.status(500).json({ Message: "Server side error" });
    }
};

module.exports = {
    landing,
    login,
    profile,
    refreshToken,
};
