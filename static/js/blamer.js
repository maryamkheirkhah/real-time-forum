import abstract from "./abstract.js";
import FormData from "./postData.js";
export default class extends abstract {
    constructor() {
        super();
        
       // this.getData()
        this.setTitle("Blamer");

        this.app = document.querySelector("#app");
        //   this.app.innerHTML += this.style();
        this.data = null;
       
        
    }
    // getData return data from the server
    async getData() {
        let Topics = []
        const response = await fetch('/blamer');
        this.data =  await response.json();
        
        this.user = this.findUser(this.data.Username);
        this.posts = this.findPost("all");
        this.Topics = this.findTopics();
        this.postBox = ""
        this.postBox = this.posting();  
    }
    // getHtml return html code
    async getHtml() {
        await this.getData()
        return `
        <div class="bContainer">
        ${this.postBox}
        ${this.user}
        ${this.posts}
        <div class="bRightSideArea">
       ${this.Topics}
        <div class="bChat">
        <div class="bSreachBar"></div>
        <div class="bChatName"></div>
        <div class="bChatBox"></div>
        </div>
        </div>
        </div>
   `    
    }

    // findUser return user info
    findUser(uName ="guest"){
        if (uName !== "guest"){
            return `
            <div class="bUser">
                <div class="bUserImg"></div>
                <div id="activeUserName" class="bUserName">${uName}</div>
                <div class="bLogout">
                <a href="/logout" id="logout">Logout</a>
                </div>
            </div>`
        } else if (uName === "guest"){
            return `
            <div class="bUser">
                <div class="bUserImg"></div>
                <div id="activeUserName" class="bUserName">guest</div>
                <div class="bLogin">
                <a href="/login">Login</a>
                </div>
            </div>`
        }
    }

    // findPost return all posts
   findPost(topics = "all"){
    if (topics == "all"){
        let posts ="" 
      this.data.Posts.forEach(post => {
           if (post.Content.length > 150){
                post.Content = post.Content.slice(0,150) + " . . ."
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
      `

        });
        return `
        <div class="bPosts">
        ${posts}
        </div>`
    }


    }
    findTopics(){
        let topics = ""
        this.data.Topics.forEach(topic => {
            topics += `
            <div class="bTopic">
            <div class="tBox">
            <div class="tName">${topic}</div>
            </div>
            </div>
            `
        });
        return `
        <div class="bTopics">
        ${topics}
        </div>`
    }

    posting(){
        let topicList = ""
        this.data.Topics.forEach(topic => {
            topicList += topic + " "
        });
        let postBox = `
        <div id="cPostBox" class="cPostBox">
        <div class="bPostForm">
            <form id="letsBlame">
                <div class="topSide">
                    <div class="pTitle"><input type="text" name="Title" placeholder="Title"></div>
                    <div class="pTopics"><input type="text" name="Topics" placeholder="${topicList}"></div>
                </div>
                <div class="botSide">
                <textarea class="textBox" placeholder="Lets Blame" ></textarea>
                </div>
                </form> 
                <button  class="sendB" id="letPost" type="submit">Post</button>
        </div>
        </div>
        `
        return postBox
      
    }
}
