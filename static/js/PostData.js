export default class FormData {
    constructor(formElement) {
      //this.data = new FormData(formElement);
      this.data = formElement;
    }
  
    getValues() {
      console.log("form data is:",this.data);/* 
      const values = {};
      for (let [key, value] of this.data.entries()) {
        values[key] = value;
      }
      return values;
    } */
  }
}