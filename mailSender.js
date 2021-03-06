// Module will implement NodeMailer to send the final payload ("mailOptions) to the configured mail server.
'use strict';

// require the node mailer module.
const nodemailer = require('nodemailer');

// get winston logger configured from app.js - just need to require winston.
var logger = require('./logger.js'); 

class MailSender {
    
    // receives config.transporter
    constructor(config) {
        
        var self = this;
        
        this.nodemailer = nodemailer;
        
        this.nodemailer.createTestAccount((err, account) => {
            // not sure what this does
        });
        
        // creates a transporter from the config options
        this.transporter = this.nodemailer.createTransport(config.transporter);
        
        // verify connection configuration
        this.transporter.verify(function(error, success) {
            
            if (error) {
                logger.log('error', 'Transporter verify failed.');
                logger.log('error', error);
                return;
            } 
                
            logger.log('info', 'Remote Mail Server is ready to take our messages');
            logger.log('debug', success);
            
        });
    }
    
    // sendmail function for the MailSender class is basically a transporter.sendMail wrapper
    // we assume that the relaying server web/smtp has put together mailOptions properly
    sendMail(mailOptions) {
        
        this.transporter.sendMail(mailOptions, (error, info) => {
            
            if (error) {
                logger.log('error', 'Transporter sendMail failed.');
                logger.log('error', error);
                return;
            }
            
            //TODO: file log sent message info (for admin review)
            logger.log('info', 'Message sent: %s', info.messageId);
            logger.log('debug', info);
            
        });
    }
    
}

module.exports = MailSender;