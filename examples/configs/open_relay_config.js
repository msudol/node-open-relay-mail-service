// example: open_relay_config.js

/* 

This example configuration creates a completely open relay with no authentication. Anyone can 
relay mail off of this setup with any from/to address. 

The SMTP listener will accept any inbound connections to port 587 and relay them to the transporter.

The HTTP API listener is disabled. If enabled, it will not require a token or authentication and 
relay messages to the transporter.

The transporter connects to an SMTP server that also does not require authorization, which means
it too is an open relay.

This scenario is highly unlikely, and highly insecure. It should only be deployed in a closed 
network environment as it would be extremely susceptible to SPAM.

*/

'use strict';

const fs = require('fs');

var Config = {
    
    // configure the connection to the actual sending mail server
    // more details http://nodemailer.com/smtp/
    transporter: {
        host: 'some.smtpserver.com',
        port: 25,
        secure: false, // true for 465, false for other ports
        requireTLS: false
    },
    // Webserver configuration
    webServer: {
        enabled: false, // set whether a webserver will run or not
        serverUrl: "localhost",
        port: 3000
    },
    // Mailserver configuration - http://nodemailer.com/extras/smtp-server/
    mailServer: {
        enabled: true, // set whether an SMTP Server will run or not
        port: 587, // required        
        secure: false, // optional, defaults to false
        name: "OpenRelayServer", // optional, defaults to os.hostname()
        banner: "Welcome to an open relay mail service", // optional
        disabledCommands: ['AUTH'], // this is the option that disabled auth completely
        logger: true
    },
    // Configuration to run as a windows service
    winService: {
        serviceName: "NodeMailRelay",
        description: "Node Mail Relay Service",
        scriptPath: require('path').join(__dirname,'app.js')
    }    
};
    
module.exports = Config;