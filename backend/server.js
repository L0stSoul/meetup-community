import express from 'express';
import path from 'path';
import Logger from './logger';
import fs from 'fs';
import ApiGenerator from './vendor/express-api-generator';
import EventsCtrl from './controllers/events.js';
import DocsCtrl from './controllers/docs.js';

let log;

export default class Server {
  constructor(config) {
    let instance = this.instance = express();
    this.config = config;

    log = new Logger('server');

    instance.use(require('body-parser').json());
    instance.use(require('cookie-parser')(config.salt));

  }

  routes() {
    this.instance.use(express.static(this.config.paths.public));

    let api = new ApiGenerator([EventsCtrl, DocsCtrl], { Logger });

    api.bind(this.instance);
  }

  fallback() {
    this.instance.get('/*', (req, res) => {
      res.sendFile(path.join(this.config.paths.assets, 'index.html'));
    });
  }

  run() {
    return new Promise( (resolve, reject) => {
      this.instance.listen(process.env.PORT || 8080, (err) => {
        if (err) {
          return reject(err);
        }

        log.info('Server running on port ' + this.config.port);
        resolve();
      });
    });
  }
}
