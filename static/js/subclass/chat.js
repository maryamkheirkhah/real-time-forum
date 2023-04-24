
export default class Chat {
    constructor(element, socket, receive,){
        this.element = element;
        this.socket = socket;
        this.receive = receive;
        this.activeUserName =  document.querySelector("#activeUserName").textContent;
    }

    chatHeader(){
        
    }
}