import { serverUrl } from "../serverinfo";

// SOCKET CLIENT
import socketclient from "socket.io-client";

console.log(serverUrl);

// SOCKET CLIENTS
export const socket = socketclient(serverUrl);
