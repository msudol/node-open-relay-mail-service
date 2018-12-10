// authStore.js
// an insecure method for storing users, should create an auth hook and have encrypted auth, ldap, saml, or some more secure system
'use strict';

var AuthStore = {
    
    smtpUser: {
        test: {user: "test", password: "test", allowedTo: ["test@test.local"], allowedFrom: ["test@test.local"]},
        abc: {user: "abc", password: "def"}
    },
    httpToken: {
        ABCDEFH0123456789: { token: "ABCDEFH0123456789",  id: "Meta information to identify the owner or use of this token"}
    }
};

module.exports = AuthStore;