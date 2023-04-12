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

export const checkUserType = async (username) => {
    const existingUser = await UsersDao.findOneUser(username);
    if (existingUser) {
        return 'user';
    };
    const existingOrganizer = await OrganizersDao.findOneOrganizer(username);
    if (existingOrganizer) {
        return 'organizer';
    };
    const existingAdmin = await AdminsDao.findOneAdmin(username);
    if (existingAdmin) {
        return 'admin';
    }
    // return 'nobody';
};