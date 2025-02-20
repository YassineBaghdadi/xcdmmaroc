// import io from "./node_modules/socket.io-client/dist/socket.io.js";
import { io } from "socket.io-client";

console.log("hiiiiiiiiiiii");
const socket = io("ws://localhost:1998"); // Connect to your WebSocket server

socket.on("connect", () => {
  console.log("Connected to server");
  alert("socket connected ......");
});

socket.on("newRow", (row) => {
  console.log("New row added:", row);
  // Handle the new row notification as needed (e.g., display an alert)
  alert("New row added: " + JSON.stringify(row));
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
});
