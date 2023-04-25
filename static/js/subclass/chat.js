import { requestMainData } from "../datahandler.js";
export default class Chat {
    constructor(element, socket, receive,message){
        //this.datamessage = this.messageToArr(message);
        this.datamessage = message;
        this.element = element;
        this.socket = socket;
        this.receive = receive;
        this.activeUserName =  document.querySelector("#activeUserName").textContent;
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
    async chatHeader(){
       console.log("chat header")
        this.element.appendChild(this.findChatBox(this.receive));
        this.updatedChatBox()
        const messageInput = document.querySelector("#message-input");
        messageInput.addEventListener("keydown", async(event) => {
            if (event.key === "Enter" && messageInput.value !== "") {
                const message = messageInput.value;
                messageInput.value = "";
                const payload = {
                    sender: document.getElementById("activeUserName").textContent,
                    receiver: document.getElementById("receiverName").textContent,
                    content: message,
                    time: new Date().toLocaleString(),
                };
                this.socket.send(
                    JSON.stringify(
                        payload
                    )
                );
            }
        })
        this.socket.onmessage = async(event) => {
            this.updatedChatBox(JSON.parse(event.data));
        };
        // scroll event that add old 10 message to chat box
        const messageList = document.getElementById("message-list");
        messageList.addEventListener('scroll', async(event) => {
            if (messageList.scrollTop == 0) {
                this.index += 10
                this.addOldMessage()
            }
        })
/*         const messageList = document.getElementById("message-list"); 
        messageList.addEventListener('DOMContentLoaded', function() {
            function checkIfNeedsMoreContent() {
              const pixelsFromWindowBottomToBottom = 0 + document.documentElement.scrollHeight - window.pageYOffset - window.innerHeight;
          
              if (pixelsFromWindowBottomToBottom < 200) {
                // Here it would go an ajax request
                const clonedItem = document.querySelector('.item').cloneNode(true);
                document.body.appendChild(clonedItem);
              }
            }
          
            window.addEventListener('scroll', _.throttle(checkIfNeedsMoreContent, 300));
          }); */
        


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
              <div class="cReceiverName"><span id="receiverName">${id}</span></div>
              <div id="message-list"class="cArea"> </div>
              <div class="cInput">
              <input type="text" id="message-input" placeholder="Type your message here">
              </div>
              `
        return container;
    }
    async updatedMessage(message) {
    }

    async updatedChat(receiver) {
        let index = 0;
        console.log("im chating with" + receiver)
        let messages = [];
        console.log("this is message",this.message)
        
        if (this.message) {
            if (this.message.sender == this.activeUserName)
                if (this.datamessage.send){
                    this.datamessage.send =
                    this.datamessage.send.concat(this.message);
                }else {
                    this.datamessage.send = [this.message];
                }
            else if (this.message.receiver == this.activeUserName)
                if (this.datamessage.receive){
                    this.datamessage.receive =
                    this.datamessage.receive.concat(
                        this.message
                );
                }else {
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
        this.withReceiver = [] ;
        messages.forEach((message) => {
        if (((message.sender == this.activeUserName && message.receiver == receiver) ||
            (message.receiver == this.activeUserName && message.sender == receiver))){
               // add message to withReceiver
                this.withReceiver.push(message)
            }
        });
    }

    async printChat(receiver) {
        let index = this.index;
        let chat = "";
        console.log("this is with receiver",this.withReceiver)
        // slice this.withReceiver like [[message],[message],[message]...] 
        // and print the last 10 messages
        this.withReceiver.slice(-index).forEach((message) => {
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
        console.log("im chating with message is ???",message)
        if (
            this.activeUserName != null &&
            this.activeUserName !== "guest"
        ) {
            if (message != undefined) {
                this.index = this.index + 10;
                console.log("this is index",this.index)
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
            }
        }
    }
    async addOldMessage() {
        let parent = document.getElementById("message-list");
        let children = document.querySelectorAll(".message");
        if (children.length > 0) {
            children.forEach((child) => child.remove());
        }
        parent.innerHTML = await this.printChat(document.getElementById("receiverName").textContent)

    }
   
}