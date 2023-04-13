import * as UsersDao from '../models/users/users-dao.js';
import * as AdminsDao from '../models/admins/admins-dao.js';
import * as OrganizersDao from "../models/organizers/organizers_dao.js";

export const checkUsernameExistence = async (username) => {
    const existingUser = await UsersDao.findOneUser(username);
    if (existingUser) {
        return true;
    };
    const existingOrganizer = await OrganizersDao.findOneOrganizer(username);
    if (existingOrganizer) {
        return true;
    };
    const existingAdmin = await AdminsDao.findOneAdmin(username);
    if (existingAdmin) {
        return true;
    }
    return false;
};

export const checkUserExistence = async (username) => {
    const existingUser = await UsersDao.findOneUser(username);
    if (existingUser) {
        return existingUser;
    };
    const existingOrganizer = await OrganizersDao.findOneOrganizer(username);
    if (existingOrganizer) {
        return existingOrganizer;
    };
    const existingAdmin = await AdminsDao.findOneAdmin(username);
    if (existingAdmin) {
        return existingAdmin;
    };
};

export const isCurrentUserAdmin = async (req, res, next) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser || currentUser.role !== 'admin') {
        return res.status(401).json({ message: "Unauthorized." });
    }
    next();
};

export const isCurrentUserCurrentUser = async (req, res, next) => {
    const currentUser = req.session["currentUser"];
    const userId = req.params.userId;
    if (!currentUser || currentUser._id !== userId) {
        return res.status(401).json({ message: "Unauthorized." });
    }
    next();
};