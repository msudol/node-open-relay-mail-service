/* app.js */
'use strict';

// get our config values
var config = require('./config/config.js');

// setup logging
var logger = require('./logger.js');

// import the MailSender Class
var MailSender = require('./mailSender.js');

// import WebServer Class
var WebServer = require('./webServer.js');

// import MailServer class
var MailServer = require('./mailServer.js');

// create a new instance of MailSender 
// MailSender uses http://nodemailer.com/about/ to allow mail sending, it will be shared with WebServer and MailServer as send methods
var mailSender = new MailSender(config);

// Run a webserver if enabled in config.
if (config.webServer.enabled) {
    // create a new instance of WebServer and pass the config and mailSender to it
    // WebServer uses express and router to create a quick and easy web based API
    var ws = new WebServer(config, mailSender);
    // start the new instance of WebServer
    ws.init();
}

// run an SMTP Listen server if enabled in config.
if (config.mailServer.enabled) {
    // create a new instance of MailServer and pass the config and mailSender to it
    // mail server uses http://nodemailer.com/extras/smtp-server to create an SMTP Listen server
    var ms = new MailServer(config, mailSender);
    // start the new instance of MailServer
    ms.init();
}

console.log("Application is running...");