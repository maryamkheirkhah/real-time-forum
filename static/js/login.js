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
        <div id="login-form">
              <div class="login-form">
              <div class="input">
              <input type="text" name="login-loginusername" id="loginusername" placeholder="Nickname"/>
              </div>
              <div class="input">
              <input type="password" name="login-loginpassword" id="loginpassword" placeholder="Password" />
              </div>
              <div class="login-submit">
              <button id="loginSubmit" type="submit" href="/blamer" data-link>Login</button>
              </div>
              </div>
        </div>
        <div class="login-registerlink">
        <p>Don't have an account? <a href="/register" data-link>Register</a></p>
        </div>
        </div>
        </div>
    `;
  }
}
