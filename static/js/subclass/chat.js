import { requestChat } from "../datahandler.js"
export default class Chat {
    constructor(element, socket, receive) {
        this.element = element;
        this.socket = socket;
        this.receive = receive;
        this.activeUserName = document.querySelector("#activeUserName").textContent;
        this.chatHeader()
        this.index = 10
    }
    messageToArr(message) {
        let arr = [];
        for (let i = 0; i < message.length; i++) {
            arr.push(message[i]);
        }
        return arr;
    }
    async chatHeader() {
        let payload = {
            sender: document.getElementById("activeUserName").textContent,
            receiver:  this.receive,
            content: "",
            type: "getMessages",
            time: new Date().toLocaleString(),
        };;
        let dataMessage = JSON.parse(await requestChat(this.socket, payload))
        this.datamessage = {
            "receive": dataMessage.messages.receive,
            "send": dataMessage.messages.send,
        }
        this.element.appendChild(this.findChatBox(this.receive));
        this.updatedChatBox()
        const messageInput = document.querySelector("#message-input");
        const sendTypingMessage = async() => {
            const payload = {
                sender: document.getElementById("activeUserName").textContent,
                receiver: document.getElementById("receiverName").textContent,
                content: "typing",
                type: "typing",
                time: new Date().toLocaleString(),
            };
            this.socket.send(JSON.stringify(payload));
        };
        let throttleValue = false;
        messageInput.addEventListener("keydown", async(event) => {
            if (event.key === "Enter" && messageInput.value !== "") {
                const message = messageInput.value;
                messageInput.value = "";
                const payload = {
                    sender: document.getElementById("activeUserName").textContent,
                    receiver: document.getElementById("receiverName").textContent,
                    content: message,
                    type: "message",
                    time: new Date().toLocaleString(),
                };
                this.socket.send(JSON.stringify(payload));
            } else {
                const throttle = (sendTypingMessage, time) => {
                    if (throttleValue) return;
                    throttleValue = true;
                    setTimeout(() => {
                        sendTypingMessage();
                        throttleValue = false;
                    }, time);
                };
                throttle(sendTypingMessage, 500);
            }
        });

        this.socket.onmessage = async(event) => {
            let value = await JSON.parse(event.data)
            if (value.type !== "typing") {
                this.updatedChatBox(value);
            } else if (value.type == "typing" && value.receiver == this.activeUserName) {
                setTypingMessage()
            }

        };
        // scroll event that add old 10 message to chat box
        const messageList = document.getElementById("message-list");
        messageList.addEventListener('scroll', fthrottle((event) => {
            if (messageList.scrollTop < 2) {
                this.index += 10
                if (this.index > this.withReceiver.length) {
                    this.index = this.withReceiver.length
                }
                this.addOldMessage()
                if (this.index !== this.withReceiver.length) {
                    messageList.scrollTop = 450
                }
            }
        }, 500));

    }
    findChatBox(receiver) {
        const regex = /(chatWith)_(\w+)/;

        const match = receiver.match(regex);
        // const chatWith = match[1]; // "chatWith"
        const id = match[2]; // "testUser7"

        let container = document.createElement("div");
        container.id = "bChatBox";
        container.className = "bChatBox";
        container.innerHTML = `
              <div class="cReceiverName"><span id="receiverName">${id}</span><span id="typeEvent"></span></div>
              <div id="message-list"class="cArea"> </div>
              <div class="cInput">
              <input type="text" id="message-input" placeholder="Type your message here">
              </div>
              `
        return container;
    }
    async updatedChat(receiver) {
        let index = 0;
        let messages = [];
        if (this.message) {
            if (this.message.sender == this.activeUserName)
                if (this.datamessage.send) {
                    this.datamessage.send =
                        this.datamessage.send.concat(this.message);
                } else {
                    this.datamessage.send = [this.message];
                }
            else if (this.message.receiver == this.activeUserName)
                if (this.datamessage.receive) {
                    this.datamessage.receive =
                        this.datamessage.receive.concat(
                            this.message
                        );
                } else {
                    this.datamessage.receive = [this.message];
                }
        }
        // Combine send and receive messages into a single array
        if (this.datamessage.send) {
            messages = messages.concat(this.datamessage.send);
        }
        if (this.datamessage.receive) {
            messages = messages.concat(this.datamessage.receive);
        }

        // Sort messages by time
        messages.sort((a, b) => new Date(a.time) - new Date(b.time));
        this.withReceiver = [];
        messages.forEach((message) => {
            if (((message.sender == this.activeUserName && message.receiver == receiver) ||
                    (message.receiver == this.activeUserName && message.sender == receiver))) {
                // add message to withReceiver
                this.withReceiver.push(message)
            }
        });
        this.updateSeenMessage(this.withReceiver);
    }

