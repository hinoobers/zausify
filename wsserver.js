const websocket = require("ws");

const wss = new websocket.Server({port: 3001});
const clients = [];
wss.on("connection", (ws) => {
    clients.push(ws);

    ws.on("close", () => {
        clients.splice(clients.indexOf(ws), 1);
    });
});

module.exports = {
    broadcast: (message) => {
        clients.forEach(client => {
            client.send(message);
        });
    }
}
