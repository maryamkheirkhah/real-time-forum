import abstract from "./abstract.js";
export default class extends abstract {
       constructor() {
              super();
              this.connect().then(() => {
                     this.getData().then(() => {
                      /*       console.log("this data", this.data); */
                     });
              });
              this.app = document.querySelector("#app");
              //   this.app.innerHTML += this.style();
              this.data = null;
       }
       async connect() {
              // Create a WebSocket connection and wait for it to open
              this.socket = new WebSocket("ws://localhost:8080/blamer");
              await new Promise((resolve) => {
                     this.socket.onopen = () => {
                            console.log("WebSocket connection established.");
                            // send a message to the server
                            this.socket.send("Hello from client!");
                            resolve();
                     };
              });

              // Receive messages from the server and update this.data
              this.socket.onmessage = async (event) => {
                     this.data = await JSON.parse(event.data);
                     // Now that this.data is set, call getData()
                     await this.getData();
              };
       }

       async getData() {
              // Wait until this.data is set before proceeding
              while (!this.data) {
                     await new Promise((resolve) => setTimeout(resolve, 100));
              }
              this.chatBox = "";
              if (this.data.NickName === "") {
                     this.data.NickName = "guest";
              } else if (this.data.NickName !== "guest") {
                     this.activeUserName = this.data.NickName;
                     this.makeChatBox();
              }
              this.user = this.findUser(this.data.NickName);
              this.posts = this.findPost("all");
              this.Topics = this.findTopics();
              this.postBox = "";
              this.postBox = this.posting();
              //this.updatedChatBox()

              // The rest of your code to retrieve data from the server
       }
       // getHtml return html code
       async getHtml() {
              await this.getData();
              return `
        <div class="bContainer">
        ${this.postBox}
        ${this.user}
        <div id="mainPostsBox" class="bPosts">${this.posts}</div>
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
                                          <div id="${post.Username}_${post.Title}" class="pBox">
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
              } else if (topics != "all"){
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
                                   <div id="${post.Username}_${post.Title}" class="pBox">
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
                                   `;}
                     });
              }
              if (posts == ""){return this.findPost("all")}
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
              console.log("all messages", messages);
              // Generate chat HTML
              messages.forEach((message) => {
                     if (
                            ((message.sender == this.data.NickName &&
                                   message.receiver ==
                                          document.getElementById("bReceiver")
                                                 .value) ||
                                   (message.receiver == this.data.NickName &&
                                          message.sender ==
                                                 document.getElementById(
                                                        "bReceiver"
                                                 ).value)) &&
                            message.content.length > 39
                     ) {
                            for (
                                   let i = 0;
                                   i < message.content.length;
                                   i += 40
                            ) {
                                   message.content =
                                          message.content.slice(0, i) +
                                          "\n" +
                                          message.content.slice(i);
                            }
                     }
                     if (
                            message.sender == this.data.NickName &&
                            message.receiver ==
                                   document.getElementById("bReceiver").value
                     ) {
                            chat += `
                    <lu class="message1"><b>Me:</b> ${message.content}</lu><br>
                  `;
                     } else if (
                            message.receiver == this.data.NickName &&
                            message.sender ==
                                   document.getElementById("bReceiver").value
                     ) {
                            chat += `
                    <lu class="message2"><b>${message.sender}:</b> ${message.content}</lu><br>
                  `;
                     }
              });

              return chat;
       }
       // updatedChatBox return updated chatbox

       async updatedChatBox(message) {
              /* 
              const response = await fetch("/blamer");
              this.data = await response.json(); */
              if (
                     this.activeUserName != null &&
                     this.activeUserName.textContent !== "guest"
              ) {
                     if (message != undefined) {
                            this.message = message;
                            console.log(
                                   "in updatedChatBox sender",
                                   this.message.sender
                            );
                            console.log("in updatedChatBox", this.message);
                            let parent =
                                   document.getElementById("message-list");
                            let children =
                                   document.querySelectorAll(".message");
                            if (children.length > 0) {
                                   children.forEach((child) => child.remove());
                            }
                            if (
                                   this.message.sender ===
                                          this.activeUserName.textContent ||
                                   this.message.receiver ===
                                          this.activeUserName.textContent
                            ) {
                                   parent.innerHTML = this.updatedChat();
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
                                   this.activeUserName.textContent
                            ) {
                                   parent.innerHTML = this.updatedChat();
                            }
                     }
              }
       }
       async findBlameThing(id) {
              let blameThing = "";
              // id = username_title
              let username = id.split("_")[0];
              let title = id.split("_")[1];

              this.data.Posts.forEach((post) => {
                     if (post.Username == username && post.Title == title) {
                            blameThing = `
                            <div class="bPost">
                            <div class="blameContent">
                                   <div class="pbTop">
                                          <div class="pbTitle">${post.Title}</div>
                                          <div class="pbUsername">${post.Username}</div>
                                          <div class="pbTime">${post.CreationTime}</div>
                                   </div>
                                   <textarea class="pbContent" readonly>${post.Content}</textarea>
                                   <div class="pbBottom">
                                          <div class="pbTopic">${post.Topics}</div>
                                          <div class="pbLike">${post.Likes}</div>
                                          <div class="pbDislike">${post.Dislikes}</div>
                                          <div class="pbComment">${post.TotalComments}</div>
                                   </div>
                                   </div>
                                   </div>
                            `;
                     }
              });
              return blameThing;
       }
       async createCommentBox(id) {
              let commentBox = `
              <div class="bPost" >
              <div class="pbCommentBox">
              <div class="pbCommentBoxTitle">Comment:</div>
              <textarea class="pbCommentBoxContent" id="bCommentBoxContent" placeholder="Comment here"></textarea>
              <button  class="sendComment" id="letsComment" type="submit" data-link>comment</button>
              </div>
              </div>
              `;
              return commentBox;
       }
       async findComments() {
              let comments = "";
              this.data.Comments.forEach((comment) => {
                     if (comment.PostId == this.data.PostId) {
                            comments += `
                            <div class="pbComment">
                            <div class="pbCommentTop">
                            <div class="pbCommentUsername">${comment.Username}</div>
                            <div class="pbCommentTime">${comment.CreationTime}</div>
                            </div>
                            <textarea class="pbCommentContent" readonly>${comment.Content}</textarea>
                            </div>
                            `;
                     }
              });
              return comments;
       }
       createCommentArea() {
              let comments = this.findComments();
              let commentArea = `
              <div class="bPost" >
              <div class="pbCommentArea">
              ${comments}
              </div>
              </div>
              `;
              return commentArea;
       }

       async blameContent(element) {
              let parents = document.querySelectorAll(".bPost");
              if (parents) {
                     parents.forEach((parent) => {
                            parent.remove();
                     });
              }
              let parent = document.getElementById("mainPostsBox");
              let blame = await this.findBlameThing(element.id);
              parent.innerHTML = blame;
              console.log(this.activeUserName);
              if (
                     this.activeUserName != null &&
                     this.activeUserName !== "guest"
              ) {
                     console.log("in blameContent", this.activeUserName);
                     let commentBox = await this.createCommentBox(element.id);
                     parent.innerHTML += commentBox;
              }
       }
}