    async printChat(receiver) {

        let chat = "";
        // slice this.withReceiver like [[message],[message],[message]...] 
        // and print the last 10 messages
        this.withReceiver.slice(-this.index).forEach((message) => {
            if (receiver == null) {
                if (((message.sender == this.activeUserName && message.receiver == receiver) ||
                        (message.receiver == this.activeUserName && message.sender == receiver)) &&
                    message.content.length > 39
                ) {
                    for (
                        let i = 0; i < message.content.length; i += 40
                    ) {
                        message.content =
                            message.content.slice(0, i) +
                            "\n" +
                            message.content.slice(i);
                    }
                }
            }
            if (
                message.sender == this.activeUserName &&
                message.receiver == receiver
            ) {
                chat += `
                            <div class="messageBox" style="justify-items: end;">
                            <div class="mInfo" style="float:right;"><b>Me:</b> ${message.time}</div>
                            <div class=" message"><span>${message.content}</span></div>
                            </div>
                  `;
            } else if (
                message.receiver == this.activeUserName &&
                message.sender == receiver
            ) {
                chat += `
                            <div class="messageBox" style="justify-items: start;">
                            <div class="mInfo" style="float:left; "><b>${message.sender}:</b> ${message.time}</div>
                            <div class=" message"><span>${message.content}</span></div>
                            </div>`;
            }
        });
        return chat;
    }

    // updatedChatBox return updated chatbox
    async updatedChatBox(message) {
            if (
                this.activeUserName != null &&
                this.activeUserName !== "guest"
            ) {
                if (message != undefined) {
                    this.index = 10
                    this.message = message;
                    let parent =
                        document.getElementById("message-list");
                    let children =
                        document.querySelectorAll(".message");
                    if (children.length > 0) {
                        children.forEach((child) => child.remove());
                    }
                    if (
                        this.message.sender ==
                        this.activeUserName ||
                        this.message.receiver ==
                        this.activeUserName
                    ) {
                        await this.updatedChat(document.getElementById("receiverName").textContent);
                        parent.innerHTML = await this.printChat(document.getElementById("receiverName").textContent)
                        document.getElementById("message-list").scrollTop = document.getElementById("message-list").scrollHeight;

                    }
                } else {
                    let parent =
                        document.getElementById("message-list");
                    let children =
                        document.querySelectorAll(".message");
                    if (children.length > 0) {
                        children.forEach((child) => child.remove());
                    }
                    await this.updatedChat(document.getElementById("receiverName").textContent);

                    parent.innerHTML = await this.printChat(document.getElementById("receiverName").textContent)
                    document.getElementById("message-list").scrollTop = document.getElementById("message-list").scrollHeight;
                }
            }
        }
        // updateSeenMessage send seen messages to server with a websocket message 
    async updateSeenMessage(messages) {
        // push messages to a map of map[string]interface{} to send to sever 
        const payload = {};
        payload["message"] = messages;
        payload["type"] = "seen";
        this.socket.send(JSON.stringify(payload));

    }

    async addOldMessage() {
        let parent = document.getElementById("message-list");
        let children = document.querySelectorAll(".message");
        if (children.length > 0) {
            children.forEach((child) => child.remove());
        }
        parent.innerHTML = await this.printChat(document.getElementById("receiverName").textContent);

    }

}

let inThrottle = false;

function fthrottle(func, limit) {
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

function setTypingMessage() {
    let location = document.getElementById("typeEvent")
    location.innerHTML = "typing..."
    setTimeout(() => {
        location.innerHTML = ""
    }, 500);
}