const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');

var transport = new (transports.DailyRotateFile)({
    filename: 'norms-%DATE%.log',
    dirname: 'logs',
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d'
});

transport.on('rotate', function (oldFilename, newFilename) {
    // do something fun
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

//logger.info('Hello World!');

module.exports = logger;