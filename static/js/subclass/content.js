import {dataGathering,sendNewCommentData,requestPostData} from "../datahandler.js"
export default class Content {
    constructor( element, socket) {
        this.socket = socket;
        this.data = extractPostData(element);
        this.element = element
        this.activeUserName =  document.querySelector("#activeUserName").textContent;
        this.blameContent(this.element)
    }

    async findBlameThing(id) {
        let blameThing = "";
        let comments = 0;
        if (this.reactionData.comments) {
            comments = this.reactionData.comments.length;
        }
        console.log(this.data,"in findBlameThing")
        
        let post = this.data
                blameThing = `
                        <div class="bPost">
                        <div id="${id}" class="blameContent">
                               <div class="pbTop">
                                      <div class="pbTitle">${post.title}</div>
                                      <div class="pbUsername">${post.username}</div>
                                      <div class="pbTime">${post.time}</div>
                               </div>
                               <textarea class="pbContent" readonly>${post.story}</textarea>
                               <div class="pbBottom">
                                      <div class="pbTopic">${post.topic}</div>
                                      <div class="pbLikeNumb"><span>${this.reactionData["likes"]} </span><span id="pbLikebtn">LIKE</span></div>
                                      <div class="pbDislikeNumb"><span>${this.reactionData["dislikes"]} </span><span id="pbDislikebtn-">DISLIKE</span></div>
                                      <div class="pbCommentNumb"><span>${post.commentCount} </span><span>COMMENTS</span></div>
                               </div>
                               </div>
                               </div>
                        `;
        return blameThing;
    }
    // eventlisterner for blame button = id: letsComment for sent comment
async createCommentBox(id) {
    let container = document.createElement("div");
    container.id = "blameC-form";
    container.innerHTML += `
          <div class="bPost" >
          <div class="pbCommentBox">
          <label id="letsComment" for="bCommentBoxContent" class="sendComment">Comment</label>
          <input type="text" name="blameC-Content" class="pbCommentBoxContent" id="bCommentBoxContent" placeholder="Comment here"></input>
          </div>
          </div>
          `
    return container;
}
// search for comments
async findComments() {
    let comments = "";
    let side = "justify-items: start;";
    let like = "white"
    let dislike = "white"
   
  
    this.reactionData.comments.forEach((comment) => {
        console.log(comment,"in findComments")
        if (comment.Username == this.activeUserName) {
            side = "justify-items: end;";
        }
        if (comment.LikesStatus == "like") {
            like = "green"
        } else if (comment.LikesStatus == "dislike") {
            dislike = "red"
        }
        comments += `
                               <div class="pbComment" style="${side};">
                                      <div class="pbCommentUname"><b>${comment.Username}</b>${comment.CreationTime}</div>
                                      <div class="pbCommentContent" >
                                             <div class="pbCommentText">${comment.Content}</div>
                                      </div>
                                      <div class="pbCommentBotton">
                                             <div class="pbCommentLike"><span id="lNumb">${comment.Likes}</span><span id="lButton" style="color :${like}">Like</span></div>
                                             <div class="pbCommentDislike"><span id="dNumb">${comment.Dislikes}</span><span id="lButton" style="color :${dislike}">Dislike</span></div>
                                      </div>
                               </div>
                        `;


    });
    return comments;
}
async createCommentArea() {
    let commentData = this.reactionData.comments;
    let comments = await this.findComments(commentData);
    let parent = document.createElement("div");
    parent.className = "bPost";
    let container = document.createElement("div");
    container.className = "pbCommentArea";
    container.innerHTML = `${comments}`;
    parent.appendChild(container);
    return parent;
}

async blameContent(element) {
    this.reactionData = JSON.parse(await requestPostData(this.socket, element.id));
    let parents = document.querySelectorAll(".bPost");
    if (parents) {
        parents.forEach((parent) => {
            parent.remove();
        });
    }
    let parent = document.getElementById("mainPostsBox");
    let blame = await this.findBlameThing(element.id);
    parent.innerHTML = blame;
    let commentBox = await this.createCommentBox(element.id);
    parent.appendChild(commentBox);
    if (this.reactionData.comments != null) {
        parent.appendChild(await this.createCommentArea());
    }
    document.getElementById("letsComment").addEventListener("click",async(e) => {
        e.preventDefault();
        let data = await dataGathering("blameC")
        let ID = document.querySelector(".blameContent").id
        data["message"]["PostId"] = ID
        await sendNewCommentData(this.socket, data)
        addNewComment(data["message"],this.activeUserName)
        document.getElementById("bCommentBoxContent").value = "";
    }
);
}
}

function addNewComment(message, name){
    let like = "white"
    let dislike = "white"
    // creationTime return time now
    let creationTime =  new Date().toLocaleString();

    const container = document.createElement("div");
    container.className = "pbComment";
    container.style.justifyItems = "end";
    container.innerHTML = `
           <div class="pbCommentUname"><b>${name}</b>${creationTime}</div>
           <div class="pbCommentContent" >
                  <div class="pbCommentText">${message.Content}</div>
           </div>
           <div class="pbCommentBotton">
                  <div class="pbCommentLike"><span id="lNumb">${0}</span><span id="lButton" style="color :${like}">Like</span></div>
                  <div class="pbCommentDislike"><span id="dNumb">${0}</span><span id="lButton" style="color :${dislike}">Dislike</span></div>
           </div>
`
    document.querySelector(".pbCommentArea").appendChild(container);
}

function extractPostData(element) {
    const id = element.id;
    const username = element.querySelector(".pBlamer").textContent;
    const topic = element.querySelector(".pTopic").textContent;
    const commentCount = parseInt(element.querySelector(".pComent").textContent);
    const title = element.querySelector(".pTitle").textContent;
    const time = element.querySelector(".pTime").textContent;
    const story = element.querySelector(".pStory").textContent;
    
    return {
      id,
      username,
      topic,
      commentCount,
      title,
      time,
      story
    };
  }