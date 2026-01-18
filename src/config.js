import fs from "fs";

export const config = JSON.parse(fs.readFileSync("config.json", "utf-8"));

export function saveToken(token) {
    config.token = token;
    fs.writeFileSync("config.json", JSON.stringify(config), {
        encoding: "utf-8",
    });
    console.log("Saved token");
}
