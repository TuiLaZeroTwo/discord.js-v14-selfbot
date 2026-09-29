'use strict';

const noop = () => {}; // eslint-disable-line no-empty-function
const methods = ['get', 'post', 'delete', 'patch', 'put'];
const reflectors = [
  'toString',
  'valueOf',
  'inspect',
  'constructor',
  Symbol.toPrimitive,
  Symbol.for('nodejs.util.inspect.custom'),
];

function buildRoute(manager) {
  const route = [''];
  const handler = {
    get(target, name) {
      if (reflectors.includes(name)) return () => route.join('/');
      if (methods.includes(name)) {
        const routeBucket = [];
        let majorParameter = 'global';
        if (route[1] === 'interactions' && route[4] === 'callback') {
          majorParameter = 'burst';
        } else if (/^\d{16,19}$/.test(route[2]) && ['channels', 'guilds'].includes(route[1])) {
          majorParameter = route[2];
        } else if (/^\d{16,19}$/.test(route[2]) && route[1] === 'webhooks') {
          majorParameter = `${route[2]}/${route[3]}`;
        }

        for (let i = 0; i < route.length; i++) {
          if (/^\d{16,19}$/.test(route[i])) {
            routeBucket.push(':id');
          } else if (route[1] === 'webhooks' && i === 3) {
            routeBucket.push(':token');
          } else if (route[i - 1] === 'reactions') {
            routeBucket.push(':reaction');
            break;
          } else {
            routeBucket.push(route[i]);
          }
        }
        return options =>
          manager.request(
            name,
            route.join('/'),
            Object.assign(
              {
                versioned: manager.versioned,
                route: routeBucket.join('/'),
                majorParameter,
              },
              options,
            ),
          );
      }
      route.push(name);
      return new Proxy(noop, handler);
    },
    apply(target, _, args) {
      route.push(...args.filter(x => x != null)); // eslint-disable-line eqeqeq
      return new Proxy(noop, handler);
    },
  };
  return new Proxy(noop, handler);
}

module.exports = buildRoute;
