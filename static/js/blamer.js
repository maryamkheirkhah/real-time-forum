import abstract from "./abstract.js";
import {
    requestMainData,
    requestOnlineUsers,
} from "./datahandler.js";
export default class extends abstract {
    constructor() {
        super();
        this.app = document.querySelector("#app");
        //   this.app.innerHTML += this.style();
        this.setTitle("Blamer");
    }

    async getData() {
            this.data = await JSON.parse((await requestMainData(this.socket)));
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
    unseenMessage(message) {
            if (message.receiver == this.activeUserName && message.seen === 0) {
                return true
            }
            return false
        }
 
    async findContactList() {
        this.onlineUsers = await (JSON.parse(await requestOnlineUsers(this.socket)));
        while (!this.onlineUsers) {
            await new Promise((resolve) => setTimeout(resolve, 100));
        }

        let list = "";
        this.data.users.sort(function(a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase());
        });
        let allMessages
        if (this.data.Messages && this.data.Messages["receive"] && this.data.Messages["send"]) {
            allMessages = this.data.Messages["receive"].concat(this.data.Messages["send"])
        } else if (this.data.Messages && this.data.Messages["receive"]) {
            allMessages = this.data.Messages["receive"]
        } else if (this.data.Messages && this.data.Messages["send"]) {
            allMessages = this.data.Messages["send"]
        }
        if (allMessages) {
            this.data.users.sort(function(a, b) {
                let lastMessageA
                let lastMessageB
                allMessages.forEach((message) => {
                    if ((message.receiver == a || message.sender == a)) {
                        if (lastMessageA == undefined) {
                            lastMessageA = message
                        } else if (Date.parse(lastMessageA.time) < Date.parse(message.time)) {
                            lastMessageA = message
                        }
                    } else if (message.receiver == b || message.sender == b) {
                        if (lastMessageB == undefined) {
                            lastMessageB = message
                        } else if (Date.parse(lastMessageB.time) < Date.parse(message.time)) {
                            lastMessageB = message
                        }
                    }
                })
                if (lastMessageA && lastMessageB) {
                    if (Date.parse(lastMessageA.time) >= Date.parse(lastMessageB.time)) {
                        return -1;
                    } else if (Date.parse(lastMessageA.time) < Date.parse(lastMessageB.time)) {
                        return 1;
                    }
                } else if (lastMessageA) {
                    return -1;
                } else if (lastMessageB) {
                    return 1;
                }
                return 0;
            });
        }
        let userNotif = new Map();
        if (this.data.Messages.receive) {
            this.data.Messages.receive.forEach((message) => {
                if (this.unseenMessage(message)) {
                    userNotif.set(message.sender, userNotif.get(message.sender) + 1 || 1)
                } else {
                    userNotif.set(message.sender, userNotif.get(message.sender) || 0)
                }
            })

        }
        this.data.users.forEach((user) => {

            if (user !== this.data.NickName) {

                let numb = userNotif.get(user) || 0
                let online = this.onlineUsers.includes(user)
                if (online) {
                    online = `<span name="Status_${user}" class="onlineStatus"></span>
                    `
                } else {
                    online = `<span name="Status_${user}" class="offlineStatus"></span>`
                }

                if (numb <= 0) {
                    numb = `<span name="notif_${user}" class="notif"></span>`
                } else {
                    numb = `<span name="notif_${user}" class="notif">${numb}</span>`
                }

                list += `
                     <div class="bContact">
                            <div class="bContactName"><span id="fpUser">${user}</span>${online}${numb}</div>
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
        if (posts == "") {
            return this.findPost("all")
        }
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
            if (topic !== "all") 
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
}