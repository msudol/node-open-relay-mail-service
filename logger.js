const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');
var config = require('./config/config.js');
//TODO: configure running instance log level somewhere?

var transport = new (transports.DailyRotateFile)({
    level: config.logging.level,
    filename: '%DATE%.log',
    dirname: 'logs',
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: false,
    maxSize: '200m',
    maxFiles: '30d'
});

transport.on('rotate', function (oldFilename, newFilename) {
    // notify when log rotates?
});

const logger = createLogger({
    format: format.combine(
        format.splat(),
        format.timestamp(),
        format.json()
    ),
    transports: [
        transport
    ],
    exitOnError: false, // do not exit on handled exceptions
});

module.exports = logger;