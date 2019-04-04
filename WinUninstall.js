// requires a globally installed node-windows on a windows machine with node.js
var Service = require('node-windows').Service;

// get our config values
var config = require('./config/config.js');

// Create a new service object
var svc = new Service({
    name: config.winService.serviceName,
    script: config.winService.scriptPath
});

// Listen for the "uninstall" event so we know when it's done.
svc.on('uninstall', function () {
    console.log('Uninstall complete.');
    console.log('The service exists: ', svc.exists);
});

// Uninstall the service.
svc.uninstall();