import * as EventsDao from '../../models/events/events-dao.js';
import {checkEventIdExists, isCurrentUserCurrentOrganizer, isCurrentUserOrganizer} from "../../utils/utils.js";
import mongoose from "mongoose";
import EventsModel from "../../models/events/events-model.js";
import * as OrganizersDao from "../../models/organizers/organizers_dao.js";
import * as UsersDao from "../../models/users/users-dao.js";

const EventsController = (app) => {
    app.get('/api/eventory/events/', findEvents);
    app.get('/api/eventory/events/city/:city', findEvents);
    app.get('/api/eventory/events/keyword/:keyword', findEvents);
    app.get('/api/eventory/events/city/:city/keyword/:keyword', findEvents);
    app.get('/api/eventory/events/:eventId', checkEventIdExists, findEventById);
    app.post('/api/eventory/events', isCurrentUserOrganizer, createEvent); // Organizer only action
    app.delete('/api/eventory/events/:eventId', checkEventIdExists, isCurrentUserCurrentOrganizer, deleteEvent); // One organizer only action
    app.put('/api/eventory/events/:eventId', checkEventIdExists, isCurrentUserCurrentOrganizer, updateEvent); // One organizer only action
};

const findEvents = async (req, res) => {
    const { city, keyword } = req.params;
    if (city && keyword) {
        // handle findEventsByCityAndKeyword
        // query events with both city and keyword
        // await findEventsByCityAndKeyword();
    } else if (city) {
        // handle findEventsByCity
        // query events with matching city
        await findEventsByCity(city, res);
    } else if (keyword) {
        // handle findEventsByKeyword
        // query events with matching keyword
        // await findEventsByKeyword();
    } else {
        // handle findAllEvents
        // query all events
        await findAllEvents(res);
    };
};
// const findEventsByCityAndKeyword = async (req, res) => {
//     const { city, keyword } = req.params;
//     const events = await EventsDao.findEventsByCityAndKeyword(city, keyword);
//     res.json(events);
// };
const findEventsByCity = async (city, res) => {
    const events = await EventsDao.findEventsByCity(city);
    res.json(events);
};
// const findEventsByKeyword = async (req, res) => {
//     const keyword = req.params.keyword;
//     const events = await EventsDao.findEventsByKeyword(keyword);
//     res.json(events);
// };
const findAllEvents = async (res) => {
    const events = await EventsDao.findAllEvents();
    res.json(events);
};
const findEventById = async (req, res) => {
    try {
        const eventId = req.params.eventId;
        const event = await EventsDao.findOneEvent(eventId);
        const eventTime = event.getDateTimeInTimeZone('America/New York');
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
                res.status(201).json({ message: successMessage });
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
                console.log("updateOrganizerStatus");
                console.log(updateOrganizerStatus);
                const updateUsersStatus = await UsersDao.pullEventUsers(eventId);
                console.log("updateUsersStatus");
                console.log(updateUsersStatus);
                res.status(204);
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