import {
  navigateTo
} from "./teleport.js";
// Login handler


export async function dataGathering(location) {
  const parent = document.querySelector(`#${location}-form`);
  const inputs = parent.querySelectorAll(`[name^="${location}-"]`);
  const obj = {};
  const fdata = new FormData();
  inputs.forEach((input) => {
    console.log(input);
    const {
      name,
      value
    } = input;
    const nameEnd = name.split('-')[1];
    fdata.append(nameEnd, value);
  });
  for (let [key, value] of fdata.entries()) {
    obj[key] = value;
  }
  var obj2 ={};
  obj2["message"] = obj;
  obj2["type"] = location;
  console.log("obj2", obj2);
  return obj2;
}
export async function sendLoginData(socket, data) {
  //const socket = new WebSocket(location);
  // Wait for the WebSocket connection to open
  socket.addEventListener("open", () => {
    console.log("WebSocket connection established.");
  });
  
  console.log("sendLoginData");
  // Send the login data as JSON to the backend through the WebSocket
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
    socket.close();
  };

  // Wait for a response from the backend and call the callback function
  socket.addEventListener("message", handleResponse);
  socket.addEventListener("close", (event) => {
    console.log("WebSocket connection closed:", event);
  }); 
  /*                      // Wait for the response and then close the WebSocket connection
                       await new Promise(resolve => {
                         socket.addEventListener("close", () => {
                           console.log("WebSocket connection closed.");
                           resolve();
                         });
                       });
                       
                       // Remove the event listener for message to avoid multiple invocations
                       socket.removeEventListener("message", handleResponse); */
  navigateTo("/blamer");
}
export async function sendRegisterData(socket, data) {
  // const socket = new WebSocket(location);
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
export async function sendNewPostData(socket, data) {
  console.log("sendNewPostData", data);
  socket.send(JSON.stringify(data));
  navigateTo("/blamer");
  socket.addEventListener("close", (event) => {
    console.log("WebSocket connection closed:", event);
  }); 
  // Define a callback function to handle the response from the backend

}
export async function sendNewCommentData(socket, data) {
  // const socket = new WebSocket(location);
  // Wait for the WebSocket connection to open
  await new Promise(resolve => {
    socket.addEventListener("open", () => {
      console.log("WebSocket connection established.");
      resolve();
    });
  });
  // Send the login data as JSON to the backend through the WebSocket
  socket.send(JSON.stringify(data));
}
export async function sendChatData(socket, data) {
  
  socket.addEventListener("open", () => {
    console.log("WebSocket connection established.");
  });
  socket.send(JSON.stringify({"message":data, "type":"chat"}));

  socket.addEventListener("close", (event) => {
    console.log("WebSocket connection closed:", event);
  }); 
  socket.addEventListener("error", (event) => {
    console.error("WebSocket error:", event);
  });
   
  socket.addEventListener("message", (event) => {
    console.log("WebSocket message:", event.data);
   return event.data;
  });
 
  // Wait for the WebSocket connection to ope
  // Send the login data as JSON to the backend through the WebSocket
  // TODO:Define a callback function to handle the response from the backend
  console.log("sendChatData");
}
export async function requestMainData(socket) {
  return new Promise((resolve, reject) => {
    // const socket = new WebSocket(location);

    socket.addEventListener("open", () => {
      console.log("WebSocket connection established.");
      socket.send(JSON.stringify({"type":"mainData", "message":{}}));
    });

    socket.addEventListener("message", (event) => {
      resolve(event.data);
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

// requestPostData try to get post data from server
// that return likeStatus, likenumb, dislikenub, []comments table
export async function requestPostData(socket, id) {
  
  return new Promise((resolve, reject) => {
    socket.send(JSON.stringify({"type":"content", "message":{"id":id}}));
    socket.addEventListener("message", (event) => {
      console.log("WebSocket message:", event.data);
      resolve(event.data);
    });
    socket.addEventListener("close", (event) => {
      console.log("WebSocket connection closed:", event);
      reject(event);
    });
    socket.addEventListener("error", (event) => {
      console.error("WebSocket error:", event);
      reject(event);
    });
  });
}
