import abstract from "./abstract.js";
export default class extends abstract {
       constructor() {
              super();

              this.app = document.querySelector("#app");
              //   this.app.innerHTML += this.style();
              this.data = null;
       }
       // getData return data from the server
       async getData() {
              let Topics = [];
              const response = await fetch("/blamer");
              this.data = await response.json();
              console.log(this.data);
              this.chatBox = "";
              if (this.data.NickName === "") {
                     this.data.NickName = "guest";
              } else {
                     this.makeChatBox();
              }
              this.user = this.findUser(this.data.NickName);
              this.posts = this.findPost("all");
              this.Topics = this.findTopics();
              this.postBox = "";
              this.postBox = this.posting();
              this.updatedChatBox()
       }
       // getHtml return html code
       async getHtml() {
              await this.getData();
              return `
        <div class="bContainer">
        ${this.postBox}
        ${this.user}
        ${this.posts}
        <div class="bRightSideArea">
       ${this.Topics}
       ${this.chatBox}
        </div>
        </div>
   `;
       }

       // findUser return user info
       findUser(uName = "guest") {
              if (uName !== "guest") {
                     return `
            <div class="bUser">
                <div class="bUserImg"></div>
                <div id="activeUserName" class="bUserName">${uName}</div>
                <div class="bLogout">
                <a href="/logout" id="logout">Logout</a>
                </div>
            </div>`;
              } else if (uName === "guest") {
                     return `
            <div class="bUser">
                <div class="bUserImg"></div>
                <div id="activeUserName" class="bUserName">guest</div>
                <div class="bLogin">
                <a href="/login">Login</a>
                </div>
            </div>`;
              }
       }

       // findPost return all posts
       findPost(topics = "all") {
              if (topics == "all") {
                     let posts = "";
                     if (this.data.Posts.length == 0) {
                            return "";
                     }
                     this.data.Posts.forEach((post) => {
                            if (post.Content.length > 150) {
                                   post.Content =
                                          post.Content.slice(0, 150) + " . . .";
                            }
                            posts += `
            <div class="bPost">
            <div class="pBox">
            <div class="pBlamer">${post.Username}</div>
            <div class="pTopic">${post.Topics}</div>
            <div class="pComent">${post.TotalComments}</div>
            <div class="pContent">
            <div class="pTitle">${post.Title}</div>
            <div class="pTime">${post.CreationTime}</div>
            <div class="pStory">${post.Content}</div>
            </div>
            </div>
            </div>
      `;
                     });
                     return `
        <div class="bPosts">
        ${posts}
        </div>`;
              }
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
            <form id="letsBlame">
                <div class="topSide">
                    <div class="pTitle"><input type="text" name="Title" placeholder="Title"></div>
                    <select class="pTopics" name="Topics">
                    ${topicList}
                    </select>
                </div>
                <div class="botSide">
                <textarea name="Content" class="textBox" placeholder="Lets Blame" ></textarea>
                </div>
                </form> 
                <button  class="sendB" id="letPost" type="submit" href="/blamer" data-link>Post</button>
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
       makeChatBox() {
              this.userList = this.findAllUser();
              this.chatBox = ` <div class="bChat">
              <div class="bChatName">Chat:</div>
              <select class="bSreachBar" id="bReceiver" >
              ${this.userList}
              </select>
              <div class="bChatBox">
              <div name="message-list" id="message-list" class="message-list">
              </div>
              <input type="text" name="message-input" id="message-input" class="message-input" placeholder="Lets Chat" required>
              </div>
              </div>`;
       }
       updatedChat() {
              let chat = "";
              let messages = [];
            
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
                if ((message.sender == this.data.NickName && message.receiver == document.getElementById("bReceiver").value||message.receiver == this.data.NickName&&message.sender == document.getElementById("bReceiver").value)&&message.content.length>39) {
                   for (let i = 0; i < message.content.length; i += 40) {
                     message.content = message.content.slice(0, i) + "\n" + message.content.slice(i);
                   }
                }
                if (message.sender == this.data.NickName && message.receiver == document.getElementById("bReceiver").value) {
                  chat += `
                    <lu class="message1"><b>Me:</b> ${message.content}</lu><br>
                  `;
                } else if (message.receiver == this.data.NickName&&message.sender == document.getElementById("bReceiver").value){
                  chat += `
                    <lu class="message2"><b>${message.sender}:</b> ${message.content}</lu><br>
                  `;
                }
              });
            
              return chat;
            }
       // updatedChatBox return updated chatbox

       async updatedChatBox() {
              const response = await fetch("/blamer");
              this.data = await response.json();
              let parent = document.getElementById("message-list");
              let children = document.querySelectorAll(".message");
              if (children.length > 0) {
                     children.forEach((child) => child.remove());
              }
              if (this.data.NickName === document.getElementById("activeUserName").textContent){
                     parent.innerHTML = this.updatedChat();
              }
       }
}
