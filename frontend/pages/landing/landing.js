import { Inject, Module } from 'angular-decorators';

let page = Module('app.pages.landing', []);

@Inject()
class LandingCtrl {
  constructor() {

  }
}

function RouterConfig($stateProvider) {
  $stateProvider
    .state('landing', {
      url: '/',
      template: require('./landing.html'),
      controller: LandingCtrl,
      title: ''
    });
}

page.config(['$stateProvider', RouterConfig]);

export default page;