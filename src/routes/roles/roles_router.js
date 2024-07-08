const express = require("express");
const {IsAuthenticated} = require("@nathangroup/authorize");;
const routesList = require("../../middlewares/route_checker");
const { GenerateToken } = require("../../services/token_service");
const routes = require("../index");
const { Role, Activity } = require("../../models");
const db = require("../../middlewares/database");
const fetch = require("node-fetch");
const { ModelFields, ResponseFields } = require("../../utils/roles_utils");
const { ObjectId } = require("mongodb");

const getRouteData = async (route) => {
  try {
    const tokenData = { role: "System options" };
    const token = GenerateToken(tokenData);

    const response = await fetch(`http:127.0.0.1:2002${route}`, {
      method: "GET",
      headers: { authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    return data.data;
  } catch (error) {
    return {};
  }
};

const getFieldAccess = (data) => {
  if (Array.isArray(data)) {
    return data.map((item) => getFieldAccess(item)); // Recursively process array items
  } else if (typeof data === "object" && !Array.isArray(data)) {
    const result = {};
    for (const key in data) {
      result[key] = getFieldAccess(data[key]); // Recursive call for objects
    }
    return result;
  } else {
    return { read: true, write: true };
  }
};

const getRoleGetData = async (req, res) => {
  try {
    const query = "SELECT * FROM roles WHERE _id = ?";

    const selectedRole = await new Promise((resolve, reject) => {
      db.all(query, [req.body.role], (error, rows) => {
        if (error) {
          reject({ error, message: "Sql Error in your query", status: 500 });
        } else {
          resolve(rows);
        }
      });
    });

    const permissions = JSON.parse(selectedRole[0].permissions);

    const contains = permissions.find(
      (item) => item.name === req.body.name.toLowerCase()
    );

    const theRoutes =
      contains.contains.length > 0 ? contains.contains : [contains.name];

    const allRoutes = routesList(routes, { prefix: "/v1" });
    const allGetRoutes = allRoutes.filter((item) => {
      return item.method === "GET";
    });

    const filteredArr = allGetRoutes.filter((item) => {
      const routeLower = item.route.toLowerCase();
      return theRoutes.some((item) => routeLower.includes(item.toLowerCase()));
    });

    const processArray = (arr) => {
      if (!Array.isArray(arr)) {
        return arr;
      }

      const uniqueItems = arr.map((item) => {
        if (!Array.isArray(item)) {
          return item;
        }

        return item.reduce((acc, obj) => {
          Object.assign(acc, obj);
          return acc;
        }, {});
      });

      return uniqueItems;
    };

    let returnedData = [];

    for (let i = 0; i < filteredArr.length; i++) {
      const dataFromRoutes = await getRouteData(filteredArr[i].route);

      if (dataFromRoutes) {
        returnedData.push(dataFromRoutes);
      }
    }

    const fieldsAccessData = processArray(returnedData);

    const responseFields = getFieldAccess(fieldsAccessData);

    let modelFields = [];
    for (let i = 0; i < theRoutes.length; i++) {
      modelFields.push(ModelFields(theRoutes[i]));
    }

    const role = await Role.findOneAndUpdate(
      {
        _id: ObjectId(req.body.role),
        "permissions.name": req.body.name, // Find the role by its ID and the permission name
      },
      {
        $set: {
          "permissions.$.response": responseFields, // Update the response field
          "permissions.$.model": modelFields, // Update the model field
        },
      },
      {
        new: true,
      }
    );

    // const logMessage = `${req.user?.first_name} ${req.user?.middle_name} ${req.user?.last_name} added permissions to a role ${req.params.id}`;
    // await Activity.create({
    //   user_id: req.user.id,
    //   document_id: req.user.id,
    //   module: "users",
    //   oldDoc: {},
    //   newDoc: {},
    //   updatedFields: {},
    //   logMessage: logMessage,
    // });

    const updateFields = [role.name, JSON.stringify(role.permissions), req.body.role];

    const sql = "UPDATE roles SET name = ?, permissions = ? WHERE _id = ? ";

    db.all(sql, updateFields, (err, rows) => {
      if (err) {
        res.status(500).json({
          error: err,
          message: "Error updating role on support thread",
        });
      }
    });

    return res.status(201).json({ role });
  } catch (error) {

    return res.status(500).json({ message: "Server side error" });
  }
};

module.exports = getRoleGetData;
