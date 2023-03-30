import abstact from "./abstract.js";

export default class extends abstact {
       constructor() {
              super();
              this.setTitle("Login");
       }
       async getHtml() {
              return `
       <div class="lContainer">
        <div class="login">
        <div class="login-text">Login</div>
        <form id="login-form" class="ajax-form" action="/login" method="post">
        <div class="login-form">
        <div class="input">
        <label for="loginusername">Username</label>
        <input type="text" name="loginusername" id="loginusername" />
        </div>
        <div class="input">
        <label for="loginpassword">Password</label>
        <input type="password" name="loginpassword" id="loginpassword" />
        </div>
        <div class="login-submit">
        <button id="loginSubmit" type="submit">Login</button>
        </div>
        </div>
        </form>
        <div class="login-registerlink">
        <p>Don't have an account? <a href="#register">Register</a></p>
        </div>
        </div>
        </div>
    `;
       }
}