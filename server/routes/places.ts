import { Router, Response, Request } from 'express';
var https = require('https');

const placesRouter: Router = Router();

placesRouter.get('/:id', (request: Request, response: Response) => {
    const placeid = request.params.id;

    const requestUrl = "https://maps.googleapis.com/maps/api/place/details/json?placeid=" + placeid
        + "&key=AIzaSyAUwAHbIiy2wWRvKHjz2MAFuPP6C3tVPWw";
    https.get(requestUrl, (res) => {
        // Continuously update stream with data
        var body = '';
        res.on('data', function (d) {
            body += d;
        });
        res.on('end', function () {

            // Data reception is done, do whatever with it!
            var parsed = JSON.parse(body);
            response.json(parsed);

        });

    });
});

export { placesRouter }