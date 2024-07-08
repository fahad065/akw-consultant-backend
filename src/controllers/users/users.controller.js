const { User } = require("../../models");

const { diff } = require("deep-object-diff");
const bcrypt = require("bcrypt");

const addUser = async (req, res) => {
    try {
        const body = req.body;

        const salt = bcrypt.genSaltSync(10);
        const hashed = bcrypt.hashSync(body.password, salt);
        body.password = hashed;
        const userResult = await User.create(body);

        res.status(201).json({ data: userResult });
    } catch (error) {
        return res.status(500).json({ message: "Server side error" });
    }
};

const allUsers = async (req, res) => {
    try {
        let { limit, search } = req.query;
        const skip = req.query.skip ? req.query.skip : 0;

        const users = await User.aggregate([
            {
                $lookup: {
                    from: "roles",
                    localField: "role",
                    foreignField: "_id",
                    as: "role",
                },
            },
            {
                $unwind: "$role",
            },
            {
                $limit: parseInt(limit),
            },
            {
                $skip: parseInt(skip),
            },
            {
                $project: {
                    personal: 1,
                    user_status: 1,
                    email: 1,
                    first_name: 1,
                    middle_name: 1,
                    last_name: 1,
                    image_url: 1,
                    "role._id": 1,
                    "role.name": 1
                },
            },
        ]);

        return res.status(200).json({ data: users });
    } catch (error) {
        return res.status(500).json({ message: "Server side error" });
    }
};


const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).catch((error) =>
            res.status(500).json({ message: "Unable to get user" })
        );
        return res.status(200).json({ data: user });
    } catch (error) {
        return res.status(500).json({ message: "Server side error" });
    }
};

const updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.user, req.body, {
            new: true,
        });
        return res.status(200).json({ data: user });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Server side error" });
    }
};

const allUsersByRole = async (req, res) => {
    try{
        const users = await User.aggregate([
            { $match: { "user_status": 'Active' } },
            {
                $lookup: {
                    from: "roles",
                    localField: "role",
                    foreignField: "_id",
                    as: "role",
                }
            },
            { $unwind: "$role" },
            {
                $project: {
                    _id: 1,
                    first_name: 1,
                    last_name: 1,
                    email: 1,
                    role: "$role"
                }
            }
        ])

        res.status(200).json({ data: users, total: users.length })
    }catch(err){
        return res.status(500).json({ message: "Server side error" });
    }
}

module.exports = {
    addUser,
    allUsers,
    getUserById,
    updateUser,
    allUsersByRole
};
