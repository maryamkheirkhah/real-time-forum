
import {requestProfileData} from "../datahandler.js";
import Content from "./content.js";
export default class Profile {
    constructor( socket ,view) {
        this.socket = socket;
        this.view = view;
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
        document.querySelectorAll(".pbPostLink").forEach((link) => {
            link.addEventListener("click", async () => {
               await this.view.updatedPostList("all")
               let allPost =  document.querySelectorAll(".pBox");
               allPost.forEach((box) => {
                    if (box.id === link.id)
                   new Content(box,this.socket)
               });
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
                        <p class="pbPostLink" id="${post.Id}">${post.CreationTime} ${post.Title}</p>
      `;
               });
        }

        if (this.userdata.DislikedPosts !== null) {
               this.userdata.DislikedPosts.forEach((post) => {
                      dislikedPosts += `
                        <p class="pbPostLink" id="${post.Id}">${post.CreationTime} ${post.Title}</p>
      `;
               });
        }
        if (this.userdata.CreatedPosts !== null) {
               this.userdata.CreatedPosts.forEach((post) => {
                      createdPosts += `
                       <p class="pbPostLink" id="${post.Id}"> ${post.CreationTime} ${post.Title}</p>
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
                 Nickname: ${this.userdata.UserInfo.Username}
                  </div>
                  <div class="aboutMe">
                  First Name: ${this.userdata.UserInfo.FirstName}
                  </div>
                  <div class="aboutMe">
                   Last Name: ${this.userdata.UserInfo.LastName}
                  </div>
                  <div class="aboutMe">
                  Birthday: ${this.userdata.UserInfo.Birthday}
                  </div>
                  <div class="aboutMe">
                 Age: ${79087987987999}
                  </div>
                  <div class="aboutMe">
                Email: ${this.userdata.UserInfo.Email}
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