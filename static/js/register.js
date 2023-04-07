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
        <form id="register-form">
        <div class="register-form">
        <div class="input">
        <input type="text" name="nickName" id="nickName" placeholder="Nickname"/>
        </div>
        <div class="input">
        <input type="text" name="fistName" id="fistName" placeholder="First Name" />
        </div>
        <div class="input">
        <input type="text" name="lastName" id="lastName" placeholder="Last Name" />
        </div>
        <select id="gender" name="gender" class="input">
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="other">Other</option>
        </select>
        <div class="input">
        <label for="birthdate">Birthdate</label>
        <input type="date" name="birthdate" id="birthdate" />
        </div>
        <div class="input">
        <input type="email" name="email" id="email" placeholder="Email" />
        </div>
        <div class="input">
        <input type="password" name="password" id="password" placeholder="Password" />
        </div>
        <div class="input">
        <input type="password" name="cpassword" id="cpassword" placeholder="Confirm Password" />
        </div>
        </div>
        <div class="register-submit">
        <button type="submit" id="register-submit">Register</button>
        </div>
        </form>
        <div class="register-emptyspace"></div>
        <div class="register-loginlink">
        <p>Already have an account? <a href="/login" data-link>Login</a></p>
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