import { config, saveToken } from "./config.js";

import { WebSocket } from "ws";

let belaboxSocket;
const senderSocket = new WebSocket(config.url);

console.log("Connecting...");

senderSocket.on("open", () => {
    console.log(`Connected to the receiver WebSocket: ${config.url}`);
    console.log("Connecting to ws://belabox.local...");
    belaboxSocket = new WebSocket("ws://belabox.local");

    belaboxSocket.on("open", () => {
        console.log("Connected to ws://belabox.local");
        if (config.token !== "") {
            belaboxSocket.send(
                JSON.stringify({
                    auth: { token: config.token },
                }),
            );
        } else {
            belaboxSocket.send(
                JSON.stringify({
                    auth: { password: config.password, persistent_token: true },
                }),
            );
        }
    });

    belaboxSocket.on("error", (err) => {
        console.log(`BB socket error: ${err.message}`);
        process.exit(0);
    });

    belaboxSocket.addEventListener("message", async (event) => {
        const j = JSON.parse(event.data);

        // node v12 type beat
        if (
            j.notification &&
            j.notification.show &&
            j.notification.show[0] &&
            j.notification.show[0].msg === "Invalid password"
        ) {
            console.log(
                "Invalid password. Make sure to set the right password in config.json",
            );
            return;
        }
        if (j.auth && j.auth.success === true) {
            console.log("Logged in. Starting to send messages");
            return;
        }
        if (j.auth && j.auth.auth_token && config.token === "") {
            saveToken(j.auth.auth_token);
            return;
        }

        if (senderSocket.readyState === senderSocket.OPEN) {
            senderSocket.send(event.data, (err) => {
                if (err) console.log(`Error: ${err}`);
            });
        } else {
            console.log("senderSocket is closed. exiting...");
            process.exit(0);
        }
    });

    belaboxSocket.on("close", () => {
        console.log("BELABOX socket closed. Exiting...");
        process.exit(0);
    });
});

senderSocket.on("close", (code, reason) => {
    console.log(
        `senderSocket is closed. reason: ${reason.toString("utf-8")}. exiting...`,
    );
    process.exit(0);
});

senderSocket.on("error", (err) => {
    console.log(`Sender socket error: ${err.message}`);
    process.exit(0);
});

setInterval(function () {
    if (belaboxSocket.readyState === belaboxSocket.OPEN) {
        belaboxSocket.send(JSON.stringify({ keepalive: null }));
    }
}, 10000);
