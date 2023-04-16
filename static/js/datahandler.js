

// Login handler
export async function sendLoginData(location = "ws://localhost:8080/api/data-route", data) {
              const socket = new WebSocket(location);
                     // Wait for the WebSocket connection to open
                     await new Promise(resolve => {
                       socket.addEventListener("open", () => {
                         console.log("WebSocket connection established.");
                         resolve();
                       });
                     });
                 
                     // Send the login data as JSON to the backend through the WebSocket
                     socket.send("login-start")
                     socket.send(JSON.stringify(data));
                 
                     // Define a callback function to handle the response from the backend
                     const handleResponse = (event) => {
                       // Handle the response from the backend
                       
                       const response = JSON.parse(event.data);
                       console.log("Response from backend:", response);
                       if (response) {
                         if ( 
                            data["loginusername"] !== "" &&
                            data["loginusername"] !== "wrong"
                         ) {
                           console.log("user", response["nickname"]);
                           // Set a cookie with the user's username
                         document.cookie = `sessionID=${response["sessionId"]}; path=/; max-age=3600;`;
                          navigateTo("/blamer");
                         } else if (data["loginusername"] === "") {
                           console.log("password or username is wrong");
                         } else if (data["loginusername"] === "wrong") {
                           console.log("password or username is wrong");
                         }
                       } else {
                         alert("Invalid username or password");
                       }
                     };
                 
                     // Wait for a response from the backend and call the callback function
                     socket.addEventListener("message", handleResponse);
                 
                     // Wait for the response and then close the WebSocket connection
                     await new Promise(resolve => {
                       socket.addEventListener("close", () => {
                         console.log("WebSocket connection closed.");
                         resolve();
                       });
                     });
                     
                     // Remove the event listener for message to avoid multiple invocations
                     socket.removeEventListener("message", handleResponse);
}
export async function sendRegisterData(location ="ws://localhost:8080/api/data-route" ,  data) {
       const socket = new WebSocket(location);
                     // Wait for the WebSocket connection to open
                     await new Promise(resolve => {
                       socket.addEventListener("open", () => {
                         console.log("WebSocket connection established.");
                         resolve();
                       });
                     });
                 
                     // Send the login data as JSON to the backend through the WebSocket
                     socket.send("register-start");
                     socket.send(JSON.stringify(data));
}
export async function dataGathering(location) {
      const parent = document.querySelector(`#${location}-form`);
      const inputs = parent.querySelectorAll(`[name^="${location}-"]`);
      const obj = {};
      const fdata = new FormData();
      inputs.forEach((input) => {
             console.log(input);
             const { name, value } = input;
             const nameEnd = name.split('-')[1];
             fdata.append(nameEnd, value);
      });
      for (let [key, value] of fdata.entries()) {
             obj[key] = value;
      }
     return obj;
}
export function requestMainData(location="ws://localhost:8080/api/data-route") {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(location);

    socket.addEventListener("open", () => {
      console.log("WebSocket connection established.");
      socket.send("mainData-start");
      socket.send("I want to get main data");
    });

    socket.addEventListener("message", (event) => {
      resolve(event.data);
      socket.close();
    });

    socket.addEventListener("error", (event) => {
      console.error("WebSocket error:", event);
      reject(event);
      socket.close();
    });

    socket.addEventListener("close", (event) => {
      console.log("WebSocket connection closed:", event);
    });
  });
}
export function sendNewPostData(location="ws://localhost:8080/api/data-route", data) {
}