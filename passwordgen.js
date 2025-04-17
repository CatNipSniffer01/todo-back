const bcrpyt = require('bcrypt');
bcrpyt.hash('',10).then(console.log)
// within hash('',10) => '' is where we put the password to encrypt, 10 is the amount of salt