/* webServer.js 
* 
* Setup express web server to list for calls to a web api for sending mail
* 
*/
"use strict";

var express = require('express');
// instance of express web server
var webApp = express();
var https = require('https');
var http = require('http');
// instance of express router for routes
var router = express.Router();

// get winston logger configured from app.js - just need to require winston.
var logger = require('./logger.js'); 

// get our routes
var MailApi = require('./routes/mailApi');

// yes it's a class for the webserver
class WebServer {
    
    // receives config.webserver
    constructor(config, mailSender) {
        var self = this;
        this.config = config;
        this.webApp = webApp;

        this.router = router; 
        
        // init the api route and give it access to mailSender and config
        this.mailApi = new MailApi(config, mailSender);
        
        // the api route handler 
        this.webApp.use( '/api', [ this.mailApi.handler ] ); 
    }
    
    init() {
        // start the http server
        if (this.config.webServer.enableHttp) {
            this.server = http.createServer(this.webApp).listen(this.config.webServer.httpPort, () => logger.log('info', 'Web Server Listening on port: %s ', this.config.webServer.httpPort)); 
        }
        
        if (this.config.webServer.enableSSL) {

            var opts = {
                key: this.config.webServer.key,
                cert: this.config.webServer.cert
            };
            
            this.SSLserver = https.createServer(opts, this.webApp).listen(this.config.webServer.httpsPort, () => logger.log('info', 'SSL Enabled Web Server Listening on port: %s ', this.config.webServer.httpsPort)); 
        }
    }
    
    stop() {
        // stop the server - could be useful
        if (this.config.webServer.enableHttp) {
            this.server.close();
        }
        if (this.config.webServer.enableSSL) {
            this.SSLserver.close();
        }        
    }
    
}
            
module.exports = WebServer;