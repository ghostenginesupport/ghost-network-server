const WebSocket = require('ws');
const http = require('http');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('Nawa player Ghost Dimension vich aagya!');

    ws.on('message', (data) => {
        // Binary packets nu forward karna (Agar.io/Germs.io protocol)
        // Ithe apan physics te movement control kar sakde haan
        wss.clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    });
});

server.listen(process.env.PORT || 3000, () => {
    console.log('Ghost Server 3000 port te chal reha hai');
});
