import YAML from "yaml";
import fs from "fs";

export const config = YAML.parse(fs.readFileSync("config.yml", "utf-8"));

export function saveToken(token) {
    config.token = token;
    fs.writeFileSync("config.yml", YAML.stringify(config), {
        encoding: "utf-8",
    });
    console.log("Saved token")
}
