import abstract from "./abstract.js";
import { requestMainData } from "./datahandler.js";
export default class extends abstract {
    constructor() {
        super();
        this.app = document.querySelector("#app");
        //   this.app.innerHTML += this.style();
        this.setTitle("Blamer");
    }

    async getData(socket) {
            this.data = await JSON.parse((await requestMainData(socket)));
            // Wait until this.data is set before proceeding
            while (!this.data) {
                await new Promise((resolve) => setTimeout(resolve, 100));
            }
            this.chatBox = "";
            if (this.data.NickName === "") {
                this.data.NickName = "guest";
            } else if (this.data.NickName !== "guest") {
                this.activeUserName = this.data.NickName;
            }
            this.user = this.findUser(this.data.NickName);
            this.posts = this.findPost("all");
            this.Topics = this.findTopics();
            this.postBox = "";
            this.postBox = this.posting();
        }
        // getHtml return html code
    async getHtml(socket) {
            await this.getData(socket);
            return `
        <div class="bContainer">
        ${this.postBox}
        ${this.user}
        <div id="mainPostsBox" class="bPosts">${this.posts}</div>
        <div id="bRightSideArea" class="bRightSideArea">
       ${this.Topics}
        </div>
        </div>
   `;
        }
        // findUser return user info
    findUser(uName = "guest") {
            if (uName !== "guest") {
                return `
              <div class="bUser">
                     <div class="userTop">
                            <div id="activeUserName" class="bUserName">${uName}</div>
                            <div class="bLogButton">
                                   <a href="/logout" id="logout">Logout</a>
                            </div>
                      </div>
                     <div class="userBottom">
                            <div id="bChatButton"class="bChatButton">Contact List</div>
                     </div>
               </div>
                `;
            } else if (uName === "guest") {
                return `
            <div class="bUser">
                <div class="userTop">
                     <div id="activeUserName" class="bUserName">guest</div>
                     <div class="bLogButton">
                     <a href="/login">Login</a>
                     </div>
                </div>
            </div>`;
            }
        }
        // findcontactList return contact list
    findContactList() {
        let list = "";
        this.data.users.forEach((user) => {
            if (user !== this.data.NickName) {
                list += `
                     <div class="bContact">
                            <div class="bContactName">${user}</div>
                            <div id="chatWith_${user}" class="bcButton">Chat</div>
                     </div>
                     `;
            }
        });
        let container = document.createElement("div");
        container.id = "bContactBox";
        container.className = "bContactBox";
        container.innerHTML = `
              <div class="bContactListTitle">Contact List</div>
              <div class="bContactList">
                     ${list}
              </div>
              `;
        return container;

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
    updatedPostList(topic) {

            let postBox = document.querySelectorAll(".bPost")
            postBox.forEach((post) => {
                    post.remove()
                })
                // add new posts
            let posts = this.findPost(topic);
            document.getElementById("mainPostsBox").innerHTML = posts;
        }
        // findPost return all posts
    findPost(topics = "all") {
        let posts = "";
        this.data.Posts.sort((b, a) => Date.parse(a.CreationTime) - Date.parse(b.CreationTime));
        if (topics == "all") {
            if (this.data.Posts.length == 0) {
                return "";
            }
            this.data.Posts.forEach((post) => {
                let newContent = post.Content;
                if (post.Content.length > 75) {
                    newContent =
                        post.Content.slice(0, 75) + " . . .";
                }
                posts += `
                                          <div class="bPost">
                                          <div id="${post.PostId}" class="pBox">
                                          <div class="pBlamer">${post.Username}</div>
                                          <div class="pTopic">${post.Topics}</div>
                                          <div class="pComent">${post.TotalComments}</div>
                                          <div class="pContent">
                                          <div class="pTitle">${post.Title}</div>
                                          <div class="pTime">${post.CreationTime}</div>
                                          <div class="pStory">${newContent}</div>
                                          </div>
                                          </div>
                                          </div>
                                          `;
            });
        } else if (topics != "all") {
            if (this.data.Posts.length == 0) {
                return "";
            }
            this.data.Posts.forEach((post) => {
                let newContent = post.Content;
                if (post.Content.length > 75) {
                    newContent =
                        post.Content.slice(0, 75) + " . . .";
                }
                if (post.Topics == topics) {
                    posts += `
                                   <div class="bPost">
                                   <div id="${post.PostId}" class="pBox">
                                   <div class="pBlamer">${post.Username}</div>
                                   <div class="pTopic">${post.Topics}</div>
                                   <div class="pComent">${post.TotalComments}</div>
                                   <div class="pContent">
                                   <div class="pTitle">${post.Title}</div>
                                   <div class="pTime">${post.CreationTime}</div>
                                   <div class="pStory">${newContent}</div>
                                   </div>
                                   </div>
                                   </div>
                                   `;
                }
            });
        }
        if (posts == "") { return this.findPost("all") }
        return posts;

    }
    findTopics() {
        let topics = "";
        this.data.Topics.forEach((topic) => {
            topics += `
            <div class="bTopic">
            <div class="tBox">
            <div class="tName">${topic}</div>
            </div>
            </div>
            `;
        });
        return `
        <div class="bTopics">
        ${topics}
        </div>`;
    }

    posting() {
        let topicList = "";
        this.data.Topics.forEach((topic) => {
            topicList += `<option value="${topic}">Topic: ${topic}</option>`;
        });
        let postBox = `
        <div id="cPostBox" class="cPostBox">
        <div class="bPostForm">
            <div id="blameP-form">
                <div class="topSide">
                    <div class="pTitle"><input type="text" name="blameP-Title" placeholder="Title"></div>
                    <select class="pTopics" name="blameP-Topics">
                    ${topicList}
                    </select>
                </div>
                <div class="botSide">
                <textarea name="blameP-Content" class="textBox" placeholder="Lets Blame" ></textarea>
                </div>
                </div> 
                <button  class="sendB" id="letPost" type="submit" >Post</button>
        </div>
        </div>
        `;
        return postBox;
    }
    findAllUser() {
        let userList = "";

        this.data.users.forEach((user) => {
            if (user != this.data.NickName) {
                userList += `<option value="${user}">${user}</option>`;
            }
        });
        return userList;
    }
    async updatedChat(receiver) {
            console.log("im chating with" + receiver)
            let chat = "";
            let messages = [];
            if (this.message) {
                if (this.message.sender == this.data.NickName)
                    this.data.Messages.send =
                    this.data.Messages.send.concat(this.message);
                else if (this.message.receiver == this.data.NickName)
                    this.data.Messages.receive =
                    this.data.Messages.receive.concat(
                        this.message
                    );
            }
            // Combine send and receive messages into a single array
            if (this.data.Messages.send) {
                messages = messages.concat(this.data.Messages.send);
            }
            if (this.data.Messages.receive) {
                messages = messages.concat(this.data.Messages.receive);
            }

            // Sort messages by time
            messages.sort((a, b) => new Date(a.time) - new Date(b.time));
            // Generate chat HTML

            messages.forEach((message) => {
                if (receiver == null) {
                    if (((message.sender == this.data.NickName && message.receiver == receiver) ||
                            (message.receiver == this.data.NickName && message.sender == receiver)) &&
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
                    message.sender == this.data.NickName &&
                    message.receiver == receiver
                ) {
                    chat += `
                            <div class="messageBox" style="justify-items: end;">
                            <div class="mInfo" style="float:right;"><b>Me:</b> ${message.time}</div>
                            <div class=" message"><span>${message.content}</span></div>
                            </div>
                  `;
                } else if (
                    message.receiver == this.data.NickName &&
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
        /* 
        const response = await fetch("/blamer");
        this.data = await response.json(); */
        console.log("see=?")
        if (
            this.activeUserName != null &&
            this.activeUserName !== "guest"
        ) {
            if (message != undefined) {

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
                    parent.innerHTML = await this.updatedChat(document.getElementById("receiverName").textContent);
                }
            } else {
                let parent =
                    document.getElementById("message-list");
                let children =
                    document.querySelectorAll(".message");
                if (children.length > 0) {
                    children.forEach((child) => child.remove());
                }
                if (
                    this.data.NickName ===
                    this.activeUserName
                ) {
                    parent.innerHTML = await this.updatedChat(document.getElementById("receiverName").textContent);
                }
            }
        }
    }
}