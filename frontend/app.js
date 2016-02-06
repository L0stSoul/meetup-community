require('./app.less');

import angular from 'angular';
import { Module } from 'angular-decorators';
import RouterConfig from './router-config';
import uiRouter from 'angular-ui-router';
import ngAnimate from 'angular-animate';
import ApiGenerator from './vendor/api-generator';

Module('app', [
  uiRouter,
  ngAnimate,
  ApiGenerator
])
  .config(['APIProvider', function(APIProvider) {
    APIProvider.debug(CONFIG.env === 'development');
    APIProvider.config(CONFIG.api);
  }])
  .config(RouterConfig);
