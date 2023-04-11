import * as EventsDao from '../../models/events/events-dao.js';

const EventsController = (app) => {
    app.get('/api/events/', findAllEvents);
    app.get('/api/events/:eventId', findEventById);
    app.post('/api/events', createEvent);
    app.delete('/api/events/:eventId', deleteEvent);
    app.put('/api/events/:eventId', updateEvent);
}

const findAllEvents = async (req, res) => {
    // TODO
};
const findEventById = async (req, res) => {
    // TODO
};
const createEvent = async (req, res) => {
    // TODO
};
const deleteEvent = async (req, res) => {
    // TODO
};
const updateEvent = async (req, res) => {
    // TODO
};

export default EventsController;