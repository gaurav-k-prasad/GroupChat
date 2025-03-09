const WebSocket = require("ws");
const http = require("http");
const port = 8000 || process.env.PORT;

const server = http.createServer((req, res) => {
	res.write("Started the server");
	res.end();
});

let clients = [];

const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
	console.log("New Client Connected");

	clients.push(ws);

	ws.on("close", () => {
		console.log("Client Disconnected");
		clients = clients.filter((client) => client != ws);
	});

	ws.on("message", (message) => {
		message = JSON.parse(message);
		console.log(message);

		clients.forEach((client) => {
			client.send(JSON.stringify(message));
		});
	});
});

server.listen(port, () => {
	console.log("Server running on port 8080");
});
