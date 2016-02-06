
angular.module('api.generator', [])
  .provider('API', function() {
    let API = {};
    let routes = {};
    let debug = false;

    this.config = function(_routes) {
      routes = _routes;
    };

    this.debug = function(bool) {
      debug = !!bool;
    };

    this.$get = ['$http', function($http) {
      for (let route of routes) {
        let ctrlName = route.ctrlName;
        let url = route.url;

        if (~route.args.indexOf('id')) {
          url += '/:id';
        }

        if (!API[ctrlName]) {
          API[ctrlName] = {};
        }

        let service = API[ctrlName];

        if (debug) console.debug('endpoint registered', ctrlName + '.' + route.handler + '(' + route.args.join(',') + ') ->', route.method + ':' + url);

        service[route.handler] = function(...args) {
          let url = route.url;
          let data = {};

          if (~route.args.indexOf('id')) {
            url += '/' + args[route.args.indexOf('id')];
          }

          for (arg of route.args ) {
            data[arg] = args[route.args.indexOf(arg)];
          }

          if (debug) console.debug('requested', route.method + ':' + url, data);

          return $http({
            url,
            data,
            method: route.method
          }).then( (response) => {
            let data = response.data;

            if (debug) console.debug('received', route.method + ':' + url, data);

            return data;
          }, (response) => {
            let error = response.data ? response.data.error : 'internal error';

            if (debug) console.error('received', route.method + ':' + url, error);

            throw error;
          });
        };
      }

      return API;
    }];
  });

export default 'api.generator';