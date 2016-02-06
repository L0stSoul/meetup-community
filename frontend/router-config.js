import { Inject } from 'angular-decorators';
import LandingCtrl from './pages/landing/landing.js';

function RouterConfig($stateProvider, $urlRouterProvider, $locationProvider) {
  $locationProvider.html5Mode(true);

  $urlRouterProvider.otherwise('/');
}

export default ['$stateProvider', '$urlRouterProvider', '$locationProvider', RouterConfig];