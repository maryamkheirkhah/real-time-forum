import abstact from "./abstract.js";

export default class extends abstact {
    constructor() {
        super();
        this.setTitle("Profile");
        this.app = document.querySelector("#app");
        this.data = null;
        console.log("profile");

    }
    // getData return data from the server
    async getData() {
        const response = await fetch('/profile');
        this.data = await response.json();
        //this.user = this.findUser(this.data.Username);
        this.userPosts = this.data.CreatedPosts;
        this.LikedPosts = this.data.LikedPosts;
        console.log("posts:",this.userPosts);
        console.log("liked:",this.LikedPosts);

        return this.data;
    }
    async getHtml() {
        await this.getData();
        console.log("userposts:",this.userPosts);
        console.log("likedposts:",this.LikedPosts);
        return `
        <div class="bContainer">
      <div class="bRightSideArea">
        <div class="bTopic"></div>
        <div class="bChat">
          <div class="bSreachBar"></div>
          <div class="bChatName"></div>
          <div class="bChatBox"></div>
        </div>
      </div>
    </div>
                
    `;
    }
}