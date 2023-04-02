// add dependencies
const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors"); // good for cors issues/errors with socket.io
const { Server } = require("socket.io");
app.use(cors());

// generates the server
const server = http.createServer(app);

// connects socket.io server
const io = new Server(server, {
	cors: {
		origin: "http://localhost:3000",
		methods: ["GET, POST"] // accepts get and post requests
	}
});

const lobbyList = {};
let name = "";
let lobby = "";

// room stuff
io.sockets.on("connection", (socket) => {
    console.log(`User joined: ${socket.id}`);
    
    socket.on("join_lobby", (data) => {
        name = data.name;
        lobby = data.lobby;
        if (!lobbyList[lobby]) {
            lobbyList[lobby] = {};
            lobbyList[lobby].players = [name];
            lobbyList[lobby].moneyList = [data.money];
            lobbyList[lobby].socketList = [socket.id];
        }
        else {
            lobbyList[lobby].players.push(data.name);
            lobbyList[data.lobby].moneyList.push(data.money);
            lobbyList[data.lobby].socketList.push(socket.id);
        }
        socket.join(lobby);

        socket.nsp.to(lobby).emit("user_joined", {players: lobbyList[lobby].players, money: lobbyList[lobby].moneyList});
		console.log(`User with ID: ${socket.id} joined lobby: ${lobby}`);
	});

    socket.on("leave_room", (data) => {
        console.log(name);
        if (lobbyList[lobby]) {
            lobbyList[data.lobby].players = data.players;
            lobbyList[data.lobby].moneyList = data.money;
            socket.to(data.lobby).emit("user_left", {players: lobbyList[data.lobby].players, money: lobbyList[data.lobby].moneyList}); 
        }
        socket.emit("home_screen");
    });
    

    socket.on("submit_bet", (data) => {
		socket.to(data.bets.lobby).emit("get_update", data);
        console.log(data)
	});

    socket.on("dub", (data) => {
        lobbyList[data.lobby].moneyList = data.moneys;
        socket.to(data.lobby).emit("dub_update", data);
        console.log(data)
    });

    socket.on("disconnect", async () => {
        //var room = Array.from(socket.rooms)[0];
        //var index = lobbyList[room].socketList.indexOf(socket.id);

        //lobbyList[room].socketList.splice((index, 1));
        //lobbyList[room].players.splice((index, 1));
        //lobbyList[room].moneyList.splice((index, 1));

        //socket.to(data.lobby).emit("user_left", {players: lobbyList[data.lobby].players, money: lobbyList[data.lobby].moneyList}); 

        console.log(`User ${socket.id} disconnected`)
    })

});


// runs express server on port 3001 (react on 3000)
server.listen(3001, () => {
	console.log("SERVER RUNNING");
});