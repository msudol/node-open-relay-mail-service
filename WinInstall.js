// requires a globally installed node-windows on a windows machine with node.js
var Service = require('node-windows').Service;

// get our config values
var config = require('./config/config.js');

// Create a new service object
var svc = new Service({
    name: config.winService.serviceName,
    description: config.winService.description,
    script: config.winService.scriptPath,
    nodeOptions: [
        '--harmony',
        '--max_old_space_size=4096'
    ]
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install', function () {
    svc.start();
    console.log('Install complete.');
    console.log('The service exists: ', svc.exists);
});

svc.install();