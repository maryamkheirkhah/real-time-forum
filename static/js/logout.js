import abstract from "./abstract.js";

export default class extends abstract {
  constructor() {
    super();
    this.setTitle("Logout");
    this.app = document.querySelector("#app");
    this.data = null;
    console.log("logout");
  }
  async getHtml() {
    console.log("logout");
    return "";
  }
}
