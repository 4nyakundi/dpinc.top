// cPanel/Passenger startup file. Build the application before starting it.
process.env.NODE_ENV = 'production';
const http = require('node:http');
const next = require('next');
const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();
app.prepare().then(() => {
  http.createServer((req, res) => handle(req, res)).listen(process.env.PORT || 3000);
}).catch(() => { console.error('Application startup failed. Check the production build and server configuration.'); process.exit(1); });
