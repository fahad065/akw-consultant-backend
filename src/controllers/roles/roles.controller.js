const { Activity, Role } = require("../../models");
const { ObjectId } = require("mongodb");

const createNewRole = async (req, res) => {
    try {
       const role = await Role.create(req.body)
       res.status(200).json(role)
    } catch (error) {
        return res.status(500).json({ message: "Server side error" });
    }
};

const getAllRoles = async (req, res) => {
    try {
        const roles = await Role.find({ is_deleted: false });

        return res.status(200).json({ data: roles });
    } catch (error) {
        return res.status(500).json({ message: "Server side error" });
    }
};

const getServerSavedRoles = async (req, res) => {
    try {
        const sql = "select * from roles";
        db.all(sql, [], (err, rows) => {
            if (err) {
                res.status(500).json({ error: err });
                return;
            }
            const data = rows.map((item) => {
                return {
                    _id: item._id,
                    name: item.name,
                    permissions: JSON.parse(item.permissions),
                    is_deleted: item.is_deleted,
                    created_by: item.created_by,
                    createdAt: item.createdAt,
                    updatedAt: item.updatedAt,
                };
            });
            return res.status(200).json({ data });
        });
    } catch (error) {
        res.status(500).json({ message: "error getting server roles" });
    }
};

const getRoleById = async (req, res) => {
    try {
        const id = req.params.id;
        const roles = await Role.findOne({ _id: ObjectId(id), is_deleted: false });
        return res.status(200).json({ data: roles });
    } catch (error) {
        return res.status(500).json({ message: "Error getting single role" });
    }
};

const updateRole = async (req, res) => {
    try {
        const id = req.params.id;

        const body = req.body;
        body.created_by = req.user._id;
        const role = await Role.findOneAndUpdate({ _id: ObjectId(id) }, body, {
            new: true,
        });

        // const updateFields = [role.name, JSON.stringify(role.permissions), id];

        // const sql = await Role.updateOne(
        //     { "_id": ObjectId(id) },
        //     {
        //         $set: updateObj,
        //     },
        //     {
        //         arrayFilters: [
        //             {
        //                 "users.user_id": {
        //                     $in: user.user_id,
        //                 },
        //             },
        //         ],
        //     }
        // )
        

        // const sql = "UPDATE roles SET name = ?, permissions = ? WHERE _id = ? ";

        // db.all(sql, updateFields, (err, rows) => {
        //     if (err) {
        //         res.status(500).json({
        //             error: err,
        //             message: "Error updating role on support thread",
        //         });
        //     }
        // });

        return res.status(200).json({ data: role });
    } catch (error) {
        return res.status(500).json({ message: "Error updating roles" });
    }
};

const deleteRole = async (req, res) => {
    try {
        const logMessage = `${req.user?.first_name} ${req.user?.middle_name} ${req.user?.last_name} deleted role with id no ${req.params.id}`;
        await Activity.create({
            user_id: req.user.id,
            document_id: req.user.id,
            module: "users",
            oldDoc: {},
            newDoc: {},
            updatedFields: {},
            logMessage: logMessage,
        });

        const updateQuery = "DELETE FROM roles WHERE id = ?";
        db.all(updateQuery, [req.params.id], (err, rows) => {
            if (err) {
                res.status(500).json({ error: err });
            }
            return res.status(200).json({ data: rows });
        });
    } catch (error) {
        return res.status(500).json({ message: "Error deleting role" });
    }
};

module.exports = {
    createNewRole,
    getAllRoles,
    updateRole,
    getRoleById,
    deleteRole,
    getServerSavedRoles,
};
