import abstact from "./abstract.js";
import { requestProfileData } from "./datahandler.js";

export default class extends abstact {
       constructor() {
              super();
              this.setTitle("Profile");
              this.app = document.querySelector("#app");
              this.data = null;
       }
       // getData return data from the server
       async getData(socket) {
              this.data = await JSON.parse((await requestProfileData(socket)));
              // Wait until this.data is set before proceeding
              while (!this.data) {
                     await new Promise((resolve) => setTimeout(resolve, 100));
              }
              console.log("profile data",this.data);
              this.user = this.findUser(this.data.ActiveUsername);
              this.info1 = this.findInfo1();
              this.info2 = this.findInfo2();
       }
       async getHtml(socket) {
              await this.getData(socket);
              console.log(this.info1, "info 2 :",this.info2)
              return `
        <div class="pContainer">
          <div class="profile">
            ${this.user}
            <div class="infoContainer">
                <div class="pProfileBox">
                  <div class="pProfileImg"></div>
                  ${this.info1}
                  ${this.info2}
                </div>
            </div>
          </div>
        </div>
    `;
       }

       findUser(uName = "") {
              if (uName !== "") {
                     return `
            <div class="pUser">
                <div class="bUserImg"></div>
                <div id="activeUserName" class="bUserName">${uName}</div>
                <div class="bLogout">
                <a href="/logout" id="logout">Logout</a>
                </div>
            </div>`;
              } else if (uName === "") {
                     return `
            <div class="pUser">
                <div class="bUserImg"></div>
                <div id="activeUserName" class="bUserName">guest</div>
                <div class="bLogin">
                <a href="/login">Login</a>
                </div>
            </div>`;
              }
       }
       findInfo1() {
              return `
          <div class="info1">
                    <div class="userName">${this.data.UserInfo.Username}</div>
                    <div class="userLater"></div>
          </div>
          `;
       }



       findInfo2() {
              console.log("findInfo2", this.data);
              let likedPosts = "";
              let dislikedPosts = "";
              let createdPosts = "";
              if (this.data.LikedPosts !== null) {
                     this.data.LikedPosts.forEach((post) => {
                            likedPosts += `
            <p>${post.CreationTime}<a href="/post/${post.Id}">${post.Title}</a><text style="color: white;">${post.Message}</text></p>
            `;
                     });
              }

              if (this.data.DislikedPosts !== null) {
                     this.data.DislikedPosts.forEach((post) => {
                            dislikedPosts += `
            <p>${post.CreationTime}<a href="/post/${post.Id}">${post.Title}</a><text style="color: white;">${post.Message}</text></p>
            `;
                     });
              }
              if (this.data.CreatedPosts !== null) {
                     this.data.CreatedPosts.forEach((post) => {
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
                          <div class="aboutMe1"><label for="nickname">Nickname:</label></div>
                          <div class="aboutMe2"><p>${this.data.UserInfo.Username}</p></div>
                          <div class="aboutMe1"><label for="firstName">First Name:</label></div>
                          <div class="aboutMe2"><p>${this.data.UserInfo.FirstName}</p></div>
                          <div class="aboutMe1"><label for="lastName">Last Name:</label></div>
                          <div class="aboutMe2"><p>${this.data.UserInfo.LastName}</p></div>
                          <div class="aboutMe1"><label for="birthday">Birthday:</label></div>
                          <div class="aboutMe2"><p>${this.data.UserInfo.Birthday}</p></div>
                          <div class="aboutMe1"><label for="age">Age:</label></div>
                          <div class="aboutMe1"><label for="email">Email:</label></div>
                          <div class="aboutMe2"><p>${this.data.UserInfo.Email}</p></div>
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
              console.log("info2", info2)
              return info2
       }


}


