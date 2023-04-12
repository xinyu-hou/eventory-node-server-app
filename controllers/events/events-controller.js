import * as EventsDao from '../../models/events/events-dao.js';

const EventsController = (app) => {
    app.get('/api/eventory/events/', findAllEvents);
    app.get('/api/eventory/events/:eventId', findEventById);
    app.post('/api/eventory/events', createEvent);
    app.delete('/api/eventory/events/:eventId', deleteEvent);
    app.put('/api/eventory/events/:eventId', updateEvent);
};

const findAllEvents = async (req, res) => {
    const events = await EventsDao.findAllEvents();
    res.json(events);
};
const findEventById = async (req, res) => {
    const eventId = req.params.eventId;
    const event = await EventsDao.findOneEvent(eventId);
    res.json(event);
};
const createEvent = async (req, res) => {
    // TODO: Only an organizer can create an event.
    // Retrieve organizer ID from session?
    const event = req.body;
    await EventsDao.createEvent(event)
        .then((insertedEvent) => {
            return res.status(201).json({ message: 'Event created.' });
        })
        .catch((error) => {
            console.error('Failed to create the event: ', error.message);
            return res.status(400).json({ message: 'Failed to create event.' });
        });
};
const deleteEvent = async (req, res) => {
    const eventId = req.params.eventId;
    const status = await EventsDao.deleteEvent(eventId);
    res.json(status);
};
const updateEvent = async (req, res) => {
    const eventId = req.params.eventId;
    const updates = req.body;
    const status = await EventsDao.updateEvent(eventId, updates);
    res.json(status);
};

export default EventsController;