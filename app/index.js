'use strict';

const config = require('./config')
const redis = require('redis').createClient;
const adapter = require('socket.io-redis');

require('./auth')();

let ioServer = app => {
    app.locals.chatrooms = [];
    const server = require('http').Server(app)
    const io = require('socket.io')(server)
    //force socket io to use websockets only (server side)
    io.set('transports', ['websocket'])
    let pubClient = redis(config.redis.port, config.redis.host, {
        auth_pass: config.redis.password
    });
    let subClient = redis(config.redis.port, config.redis.host, {
        return_buffers: true,
        auth_pass: config.redis.password
    });
    io.use((socket, next) => {
        require('./session')(socket.request, {}, next);
    });

    io.adapter(adapter({
        pubClient,
        subClient
    }))
    require('./socket')(io, app);
    return server
}
module.exports = {
    //This () is placed after reuiqre becoz it will run as a method
    router: require('./routes')(),
    session: require('./session'),
    ioServer,
    logger: require('./logger')
}