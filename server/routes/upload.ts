import { Router, Response, Request } from 'express';
  var multer = require('multer');
  var fs = require('fs')

const uploadRouter: Router = Router();
  var DIR = './uploads/';

uploadRouter.post('/', multer({ dest: "./uploads/" }).single("uploads"), (request: Request, response: Response) => {
      if (request['file'].originalname.endsWith('.json')) {
        fs.readFile(request['file'].path, 'utf8', function (err, data) {
          if (err) {
            response.status(500).send('Upload failed');
          }
          response.status(200).json(data);
        });
      } else {
        response.status(500).send('Upload must be json file');
      }
});

export { uploadRouter }