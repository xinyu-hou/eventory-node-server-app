import axios from 'axios';
import { config } from 'dotenv';
config();

const ticketmasterAPI = 'https://app.ticketmaster.com/discovery/v2/events.json?';
const ticketmasterAPIBase = 'https://app.ticketmaster.com/discovery/v2/events/';
const ticketmasterAPIKey = process.env.TICKETMASTER_API_KEY;

const TicketmasterController = (app) => {
    app.get('/api/ticketmaster/events', findEventsInMA);
    app.get('/api/ticketmaster/events/:eventId', getTicketmasterEventDetails);
};

const findEventsInMA = async (req, res) => {
    const params = {
        apikey: ticketmasterAPIKey,
        stateCode: 'MA',
        size: req.query.size, // max size value is 200
        keyword: req.query.keyword, // optional keyword parameter
        city: req.query.city, // optional city parameter
    };
    axios.get(ticketmasterAPI, {params})
        .then(response => {
            const events = response.data._embedded.events;
            const eventsNameArray = [];
            events.map(event => {
                let eventItem = {
                    "_id": event.id,
                    "name": event.name,
                    "linkToBuy": event.url,
                    "description": event.info,
                    "date": event.dates.start.localDate,
                    "time": event.dates.start.localTime,
                    "segment": event.classifications[0].segment.name,
                    "genre": event.classifications[0].genre.name,
                    // TODO: subgenre does not work sometimes
                    // "subgenre": event.classifications[0].subGenre.name,
                    "image": event.images[0],
                    "venueName": event._embedded.venues[0].name,
                    "venueCity": event._embedded.venues[0].city.name,
                    "venuePostalCode": event._embedded.venues[0].postalCode,
                    "venueAddress": event._embedded.venues[0].address,
                };
                eventsNameArray.push(eventItem);
            })
            res.json(eventsNameArray);
        })
        .catch(error => {
            console.log(error);
            res.status(500).send('Error retrieving events. Contact developers for help.');
        });
};

const getTicketmasterEventDetails = async (req, res) => {
    const eventId = req.params.eventId;
    const params = {
        apikey: ticketmasterAPIKey,
    };
    const link = `${ticketmasterAPIBase}${eventId}`;
    axios.get(link, {params})
        .then(response => {
            const event = response.data;
            const eventDetails = {
                "_id": event.id,
                "name": event.name,
                "description": event.info,
                "date": event.dates.start.localDate,
                "time": event.dates.start.localTime,
                "segment": event.classifications[0].segment.name,
                "genre": event.classifications[0].genre.name,
                "subgenre": event.classifications[0].subGenre.name,
                "image": event.images[0],
                "venueName": event._embedded.venues[0].name,
                "venueCity": event._embedded.venues[0].city.name,
                "venuePostalCode": event._embedded.venues[0].postalCode,
                "venueAddress": event._embedded.venues[0].address,
            };
            res.json(eventDetails);
        })
        .catch(error => {
            console.log(error);
            res.status(500).send('Error retrieving event details. Contact developers for help.');
        });
};

export default TicketmasterController;