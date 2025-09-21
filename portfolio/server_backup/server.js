// Backup copy of server.js (moved out for Netlify static deploy)
// Original contents preserved for reference or restoration.

const fs = require('fs');
fs.writeFileSync(__dirname + '/README.txt', 'This folder contains a backup of the Node server and related files. Restore if you want to run a local server.');
