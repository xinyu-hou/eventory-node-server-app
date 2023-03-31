import axios from 'axios';
import { config } from 'dotenv';
config();

const ticketmasterAPI = 'https://app.ticketmaster.com/discovery/v2/events.json?';
const ticketmasterAPIKey = process.env.TICKETMASTER_API_KEY;

const TicketmasterController = (app) => {
    app.get('/events', findEventsInMA);
};

const findEventsInMA = (req, res) => {
    const params = {
        apikey: ticketmasterAPIKey,
        stateCode: 'MA',
        size: req.query.size // max size value is 200
        // TODO: Can add more params here to customize the search.
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
                    "date": event.dates.start.localDate,
                    "time": event.dates.start.localTime,
                    "segment": event.classifications[0].segment.name,
                    "genre": event.classifications[0].genre.name,
                    "subgenre": event.classifications[0].subGenre.name,
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
}

export default TicketmasterController;