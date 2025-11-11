// load .env config
require('dotenv').config({ 
    path: require('path').resolve(__dirname, '..', '.env') 
});

// load db_type to choose which repo to use
const REPO_TYPE = process.env.DB_TYPE || 'filesystem';

let repo;

if (REPO_TYPE === 'mariaDb') {
    console.log('Loading mariaDb data source at runtime');
    repo = require('./mariaDbRepository.js');
} else {
    console.log('Loading filesystem as data source at runtime');
    repo = require('./filesystemRepository.js');
}

module.exports = repo;