import { sendStats } from "./net.js";
import { config, saveToken } from "./config.js";

const socket = new WebSocket("ws://belabox.local");

console.log("Connecting...");

socket.addEventListener("open", (event) => {
    console.log("Connection established");
    if (config.token !== "") {
        socket.send(
            JSON.stringify({
                auth: { token: config.token },
            }),
        );
    } else {
        socket.send(
            JSON.stringify({
                auth: { password: config.password, persistent_token: true },
            }),
        );
    }
});

socket.addEventListener("message", async (event) => {
    const j = JSON.parse(event.data);
    if (j.auth?.success === true) {
        console.log("Logged in. Starting to send messages");
    }
    if (j.auth?.auth_token && config.token === "") {
        saveToken(j.auth.auth_token);
    }
    sendStats(j);
});

setInterval(function () {
    if (socket) {
        socket.send(JSON.stringify({ keepalive: null }));
    }
}, 10000);
