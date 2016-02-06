require('./app.less');
require('./blocks/all.less');

import angular from 'angular';
import { Module } from 'angular-decorators';
import RouterConfig from './router-config';
import uiRouter from 'angular-ui-router';
import ngAnimate from 'angular-animate';
import ngBem from 'angular-bem';
import ApiGenerator from './vendor/api-generator';

// pages
import LandingPage from './pages/landing/landing';

Module('app', [
  uiRouter,
  ngAnimate,
  ApiGenerator,
  ngBem,
  LandingPage
])
  .config(['APIProvider', function(APIProvider) {
    APIProvider.debug(CONFIG.env === 'development');
    APIProvider.config(CONFIG.api);
  }])
  .config(RouterConfig)
  .run(['$rootScope', function($rootScope) {
    $rootScope.$config = CONFIG;
  }]);
