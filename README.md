# Node Open Relay Mail Service (NORMS)

This service will listen for incoming emails via multiple sources (HTTP API, SMTP) and then relay the incoming mail through another email server or service through the configured "transporter".

## Purpose

The primary use for this system is to create a centralized open mail relay with some controls, within a domain environment with hosted exchange, in which various software and devices need to be able to send e-mails in which creating authentication accounts or whitelisting is untenable for some reason.

The exchange exception can instead be granted to NORMS (by IP or User Account) which will act as the relay for endpoints that need to send mail.

## Terminology & Modules
* Transporter - This is the handler for the outbound e-mails. The transporter can be configured to send e-mail through an exchange server, or gmail, or any other SMTP e-mail service.
* MailServer - This is the handler for listening to inbound e-mails using SMTP. The mail server will accept these mails, and then forward them via the Transporter.
* WebServer - This is the handler for listening to HTTP API requests, to generate an e-mail. The email will be generated and then forwarded via the Transporter.

## Installation & Running

Clone the git repository and then from a node.js enabled command line prompt run: npm install

After the project is installed, at the commmand prompt run: node app

### Persistence 

In order to maintain service persistence, run the app with a process manager like PM2.

If on windows, an experimental windows service is also in the works.

### Windows Service

In development, could install as a service using node-windows, by running node Wininstall.js.  (Beta)

## Configuration

Copy the config.default.js to config.js and edit accordingly.

## Environments

The goal is to create a truly flexible mail proxy that can receive email from web api and from SMTP traffic, and then re-route that mail to a destination mail server like hosted Exchange or Gmail. This should ultimately be done in a closed environment. Internet access to NORMS may prove a SPAM liability.

## SMTP Relay Testing

Ways to generate an SMTP e-mail and send it through the NORMS relay to a receiving server via the transporter.

### Powershell 
'credentials' are entered using powershell $credentials command

Send-MailMessage -To someuser@somemail.com -From 'Test <test@test.com>' -Subject 'hi' -Body 'testing' -BodyAsHtml -SmtpServer 127.0.0.1 -Port 587 -Credential $mycredentials

### Python

coming soon.

## Web API Relay Testing

In development