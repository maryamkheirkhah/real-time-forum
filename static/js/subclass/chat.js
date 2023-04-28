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
        this.element.appendChild(this.findChatBox(this.receive));
        this.updatedChatBox()
        const messageInput = document.querySelector("#message-input");
        const sendTypingMessage = async () => {
            console.log("typing");
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
        messageInput.addEventListener("keydown", async (event) => {
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
                const throttle = (sendTypingMessage, time) =>{if (throttleValue) return;throttleValue = true;setTimeout(() => {sendTypingMessage();throttleValue = false;}, time);};
               throttle(sendTypingMessage, 2000);
            }
        });
        
        this.socket.onmessage = async(event) => {
           let value = await JSON.parse(event.data)
            if (value.type !== "typing") {
            this.updatedChatBox(value);
            } else if (value.type == "typing"&& value.receiver == this.activeUserName) {
                console.log("typing received");
              setTypingMessage()
            }

        };
        // scroll event that add old 10 message to chat box
        const messageList = document.getElementById("message-list");
        messageList.addEventListener('scroll', (event) => {
        if (messageList.scrollTop >= 0&& messageList.scrollTop <= 5) {
            
            this.index += 10
            if (this.index > this.withReceiver.length) {
            this.index = this.withReceiver.length
            }
            this.addOldMessage()
            if (this.index !== this.withReceiver.length) {
            messageList.scrollTop = 450 }
        }
        })

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
    async updatedMessage(message) {
    }

    async updatedChat(receiver) {
        let index = 0;
        let messages = [];      
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
    // updateSeenMessage send seen messages to server with a websocket message 
    async updateSeenMessage(messages) {
        // push messages to a map of map[string]interface{} to send to sever 
        const payload ={};
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
       /*  let chat =  await this.printChat(document.getElementById("receiverName").textContent)
        console.log("this is chat",chat) */
        parent.innerHTML = await this.printChat(document.getElementById("receiverName").textContent);

    }
   
}
function throttle(func, limit) {
    let throttling = false;
    return function throttledFunction(...args) {
      if (!throttling) {
        func.apply(this, args);
        throttling = true;
        setTimeout(() => throttling = false, limit);

      }
    }
  }
function setTypingMessage(){
    let location = document.getElementById("typeEvent")
    location.innerHTML = "typing..."
    setTimeout(() => {
        location.innerHTML = ""
    }, 1000);
}