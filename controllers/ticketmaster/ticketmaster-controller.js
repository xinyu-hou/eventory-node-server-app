import axios from 'axios';
import { config } from 'dotenv';
import {checkTicketmasterEventIdExists} from "../../utils/utils.js";
import * as UsersDao from "../../models/users/users-dao.js";
config();

const ticketmasterAPI = 'https://app.ticketmaster.com/discovery/v2/events.json?';
const ticketmasterAPIBase = 'https://app.ticketmaster.com/discovery/v2/events/';
const ticketmasterAPIKey = process.env.TICKETMASTER_API_KEY;

const TicketmasterController = (app) => {
    app.get('/api/ticketmaster/events', findTicketmasterEventsInMA);
    app.get('/api/ticketmaster/events/:eventId', checkTicketmasterEventIdExists, findTicketmasterEventById);
};

const findTicketmasterEventsInMA = async (req, res) => {
    const params = {
        apikey: ticketmasterAPIKey,
        stateCode: 'MA',
        size: req.query.size, // max size value is 200
        keyword: req.query.keyword, // optional keyword parameter
        city: req.query.city, // optional city parameter
    };
    await axios.get(ticketmasterAPI, {params})
        .then(response => {
            const events = response.data._embedded?.events ?? [] ;
            const eventsNameArray = [];
            events.map(event => {
                let eventItem = constructEventItem(event);
                eventsNameArray.push(eventItem);
            })
            return res.json(eventsNameArray);
        })
        .catch(error => {
            if (error.response && error.response.status === 429) {
                console.error(error.message);
                return res.status(429).json({ message: 'Exceeded Ticketmaster API rate limit. Please wait and try again.' });
            }
            console.error(error);
            return res.status(500).json({ message: 'Error retrieving events. Contact developers for help.' });
        });
};
const findTicketmasterEventById = async (req, res) => {
    const eventId = req.params.eventId;
    const params = {
        apikey: ticketmasterAPIKey,
    };
    const link = `${ticketmasterAPIBase}${eventId}`;
    try {
        const response = await axios.get(link, {params});
        const event = response.data;
        const eventDetails = constructEventItem(event);
        // Add interestedUsers to eventDetails
        const interestedUsers = await UsersDao.findInterestedUsersByTicketmasterEventId(eventDetails._id);
        const eventDetailsWithInterestedUsers = {
            ...eventDetails,
            interestedUsers
        }
        res.json(eventDetailsWithInterestedUsers);
    } catch (error) {
        if (error.response && error.response.status === 429) {
            console.error(error.message);
            return res.status(429).json({ message: 'Exceeded Ticketmaster API rate limit. Please wait and try again.' });
        }
        console.error(error.message);
        return res.status(500).json({ message: 'Error retrieving event details. Contact developers for help.' });
    }
};
const constructEventItem = (event) => {
    const eventDetails = {
        "_id": event.id,
        "name": event.name ?? '',
        "linkToBuy": event.url ?? '',
        "description": event.info ?? '',
        "date": event.dates?.start?.localDate ?? '',
        "time": event.dates?.start?.localTime ?? '',
        "segment": event.classifications[0]?.segment?.name ?? '',
        "genre": event.classifications[0]?.genre?.name ?? '',
        "subgenre": event.classifications[0]?.subGenre?.name ?? '',
        "image": event.images[0]?.url ?? '',
        "venueName": event._embedded?.venues[0]?.name ?? '',
        "venueCity": event._embedded?.venues[0]?.city?.name ?? '',
        "venuePostalCode": event._embedded?.venues[0]?.postalCode ?? '',
        "venueAddress": event._embedded?.venues[0]?.address?.line1 ?? '',
    };
    return eventDetails;
};

export default TicketmasterController;