// healthcheck.js - Script de vérification de santé pour Docker
const http = require('http');

const options = {
    host: 'localhost',
    port: process.env.PORT || 3010,
    path: '/health',
    timeout: 2000
};

const healthCheck = http.request(options, (res) => {
    console.log('Status Code:', res.statusCode);
    if (res.statusCode === 200) {
        process.exit(0);
    } else {
        process.exit(1);
    }
});

healthCheck.on('error', function (err) {
    console.error('Health check failed:', err.message);
    process.exit(1);
});

healthCheck.end();