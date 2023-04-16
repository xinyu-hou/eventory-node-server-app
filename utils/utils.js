import * as UsersDao from '../models/users/users-dao.js';
import * as AdminsDao from '../models/admins/admins-dao.js';
import * as OrganizersDao from "../models/organizers/organizers_dao.js";
import nodemailer from "nodemailer";
import mongoose from "mongoose";
import * as EventsDao from "../models/events/events-dao.js";

export const checkUsernameExistence = async (username) => {
    const existingUser = await UsersDao.findOneUser(username);
    if (existingUser) {
        return true;
    }
    const existingOrganizer = await OrganizersDao.findOneOrganizer(username);
    if (existingOrganizer) {
        return true;
    }
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
    }
    const existingOrganizer = await OrganizersDao.findOneOrganizer(username);
    if (existingOrganizer) {
        return existingOrganizer;
    }
    const existingAdmin = await AdminsDao.findOneAdmin(username);
    if (existingAdmin) {
        return existingAdmin;
    }
};

export const isCurrentUserAdmin = async (req, res, next) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser || currentUser.role !== 'admin') {
        return res.status(401).json({ message: "Unauthorized." });
    }
    next();
};

export const isCurrentUserOrganizer = async (req, res, next) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser || currentUser.role !== 'organizer') {
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

export const isCurrentUserCurrentOrganizer = async (req, res, next) => {
    const currentUser = req.session["currentUser"];
    const organizerId = req.params.organizerId;
    if (!currentUser || currentUser._id !== organizerId) {
        return res.status(401).json({ message: "Unauthorized." });
    }
    next();
};

export const isCurrentUserEventOrganizer = async (req, res, next) => {
    const currentUser = req.session["currentUser"];
    const eventId = req.params.eventId;
    const event = await EventsDao.findEventById(eventId);
    const eventOrganizerId = event.organizer; // of type object
    if (!currentUser || currentUser._id != eventOrganizerId) {
        return res.status(401).json({ message: "Unauthorized." });
    }
    next();
};

export const checkUserIdExists = async (req, res, next) => {
    const userId = req.params.userId;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(404).json({ message: 'User not found.' });
    }
    const user = await UsersDao.findUserById(userId);
    if (!user) {
        return res.status(404).json({ message: 'User not found.' });
    }
    next();
};

export const checkOrganizerIdExists = async (req, res, next) => {
    const organizerId = req.params.organizerId;
    if (!mongoose.Types.ObjectId.isValid(organizerId)) {
        return res.status(404).json({ message: 'Organizer not found.' });
    }
    const organizer = await OrganizersDao.findOrganizerById(organizerId);
    if (!organizer) {
        return res.status(404).json({ message: 'Organizer not found.'});
    }
    next();
};

export const checkEventIdExists = async (req, res, next) => {
    const eventId = req.params.eventId;
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        return res.status(404).json({ message: 'Event not found.' });
    }
    const event = await EventsDao.findEventById(eventId);
    if (!event) {
        return res.status(404).json({ message: 'Event not found.'});
    }
    next();
};

export const sendActivationEmailByRole = async (username, activationToken, role) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
            user: process.env.SMTP_USERNAME,
            pass: process.env.SMTP_PASSWORD,
        }
    });
    const text = `Please click the following link to verify your email address: ${process.env.BASE_URL}/api/${role}/verify/${activationToken}`;
    const mailOptions = {
        from: 'Eventory App <eventoryma@gmail.com>',
        to: username,
        subject: 'Activate you Eventory account',
        text: text,
        replyTo: 'noreply@eventoryma.com'
    };
    await transporter.sendMail(mailOptions);
};