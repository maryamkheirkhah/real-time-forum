
import {requestProfileData} from "../datahandler.js";
export default class Profile {
    constructor( socket) {
        this.socket = socket;
        this.activeUserName = document.querySelector("#activeUserName").textContent;
        this.profileHeader()
    }
    async profileHeader() {
    this.userdata =  JSON.parse((await requestProfileData(this.socket)));
    console.log(this.userdata);
     this.info1 = this.findInfo1();
     this.info2 = this.findInfo2();
    
     let parent = document.getElementById("mainPostsBox");
     parent.innerHTML = await this.getHtml();

    const userNavBtn = document.querySelectorAll(".userNavBtn")
    const userInfo = document.querySelectorAll(".userInfo")
    console.log("userNavBtn", userNavBtn)
        userNavBtn.forEach((btn) => {
            btn.addEventListener("click", (e) => {
            if (e.target.id === "aboutMeBtn") {
                userInfo.forEach((info) => {
                    if (info.id === "aboutMe") {
                        info.style.display = "block"
                    }else{
                        info.style.display = "none"
                    }
                })
            }
             if (e.target.id === "createdPostsBtn") {
                userInfo.forEach((info) => {
                    if (info.id === "createdPosts") {
                        info.style.display = "block"
                    }else{
                        info.style.display = "none"
                    }
                })
            }
             if (e.target.id === "likedPostsBtn") {
                userInfo.forEach((info) => {
                    if (info.id === "likedPosts") {
                        info.style.display = "block"
                    }else{
                        info.style.display = "none"
                    }
                })
            }
             if (e.target.id === "dislikedPostsBtn") {
                userInfo.forEach((info) => {
                    if (info.id === "dislikedPosts") {
                        info.style.display = "block"
                    }else{
                        info.style.display = "none"
                    }
                })
            }
        })
    })
    }
    async getHtml() {
        return `
        <div class="bPost">
      <div class="infoContainer">
          <div class="pProfileBox">
            ${this.info1}
            ${this.info2}
          </div>
      </div>
  </div>
`;
 }


    findInfo1() {
        return `
    <div class="info1">
              <div class="userName">${this.userdata.UserInfo.Username}</div>
    </div>
    `;
    }
    findInfo2() {
        let likedPosts = "";
        let dislikedPosts = "";
        let createdPosts = "";
        if (this.userdata.LikedPosts !== null) {
               this.userdata.LikedPosts.forEach((post) => {
                      likedPosts += `
      <p>${post.CreationTime}<a href="/post/${post.Id}">${post.Title}</a><text style="color: white;">${post.Message}</text></p>
      `;
               });
        }

        if (this.userdata.DislikedPosts !== null) {
               this.userdata.DislikedPosts.forEach((post) => {
                      dislikedPosts += `
      <p>${post.CreationTime}<a href="/post/${post.Id}">${post.Title}</a><text style="color: white;">${post.Message}</text></p>
      `;
               });
        }
        if (this.userdata.CreatedPosts !== null) {
               this.userdata.CreatedPosts.forEach((post) => {
                      createdPosts += `
      <p>${post.CreationTime}<a href="/post/${post.Id}">${post.Title}</a><text style="color: white;">${post.Message}</text></p>
      `;
               });
        }
        const info2 = `
        <div class="info2">
                  <ul id="userInfo" class="userNav" >
                      <li id="aboutMeBtn" class="userNavBtn"> About Me</li>
                      <li id="createdPostsBtn" class="userNavBtn"> Created Posts</li>
                      <li id="likedPostsBtn" class="userNavBtn"> Liked Posts</li>
                      <li id="dislikedPostsBtn" class="userNavBtn"> Disliked Posts</li>
                  </ul>
                  <div id="aboutMe" class="userInfo">
                  <div class="aboutMe">
                  <span>Nickname:</span><span>${this.userdata.UserInfo.Username}</span>
                  </div>
                  <div class="aboutMe">
                  <span>First Name:</span><span>${this.userdata.UserInfo.FirstName}</span>
                  </div>
                  <div class="aboutMe">
                    <span>Last Name:</span><span>${this.userdata.UserInfo.LastName}</span>
                  </div>
                  <div class="aboutMe">
                  <span>Birthday:</span><span>${this.userdata.UserInfo.Birthday}</span>
                  </div>
                  <div class="aboutMe">
                  <span>Age:</span><span>${79999}</span>
                  </div>
                  <div class="aboutMe">
                  <span>Email:</span><span>${this.userdata.UserInfo.Email}</span>
                  </div>
                  </div>
                  <div id="createdPosts" class="userInfo">
                  ${createdPosts}
                  </div>
                  <div id="likedPosts" class="userInfo">
                  ${likedPosts}
                  </div>
                  <div id="dislikedPosts" class="userInfo">
                  ${dislikedPosts}
                  </div>
        </div>`;
        return info2
    }
}