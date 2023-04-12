import * as OrganizersDao from "../../models/organizers/organizers_dao.js";
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const OrganizersController = (app) => {
    app.get('/api/organizers', findAllOrganizers);
    app.post('/api/organizers', createOrganizer);
    app.delete('/api/organizers/:organizerId', deleteOrganizer);
    app.put('/api/organizers/:organizerId', updateOrganizer);
    app.get('/api/organizers/verify/:token', verifyOrganizer);
};

const findAllOrganizers = async (req, res) => {
    const organizers = await OrganizersDao.findAllOrganizers();
    res.json(organizers);
};
const createOrganizer = async (req, res) => {
    // const { username, password } = req.body;
    // try {
    //     const existingUser = await checkUsernameExistence(username);
    //     if (existingUser) {
    //         const errorMessage = 'User with this username already exists.';
    //         return res.status(400).json({ message: errorMessage });
    //     };
    //     // TODO
    // } catch (error) {
    //
    // };
};
const deleteOrganizer = async (req, res) => {
    // TODO: Only the organizer themselves and admins can perform delete an organizer action.
    const organizerId = req.params.organizerId;
    const status = await OrganizersDao.deleteOrganizer(organizerId);
    res.json(status);
};
const updateOrganizer = async (req, res) => {
    const organizerId = req.params.organizerId;
    const updates = req.body;
    const status = await OrganizersDao.updateOrganizer(organizerId, updates);
    res.json(status);
};
const verifyOrganizer = async (req, res) => {
    // TODO
};

export default OrganizersController;