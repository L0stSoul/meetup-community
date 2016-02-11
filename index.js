import Bundler from './bundler';
import yargs from 'yargs';
import Config from './config.default.js';
import Server from './backend/server';
import Logger from './backend/logger';

import ApiGenerator from './backend/vendor/express-api-generator';
import EventsCtrl from './backend/controllers/events';

let log = new Logger('main');
let argv = yargs.argv;
let bundler, config, publicConfig, server, api;

switch(argv._[0]) {
  case 'build':
    config = new Config('production');
    publicConfig = new Config('production', true);
    bundler = new Bundler({
      appConfig: config,
      publicAppConfig: publicConfig
    });
    bundler.compile();
    break;
  case 'serve':
    config = new Config('development');
    publicConfig = new Config('development', true);
    api = new ApiGenerator([EventsCtrl], { Logger });
    publicConfig.api = api.routes;
    bundler = new Bundler({
      appConfig: config,
      publicAppConfig: publicConfig
    });

    bundler.serve();

    let nodemon = require('nodemon');

    nodemon({
      exec: './app',
      ignore: [],
      args: ['rundev'],
      watch: ['backend/*', 'universal/*', 'node_modules/*'],
      ext: 'js',
      env: process.env
    }).on('restart', function () {
      log.info('Server files changed. restarting...');
    });

    break;
  case 'rundev':
    config = new Config('development');
    publicConfig = new Config('development', true);
    api = new ApiGenerator([EventsCtrl], { Logger });
    publicConfig.api = api.routes;
    bundler = new Bundler({
      appConfig: config,
      publicAppConfig: publicConfig
    });
    server = new Server(config);

    bundler.bindServer(server);
    break;
  default:
    console.log(`command not found`);
}
