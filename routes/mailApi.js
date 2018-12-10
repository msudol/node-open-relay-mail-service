/* api.js 
* 
* A web API to extend the functions of NEDB.  The api functions behave and expect exactly what NEDB does
* 
*/
"use strict";

var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

// get winston logger configured from app.js - just need to require winston.
var logger = require('../logger.js'); 

class MailApi {
    
    constructor(config, mailSender) {
        this.handler = router;  
        this.config = config;
        this.mailSender = mailSender;
        
        // create instance of this as self that can be used within routes
        var self = this;
        
        // middleware that is specific to this router - DONT THINK WE NEED THIS WITH WINSTON LOGGER NOW
        //this.handler.use(function timeLog (req, res, next) {
        //    console.log('Time: ', Date.now());
        //    next();
        //});

        this.handler.use(bodyParser.json());       // to support JSON-encoded bodies
        this.handler.use(bodyParser.urlencoded({     // to support URL-encoded bodies
          extended: true
        }));      
        
        /* GET HANDLING */
        
        // define the home page route
        this.handler.get('/', function (req, res) {
            res.send('API home page');
        });

        // define the about route
        this.handler.get('/about', function (req, res) {
            res.send('About API');
        });  
        
        // enable a test mail api route that can check if things are working
        if (this.config.tests.enableTestMail) {
            this.handler.get('/testmail', function (req, res) {  

                logger.log('info', 'Web API relaying test mail message');
                //console.log("Webserver API test email attempt");
                res.send('Sending test mail');

                // send mail from the test mail config
                self.mailSender.sendMail(self.config.tests.testMail);
            });
        }
        
        this.handler.get('/sendmail/:data', function (req, res) {  
            // handle payload for a get request here.    
            //res.send(req.params.data);
            
            // should probably check for injection
            var data = JSON.parse(req.params.data);
            
            var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
            
            // parse the request and forward on to the transporter
            self.mailCheck(data, ip).then(function(payload) {
                self.mailSender.sendMail(payload);
                res.send("Mail sent!"); 
            }, 
            function(errMsg) {
                res.send("An error occurred: " + errMsg); 
            });     
        });    
        
        /* POST HANDLING */
        this.handler.post('/sendmail', function(req, res) {
            //var name = req.body.name etc
            
            var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
            
            // parse the request and forward on to the transporter  
            self.mailCheck(req.body, ip).then(function(payload) {
                self.mailSender.sendMail(payload);
                res.send("Mail sent!"); 
            }, 
            function(errMsg) {
                res.send("An error occurred: " + errMsg); 
            });            
            
        });         
    }   
    
    mailCheck(data, ip) {
        var payload = {}, mailOkay = true, errMsg = "Missing: ";
        logger.log('info', 'HttpMail send data received: %s', data);
        //console.log("HttpMail send data received: " + data);
        //var requiredKeys = ["from", "to", "subject", "text"]
        
        if (data.from !== undefined) {
            payload.from = data.from;
        } else {
            mailOkay = false;
            errMsg += "from, ";
        }

        if (data.to !== undefined) {
            payload.to = data.to;
        } else {
            mailOkay = false;
            errMsg += "to, ";
        }

        if (data.subject !== undefined) {
            payload.subject = data.subject;
        } else {
            mailOkay = false;
            errMsg += "subject, ";
        }
        
        if (data.text !== undefined) {
            payload.text = data.text + "\n\n This e-mail originated from: " + ip;
        } else {
            mailOkay = false;
            errMsg += "text, ";
        }
        
        if (data.html !== undefined) {
            payload.html = data.html +  "<p> This e-mail originated from: " + ip + "</p>";;
        } 
        
        return new Promise(function(success, error) {
            if (mailOkay) {
                //console.log("Mail is ok: " + mailOkay);
                success(payload);
            } 
            else {
                //console.log("Mail has failed: " + mailOkay);
                error(errMsg); 
            }
        });
        
    }
}

module.exports = MailApi;