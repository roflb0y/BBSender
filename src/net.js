import axios from "axios";
import { config } from "./config.js";

export async function sendStats(data) {
    try {
        await axios.post(config.url, data, {
            timeout: 1000,
        });
        return true;
    } catch (e) {
        console.log(e.code)
        return false;
    }
}
