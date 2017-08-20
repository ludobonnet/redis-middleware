'use strict';

const redis = require('redis');

exports = module.exports = function redisMiddleware () {

    let client = redis.createClient(arguments);

    client.on('error', err => {
        console.log('Error ' + err);
    });

    let db = (req, res, next) => {

        if (db.connect) {
            req.redis = client;
            next();
        } else {
            client.on('ready', () => {
                req.redis = client;
                next();
            });
        }
    };

    db.redis = client;

    db.connect = next => {
        if (client && client.connected) {
            client.once('end', function () {
                client = redis.createClient(arguments);
                next();
            });

            client.quit();
        } else {
            client = redis.createClient(arguments);
            next();
        }
    };

    db.disconnect = next => {
        if (client) {
            client.once('end', () => {
                client = null;
                next();
            });

            client.quit();
        } else {
            next();
        }
    };

    return db;
}
