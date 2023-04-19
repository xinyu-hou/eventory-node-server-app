import * as EventsDao from '../../models/events/events-dao.js';
import * as OrganizersDao from "../../models/organizers/organizers_dao.js";
import * as UsersDao from "../../models/users/users-dao.js";
import {
    checkEventIdExists,
    isCurrentUserEventOrganizer,
    isCurrentUserOrganizer
} from "../../utils/utils.js";
import mongoose from "mongoose";
import EventsModel from "../../models/events/events-model.js";

const EventsController = (app) => {
    app.get('/api/eventory/events', findEvents);
    app.get('/api/eventory/events/:eventId', checkEventIdExists, findEventById);
    app.post('/api/eventory/events', isCurrentUserOrganizer, createEvent); // Organizer only action
    app.delete('/api/eventory/events/:eventId', checkEventIdExists, isCurrentUserEventOrganizer, deleteEvent); // One organizer only action
    app.put('/api/eventory/events/:eventId', checkEventIdExists, isCurrentUserEventOrganizer, updateEvent); // One organizer only action
};

const findEvents = async (req, res) => {
    const { city, keyword } = req.body;
    if (city && keyword) {
        // handle findEventsByCityAndKeyword
        // query events with both city and keyword
        await findEventsByCityAndKeyword(city, keyword, res);
    } else if (city) {
        // handle findEventsByCity
        // query events with matching city
        await findEventsByCity(city, res);
    } else if (keyword) {
        // handle findEventsByKeyword
        // query events with matching keyword
        await findEventsByKeyword(keyword, res);
    } else {
        // handle findAllEvents
        // query all events
        await findAllEvents(res);
    }
};
const findEventsByCityAndKeyword = async (city, keyword, res) => {
    try {
        const cityRegex = new RegExp(city, 'i'); // 'i' flag for case-insensitivity
        const keywordRegex = new RegExp(keyword, 'i');
        const events = await EventsDao.findEventsByCityAndKeyword(cityRegex, keywordRegex);
        res.json(events);
    } catch (error) {
        console.error('Failed to find events by city and keyword: ', error.message);
        return res.status(500).json({ message: 'Server error.' });
    }
};
const findEventsByCity = async (city, res) => {
    try {
        const cityRegex = new RegExp(city, 'i'); // 'i' flag for case-insensitivity
        const events = await EventsDao.findEventsByCity(cityRegex);
        res.json(events);
    } catch (error) {
        console.error('Failed to find events by city: ', error.message);
        return res.status(500).json({ message: 'Server error.' });
    }
};
const findEventsByKeyword = async (keyword, res) => {
    try {
        const keywordRegex = new RegExp(keyword, 'i');
        const events = await EventsDao.findEventsByKeyword(keywordRegex);
        res.json(events);
    } catch (error) {
        console.error('Failed to find events by keyword: ', error.message);
        return res.status(500).json({ message: 'Server error.' });
    }
};
const findAllEvents = async (res) => {
    const events = await EventsDao.findAllEvents();
    res.json(events);
};
const findEventById = async (req, res) => {
    try {
        const eventId = req.params.eventId;
        const event = await EventsDao.findEventById(eventId);
        const eventTime = event.getDateTimeInTimeZone('America/New_York');
        console.log("Event time: " + eventTime);
        res.json(event);
    } catch (error) {
        console.error('Failed to find event: ', error.message);
        return res.status(500).json({ message: 'Server error.' });
    }
};
const createEvent = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        await session.withTransaction(async () => {
            // Retrieve organizer ID from session.
            const currentUser = req.session["currentUser"];
            const organizerId = currentUser._id;
            const event = req.body;
            // Construct a complete Event object.
            const completeEvent = new EventsModel({
                ...event,
                organizer: organizerId
            });
            // Insert complete event into database.
            try {
                const createdEvent = await EventsDao.createEvent(completeEvent);
                console.log("createdEvent");
                console.log(createdEvent);
                const updatedStatus = await OrganizersDao.pushEventOrganizer(organizerId, createdEvent._id);
                console.log("updatedStatus");
                console.log(updatedStatus);
                const updatedOrganizer = await OrganizersDao.findOrganizerById(organizerId);
                req.session["currentUser"] = updatedOrganizer;
                const successMessage = `Event ${createdEvent._id} created.`;
                return res.status(201).json({ message: successMessage });
            } catch (error) {
                console.error('Failed to create event: ', error.message);
                return res.status(400).json({ message: 'Failed to create event.' });
            }
        });
    } catch (error) {
        console.error('Failed to create event: ', error.message);
        return res.status(500).json({ message: 'Server error.' });
    } finally {
        await session.endSession();
    }
};
const deleteEvent = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        await session.withTransaction(async () => {
            const eventId = req.params.eventId;
            // Retrieve organizer ID from session.
            const currentUser = req.session["currentUser"];
            const organizerId = currentUser._id;
            try {
                const deleteStatus = await EventsDao.deleteEvent(eventId);
                console.log("deleteStatus");
                console.log(deleteStatus);
                const updateOrganizerStatus = await OrganizersDao.pullEventOrganizer(organizerId, eventId);
                const updatedOrganizer = await OrganizersDao.findOrganizerById(organizerId);
                req.session["currentUser"] = updatedOrganizer;
                console.log("updateOrganizerStatus");
                console.log(updateOrganizerStatus);
                const updateUsersStatus = await UsersDao.pullEventUsers(eventId);
                console.log("updateUsersStatus");
                console.log(updateUsersStatus);
                return res.sendStatus(204);
            } catch (error) {
                console.error('Failed to delete event: ', error.message);
                return res.status(400).json({ message: 'Failed to delete event.' });
            }
        });
    } catch (error) {
        console.error('Failed to delete event: ', error.message);
        return res.status(500).json({ message: 'Server error.' });
    } finally {
        await session.endSession();
    }
};
const updateEvent = async (req, res) => {
    try {
        const eventId = req.params.eventId;
        const updates = req.body;
        const status = await EventsDao.updateEvent(eventId, updates);
        res.json(status);
    } catch (error) {
        console.error('Failed to update event: ', error.message);
        return res.status(500).json({ message: 'Server error.' });
    }
};

export default EventsController;