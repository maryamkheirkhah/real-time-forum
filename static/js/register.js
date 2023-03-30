import abstract from "./abstract.js";

export default class extends abstract{

    constructor(){
      super();
      this.setTitle("Register");
    }
    async  getHtml(){
        return `
        <div class="rContainer">
        <div class="register">
        <div class="register-text">Register</div>
        <form id="register-form" class="ajax-form" action="/register" method="post">
        <div class="register-form">
        <div class="input">
        <label for="registerusername">Username</label>
        <input type="text" name="registerusername" id="registerusername" />
        </div>
        <div class="input">
        <label for="registerfname">First Name</label>
        <input type="text" name="registerfname" id="registerfname" />
        </div>
        <div class="input">
        <label for="registerlname">Last Name</label>
        <input type="text" name="registerlname" id="registerlname" />
        </div>
        <div class="input">
        <label for="registerbirthdate">Birthdate</label>
        <input type="date" name="registerbirthdate" id="registerbirthdate" />
        </div>
        <div class="input">
        <label for="registeremail">Email</label>
        <input type="email" name="registeremail" id="registeremail" />
        </div>
        <div class="input">
        <label for="registerpassword">Password</label>
        <input type="password" name="registerpassword" id="registerpassword" />
        </div>
        <div class="input">
        <label for="registercpassword">Confirm Password</label>
        <input type="password" name="registercpassword" id="registercpassword" />
        </div>
        </div>
        <div class="register-submit">
        <button type="submit" id="register-submit">Register</button>
        </div>
        </form>
        <div class="register-emptyspace"></div>
        <div class="register-loginlink">
        <p>Already have an account? <a href="#login">Login</a></p>
        </div>
        </div>
      </div>
        `
    }
/*     // Append the HTML to the DOM
    this.app.innerHTML += html;
    // Add the event listener to the form
    const form = document.querySelector("#register-form");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const responseData = await this.postData("/register", formData);
      console.log(responseData);
    });
    
    return html;
  }

  constructor() {
    super();
    this.app = document.querySelector("#app");
    this.app.innerHTML += this.style();
  } */
};