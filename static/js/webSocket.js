
const loc = "ws://localhost:8080/api/data-route";

export const socket = new WebSocket(loc);
export const socketChat = new WebSocket("ws://localhost:8080/api/chat");