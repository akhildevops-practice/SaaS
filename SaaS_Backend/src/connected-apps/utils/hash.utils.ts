const bcrypt = require('bcrypt');
const saltRounds = 10;
const clientSecret = 'ashwini';
const clientId='user1';

bcrypt.genSalt(saltRounds, function(err, salt) {
    bcrypt.hash(clientSecret, salt, function(err, hash) {
       
        return clientSecret;
    });
});