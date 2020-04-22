// module will invoke an SMTP Listener to relay incoming SMTP messages 

const tls = require('tls');
const fs = require('fs');

// require smtp-server
const SMTPServer = require('smtp-server').SMTPServer;

// use the mailparser simpleparser to parse the message for sending
const simpleParser = require('mailparser').simpleParser;

// get winston logger configured from app.js - just need to require winston.
var logger = require('./logger.js'); 

class MailServer {
    
    // construct the class
    constructor(config, mailSender) {
        
        this.config = config;
        this.mailSender = mailSender;
        var self = this;
        
        // functional items for the mail server
        this.opts = {
             
            // when the initial connection begins
            onConnect(session, callback) {
                logger.log('info', 'Connection start from %s', session.remoteAddress);
                //if (session.remoteAddress === '127.0.0.1') {
                //    return callback(new Error('No connections from localhost allowed'));
                //}
                return callback(); // Accept the connection
            },

            // if the client issues auth - server default is to ignore auth
            onAuth(auth, session, callback) { 

                //TODO: we really need to consider some better authentication methods here

                // this will grab an object of users from the assigned store for now
                var users = self.config.auth[self.config.mailServer.useAuthStore];

                // user doesn't exist
                if (users[auth.username] === undefined) {
                    logger.log('warn', 'Invalid login attempt user: %s', auth.username);
                    return callback(new Error('Invalid username or password')); 
                }
                
                // password is wrong
                if (auth.password !== users[auth.username]["password"]) {
                    logger.log('warn', 'Invalid login attempt user: %s', auth.username);
                    return callback(new Error('Invalid username or password'));
                }

                // if authentication passes we callback null, and continue along
                logger.log('info', 'Authenticating user: %s ', auth.username);
                callback(null, {user: auth.username}); 
            },

            // check mail from
            onMailFrom(address, session, callback) {
                
                var users = self.config.auth[self.config.mailServer.useAuthStore];
                
                var mailFrom = address;
                
				// check if user is defined at all 
				if (users !== undefined) {
					// assumes no setting means user is allow to send to any
					if (users[session.user].allowedFrom !== undefined) {
						//TODO: possible wildcard addresses?
						if (!users[session.user].allowedFrom.includes(mailFrom.address)) {
							logger.log('warn', 'Invalid from address: %s', mailFrom.address);
							return callback(new Error('Not allowed to send from address: ' + mailFrom.address));
						}
					}  
				}				
                
                return callback();  // accept mailfrom
            },
            
            // check mail to. This is where receipient filtering occurs, not parsemessage
            onRcptTo(address, session, callback) {
                
                var users = self.config.auth[self.config.mailServer.useAuthStore];
                
                var mailTo = address;
				// check if user is defined at all 
				if (users !== undefined) {
					// assumes no entry means send to any
					if (users[session.user].allowedTo !== undefined) {
						// may not need to loop here
						//TODO: possible wildcard addresses?
						for (var i = 0; i < mailTo.length; i++) {
							if (!users[session.user].allowedTo.includes(mailTo[i].address)) {
								logger.log('warn', 'Invalid to address: %s', mailFrom.address);
								 return callback(new Error('Not allowed to send to address: '));
							}
						}                 
					} 
				}
                
                return callback(); // accept rcptTo
            },
            
            // when the data stream is received
            onData(stream, session, callback) {

                simpleParser(stream)
                .then(parsed => {
                    // should probably have parsemessage run a callback with success, err as well... for now just forward to the transporter
                    self.forwardMessage(self.parseMessage(parsed, session));
                })
                .catch(err => {
                    logger.log('error', err);
                });

                stream.on('end', callback);
            },
    
            // when the connection gets closed
            onClose(session) {
                logger.log('info', 'SMTP Connection closed from %s', session.remoteAddress);
            }
        };
        
        // merge opts and config together for the server instance - this is a shallow merge, but there should be no conflicts
        const options = Object.assign(this.config.mailServer, this.opts);
        
        // create instance of ms "mail server"
        this.ms = new SMTPServer(options);
        
        // log errors t
        this.ms.on('error', function(err) {
           logger.log('error', 'Error %s', err.message); 
        });
 
    }

    // start the server 
    init() {
        this.ms.listen(this.config.mailServer.port, () => logger.log('info', 'Mail Server Listening on port: %s ', this.config.mailServer.port));   
    }
    
    // relay a message to mailSender aka transporter
    forwardMessage(mailOptions) {
        //console.log("Forwarding message received via SMTP");
        this.mailSender.sendMail(mailOptions);
    }
    
    // parse a mail object message and prepare it for use in nodemailer
    parseMessage(parsed, session) { 
        
        //TODO: need error checking - if we're missing values need to reject the request now.
        
        logger.log('debug', parsed);
        
        var from = '"'+parsed.from.value[0].name+'" <'+parsed.from.value[0].address+'>';
        
        
        if (parsed.to.value.length > 0) {
            var rcptto = [];
            for (var i = 0; i < parsed.to.value.length; i++) {
                rcptto.push(parsed.to.value[i].address);
            }
            var to = rcptto.toString();
        } else {    
            var to = parsed.to.value[0].address;
        }

        // Add in an identifier to tell where this emailed from (enable/disable in config)
        var remoteAddress = session.remoteAddress;
        var parText = parsed.text + "\n\n This e-mail originated from: " + remoteAddress;
        var parHtml = parsed.html + "<p> This e-mail originated from: " + remoteAddress + "</p>";
        
		var attachments = parsed.attachments; 
		
        // construct an object that we'll forward to the transporter
        var mailOptions = {
            from: from,
            to: to,
            subject: parsed.subject,
            text: parText,
            html: parHtml,
			attachments: attachments
        };
        
        // should just return mailOptions to the calling function instead
        logger.log('debug', 'Logging Parser mailoptions: ');
        logger.log('debug', mailOptions);
        
        return mailOptions;
    }
}

module.exports = MailServer;