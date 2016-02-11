let Promise = require('bluebird');
let _ = require('lodash');

function getPathByName(ctrl) {
  return _.snakeCase(getControllerName(ctrl));
}

function getParamNames(fn) {
  var funStr = fn.toString();
  return funStr.slice(funStr.indexOf('(') + 1, funStr.indexOf(')')).match(/([^\s,]+)/g);
}

function getControllerName(ctrl) {
  return ctrl.name.replace(/Ctrl$/, '').replace(/Controller$/, '');
}

let moduleName = 'express-api-generator';

let log = {
  info: (...args) => console.log(moduleName + ':', ...args),
  warn: (...args) => console.warn(moduleName + ':', ...args),
  error: (...args) => {
    console.error(moduleName + ':', ...args);
    return moduleName + ': ' + args.map( arg => JSON.stringify(arg) ).join(', ');
  },
  debug: (...args) => console.log(moduleName + ':', ...args)
};

let replaceMap = {
  getAll: 'get',
  get: 'get',
  find: 'search',
  create: 'post',
  delete: 'delete',
  update: 'put'
};

let prefixMap = {
  set: 'put',
  activate: 'put',
  deactivate: 'put',
  delete: 'delete'
};

function getMethodAndPath(name) {
  let path, method, prefixes;

  prefixes = Object.keys(replaceMap);

  for (let prefix of prefixes) {
    if (name === prefix) {
      path = '';
      method = replaceMap[prefix];
    } else if (name.startsWith(prefix)) {
      path = '/' + _.snakeCase(name.replace(prefix, ''));
      method = replaceMap[prefix];
    } else {
      continue;
    }

    return [path, method];
  }

  prefixes = Object.keys(prefixMap);

  for (let prefix of prefixes) {
    if (name.startsWith(prefix)) {
      path = '/' + _.snakeCase(name);
      method = prefixMap[prefix];
      return [path, method];
    }
  }

  return ['/' + _.snakeCase(name), 'post'];
}

class Router {
  constructor(ctrls, defaults = {}) {
    this.defaults = {
      pathPrefix: '/api/',
      method: 'post'
    };
    this.routes = [];
    this.ctrls = ctrls || [];

    if (defaults.Logger) {
      log = new defaults.Logger('express-api-generator');
    }

    Object.assign(this.defaults, defaults);

    this._generateConfig();
  }

  bind(app) {
    this.routes.forEach( route => {
      if (!app[route.method]) {
        throw log.error('method not found', { method: route.method });
      }

      this._logRoute(route);

      route.ctrl.middleware ?
        app[route.method](route.url, route.ctrl.middleware(), (req, res) => this._handleRoute(route, req, res)) :
        app[route.method](route.url, (req, res) => this._handleRoute(route, req, res));
     });
  }

  _handleRoute(route, req, res) {

      let ctrl = new route.ctrl(req, res);
      let args = this._collectArgs(req, route.method, route.args);

        Promise.resolve()
          .then( () => {
            return ctrl[route.handler](...args);
          })
          .catch( error => {
            if (error.stack) {
              res.statusCode(500);
              res.json({ error });
            } else {
              res.statusCode(400);
              res.json({ error });
            }
          })
          .then( answer => {
            res.json(answer);
          });
  }

  _logRoute(route) {
      log.info('route', route.method + ':' + route.url, '->', route.ctrl.name + '.' + route.handler + '(' + route.args.join(',') + ')');
  }

  _generateConfig() {
    let { ctrls, routes, defaults } = this;

    for (let ctrl of ctrls) {
      let path = getPathByName(ctrl);

      if (typeof(ctrl) !== 'function') {
        throw log.error('controller is not a constructor', ctrl);
      }

      let proto = ctrl.prototype;
      let methods = Object.getOwnPropertyNames(proto);

      if (~methods.indexOf('constructor')) {
        methods.splice(methods.indexOf('constructor'), 1);
      }

      methods = methods.filter( method => method.charAt(0) !== '_' );

      if (!methods.length) {
        log.warn('controller doesn\'t have methods', ctrl);
        return;
      }

      methods.forEach( method => {
        let handler = proto[method];
        let route = {
          url: defaults.pathPrefix + path,
          args: getParamNames(handler) || [],
          ctrl: ctrl,
          ctrlName: getControllerName(ctrl),
          handler: method
        };

        let [routePath, routeMethod] = getMethodAndPath(method);

        route.url += routePath;
        route.method = routeMethod;

        if (~route.args.indexOf('id')) {
          route.url += '/:id';
        }

        routes.push(route);
      });
    }
  }

  _collectArgs(req, method, args) {
    return args.map( name => {
      if (name === 'id') {
        return req.params.id;
      }

      return req.query[name] || req.body[name];
    });
  }

  static setLogger(logger) {
    log = logger;
  }

  static setPromise(_Promise) {
    Promise = _Promise;
  }
}

export default Router;
