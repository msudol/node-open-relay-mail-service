// config_default.js
// A Default configuration file which can be more highly configured. Copy to config.js and edit accordingly.
// See more config examples in the examples folder
'use strict';

const fs = require('fs');

// import WebServer Class
var authStore = require('./auth/authStore.js');

var Config = {
    
    // configure the connection to the actual mail server
    // more details http://nodemailer.com/smtp/
    transporter: {
        host: 'outlook.test.local',
        port: 25,
        secure: false, // true for 465, false for other ports
        requireTLS: false
        // uncomment to use user authorization to the SMTP server
        //auth: {
        //    user: account.user, // generated ethereal user
        //    pass: account.pass // generated ethereal password
        //}          
    },
    
    // Webserver configuration
    webServer: {
        enabled: true, // set whether a webserver will run or not
        serverUrl: "localhost",
        enableHttp: true,
        httpPort: 3000,
        enableSSL: true,
        httpsPort: 8443,
        key: fs.readFileSync(__dirname + '/ssl/test.local.key'),  // you will want to update these with your own
        cert: fs.readFileSync(__dirname + '/ssl/test.local.crt')       
    },
    
    // Mailserver configuration - http://nodemailer.com/extras/smtp-server/
    mailServer: {
        enabled: true, // set whether an SMTP Server will run or not
        port: 587, // required        
        secure: false, // optional, defaults to false
        //name: "hostname", // optional, defaults to os.hostname()
        banner: "NORMS (Node Open Relay Mail Service)", // optional
        // size: 5242880 // optional in bytes, this is 5mb
        // many more
        // authOptional: true,
        authMethods: ['PLAIN', 'LOGIN'],
        useAuthStore: "smtpUser", // what hook to use in the authStore
        //disabledCommands: ['AUTH'],  // set this to skip auth entirely
        allowInsecureAuth: true, //optional
        logger: false,
        key: fs.readFileSync(__dirname + '/ssl/test.local.key'),  // you will want to update these with your own
        cert: fs.readFileSync(__dirname + '/ssl/test.local.crt')    
    },
    
    // get auth methods.. eventually make this way better (see auth/authStore.js)
    auth: authStore,
    
    // configure some internal tests, for example testmail
    tests: {
        enableTestMail: true,
        testMail: {
            from: '"Test User 👻" <test.user@test.com>', // sender address
            to: 'test.user@test.com', // command separated list of receivers
            subject: 'Hello ✔', // Subject line
            text: 'We have a mail relay server running! \n\n Cake!', // plain text body
            html: '<p>We have a mail relay server running! </p> <p><b>Cake!</b></p>' // html body           
        }
    },
    
    // Configuration to run as a windows service
    winService: {
        serviceName: "NodeMailRelay",
        description: "Node Mail Relay Service",
        scriptPath: require('path').join(__dirname,'app.js')
    }
};

module.exports = Config;