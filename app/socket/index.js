'use strict';
const h = require('../helper')

module.exports = (io, app) => {
    let allRooms = app.locals.chatrooms

    io.of('roomslist').on('connection', socket => {
        socket.on('getChatrooms', () => {
            socket.emit('chatRoomsList', JSON.stringify(allRooms));
        });

        socket.on('createNewRoom', newRoomInput => {
            //console.log("new room input = ", newRoomInput);
            
            if(!h.findRoomByName(allRooms, newRoomInput)) {
                //create a new room and broadcast to all
                allRooms.push({
                    room: newRoomInput,
                    roomID: h.randomHex(),
                    users: []
                });
                //emit the updated list to the creator
                socket.emit('chatRoomsList', JSON.stringify(allRooms));
                //emit the udpated list to all who are connected to rooms page
                socket.broadcast.emit('chatRoomsList', JSON.stringify(allRooms));
            }
        })
    });

    io.of('/chatter').on('connection', socket => {
        socket.on('join', data => {
            let usersList = h.addUserToRoom(allRooms, data, socket);
            //console.log(usersList);
            
            socket.broadcast.to(data.roomID).emit('updateUsersList', JSON.stringify(usersList.users));
            //show the list to the newly joined user of the chatroom
            socket.emit('updateUsersList', JSON.stringify(usersList.users))
            
        });
        //When a scoket exists
        socket.on('disconnect', () => {
            let room = h.removeUserFromRoom(allRooms, socket);
            socket.broadcast.to(room.roomID).emit('updateUsersList', JSON.stringify(room.users))
        });

        socket.on('newMessage', data => {
            socket.to(data.roomID).emit('inMessage', JSON.stringify(data))
        })
    });

}