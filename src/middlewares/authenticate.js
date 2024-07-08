const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const { TokenIssuer } = require("../constants/encryption.constants");
const { keyDecrypt } = require("./decode_encode");
const db = require("../middlewares/database");
const { Role } = require("../models");
const ObjectId = require('mongoose').Types.ObjectId;
const mongoose = require('mongoose');


const checkPermissions = (permission, name, url, method) => {
    let isPermitted = false;

    const permissions = permission.find((item) => item.name === name);
    
    console.log(permissions, '------persm')
    const allPermission = JSON.parse(permissions.permissions);
    
    let extractedSecondPath = url.split("/")[2];

    const checkIfRouteExist = allPermission.find((item) => {
        if (item.name === extractedSecondPath) {
            return item.name;
        } else if (item.contains) {
            return item.contains.includes(extractedSecondPath);
        } else {
            {
            }
        }
    });

    let methods = [];
    if (checkIfRouteExist) {
        Object.filter = (obj, predicate) =>
            Object.keys(obj)
                .filter((key) => predicate(obj[key]))
                .reduce((res, key) => ((res[key] = obj[key]), res), {});

        const trueMethods = Object.filter(
            checkIfRouteExist.permissions,
            (item) => item === true
        );

        if (Object.keys(trueMethods).includes("read")) {
            methods.push("GET");
        }

        if (Object.keys(trueMethods).includes("write")) {
            methods.push("POST", "DELETE", "PATCH");
        }
    }

    const allowed = methods.includes(method);

    return (isPermitted = allowed ? true : false);
};

const IsAuthenticated = (req, res, next) => {
    try {
        const folderPath = path.resolve(`${process.cwd()}/keys`);
        const privateKey = fs.readFileSync(`${folderPath}/private.pem`, "utf8");

        const token = req.headers.authorization?.split(" ");

        if (!req.headers.authorization) {
            res.status(401).json({ message: "Please add token headers" });
        }
        if (token[0] === "Bearer" && token[1].match(/\S+\.\S+\.\S+/) !== null) {
            jwt.verify(token[1], privateKey, { issuer: TokenIssuer, algorithms: ["RS512"], header: { typ: "" } },

                async function (err, decoded) {
                    if (err) {
                        res.status(401).json({ message: "Expired or invalid token" });
                    } else {
                        const decodedData = keyDecrypt(decoded.payload);
                        const data = JSON.parse(decodedData);

                        const theUrl = `${req.baseUrl}${req.route.path}`;

                        const isSystem = data.role === "System options" ? true : false;
                        console.log(data, '----------data')

                        if (isSystem) {
                            req.user = { id: "System" };
                            next();
                        }
                        
                        else {
                            // const sql =
                            //     'select * from roles WHERE _id = "' + data.role + '" ';

                            const role = await Role.aggregate([
                                { $match: { "_id": ObjectId(data.role) } }
                            ])

                            console.log(role, '----role', theUrl, req.method)
                            if(role.length > 0){
                                if (checkPermissions(role, "" + role[0].name + "", theUrl, req.method)) {
                                    req.user = data;
                                    next();
                                } else {
                                    res.status(412).json({ message: "Not permitted to view this resource" });
                                }
                            }else {
                                res.status(500).json({ error: 'Not Found' });
                            }

                            // db.all(role, [], (err, rows) => {
                            //     if (err) {
                            //         res.status(500).json({ error: err });
                            //     }
                            //     console.log(rows, data.role, '---------sql')
                            //     if (rows !== undefined && rows.length > 0) {
                            //         if (checkPermissions(rows, "" + rows[0].name + "", theUrl, req.method)) {
                            //             req.user = data;
                            //             next();
                            //         } else {
                            //             res.status(412).json({ message: "Not permitted to view this resource" });
                            //         }
                            //     }
                            // });
                        }
                    }
                }
            );
        } else {
            res.status(401).json({ message: "Token not provided" });
        }
    } catch (error) {
        return res.status(500).json({
            error: error,
        });
    }
};

module.exports = IsAuthenticated;
