import { config, saveToken } from "./config.js";

import { WebSocket } from "ws";
import os from "os";

let belaboxSocket;
let senderSocket;

let networksCount = 0;

console.log("Connecting...");

function checkNetworkAvailability() {
    const interfaces = os.networkInterfaces();
    const interfacesKeys = Object.keys(interfaces);

    if (networksCount === 0) {
        interfacesKeys.forEach((network) => {
            if (interfaces[network][0].internal === false)
                console.log(
                    `${network}: ${JSON.stringify(interfaces[network][0], undefined, 1)}`,
                );
        });
        networksCount = interfacesKeys.length;
        return;
    }

    if (interfacesKeys.length !== networksCount) {
        if (senderSocket instanceof WebSocket) {
            console.log(
                "networks changed. Reconnecting to the receiver WebSocket...",
            );
            senderSocket.removeAllListeners();
            senderSocket.close();
            setTimeout(connectSender, 1000);
        }
    }

    networksCount = interfacesKeys.length;
}

checkNetworkAvailability();
setInterval(checkNetworkAvailability, 3000);

function connectSender() {
    connect();
    function connect() {
        senderSocket = new WebSocket(config.url);

        senderSocket.on("open", () => {
            console.log(`Connected to the receiver WebSocket: ${config.url}`);

            if (
                !(
                    belaboxSocket &&
                    belaboxSocket.readyState === belaboxSocket.OPEN
                )
            ) {
                connectBelabox();
            }
        });

        senderSocket.on("close", (code, reason) => {
            console.log(
                `senderSocket is closed. reason: ${reason.toString("utf-8")}. Reconnecting...`,
            );
            senderSocket = undefined;
            setTimeout(connectSender, 1000);
        });

        senderSocket.on("error", (err) => {
            console.log(`Sender socket error: ${err.message}`);
        });
    }
}

async function handleBelabox(data) {
    const j = JSON.parse(data);

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

    senderSocket.send(data, (err) => {
        if (err) console.log(`senderSocket: ${err}`);
    });

    // if (senderSocket.readyState === senderSocket.OPEN) {
    //     senderSocket.send(data, (err) => {
    //         if (err) console.log(`Error: ${err}`);
    //     });
    // } else {
    //     console.log("senderSocket is closed");
    //     //setTimeout(connectSender, 1000);
    // }
}

function connectBelabox() {
    connect();

    function connect() {
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
                        auth: {
                            password: config.password,
                            persistent_token: true,
                        },
                    }),
                );
            }
        });

        belaboxSocket.on("message", handleBelabox);

        belaboxSocket.on("error", (err) => {
            console.log(`BELABOX socket error: ${err}`);
        });

        belaboxSocket.on("close", () => {
            console.log("belaboxSocket is closed. Reconnecting...");
            belaboxSocket = undefined;

            setTimeout(connectBelabox, 1000);
        });
    }
}

connectSender();

setInterval(function () {
    if (belaboxSocket && belaboxSocket.readyState === belaboxSocket.OPEN) {
        belaboxSocket.send(JSON.stringify({ keepalive: null }));
    }
}, 10000);
