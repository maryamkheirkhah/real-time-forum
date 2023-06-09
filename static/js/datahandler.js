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
    var obj2 = {};
    obj2["message"] = obj;
    obj2["type"] = location;
    return obj2;
}
export async function sendLoginData(socket, data) {
    //const socket = new WebSocket(location);
    // Wait for the WebSocket connection to open
    socket.addEventListener("open", () => {
        console.log("WebSocket connection established.");
    });
    // Send the login data as JSON to the backend through the WebSocket
    if (data.message["loginusername"] === "" || data.message["loginpassword"] === "") {
        alert("Please fill in all fields");
        return;
    }
    socket.send(JSON.stringify(data));
    // Define a callback function to handle the response from the backend
    const handleResponse = (event) => {
        // Handle the response from the backend
        const response = JSON.parse(event.data);
        if (response) {
            if (
                response["sessionId"] !== "" 
            ) {
                // Set a cookie with the user's username
                 document.cookie = `sessionID=${response["sessionId"]}; path=/; max-age=3600;`;
                navigateTo("/blamer"); 
            } else if (response["nickname"] ==="User does not exist") {
                alert("User does not exist");
            } else if (response["nickname"] === "password does not match") {
                alert("Password Is Wrong");
            }
        } else {
            alert("Enter a valid username and password");
        }
        location.reload();
    };

    // Wait for a response from the backend and call the callback function
    socket.addEventListener("message", handleResponse);
    socket.addEventListener("close", (event) => {
        console.log("WebSocket connection closed:");
    });

    navigateTo("/blamer");
}
export async function sendRegisterData(socket, data) {
    // const socket = new WebSocket(location);
    // Wait for the WebSocket connection to open
    // Send the login data as JSON to the backend through the WebSocket
    let registerFields = []
    let errMsg = "Please fill\n"
    for (let [key, value] of Object.entries(data["message"])) {
        if (value === '') {
            registerFields.push(key);
            errMsg += "* " + key + "\n"
        }
        if (key === "nickName" && value.length < 3 || key === "nickName" && value.length > 20) {
            registerFields.push(key);
            errMsg += "* Nickname value must be between 3 and 20 characters in length." + "\n"
        }
        if (key === "* password" && value.length < 8 || key === "password" && value.length > 20) {
            registerFields.push(key);
            errMsg += "* Password value must be between 8 and 20 characters in length." + "\n"
        }
        if (key === "email") {
            const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
            if (!value.match(emailRegex)) {
                errMsg += "* Email is not valid" + "\n"
                registerFields.push(key);
            }
        }
    }
    if (registerFields.length > 0) { 
        alert(errMsg);
        return;
    }
    if (data["message"]["password"] !== data["message"]["cpassword"]) {
        alert("* Passwords do not match")
        return
    }

    socket.send(JSON.stringify(data));
    navigateTo("/login");
}
export async function sendNewPostData(socket, data) {
    if (data["message"]["Title"] === "" || data["message"]["Content"] === "" || data === undefined || data === null) {
        alert("Please fill in all fields");
        return;
    }

    socket.send(JSON.stringify(data));
    navigateTo("/blamer");
    socket.addEventListener("close", (event) => {
        console.log("WebSocket connection closed:");
    });
    // Define a callback function to handle the response from the backend

}
export async function sendNewCommentData(socket, data) {
    // const socket = new WebSocket(location);
    // Wait for the WebSocket connection to open
    socket.addEventListener("open", () => {
        console.log("WebSocket connection established.");
        resolve();
    });
    // Send the login data as JSON to the backend through the WebSocket
    socket.send(JSON.stringify(data));
}
export async function sendChatData(socket, data) {

    socket.addEventListener("open", () => {
        console.log("WebSocket connection established.");
    });
    socket.send(JSON.stringify({ "message": data, "type": "chat" }));

    socket.addEventListener("close", (event) => {
        console.log("WebSocket connection closed:");
    });
    socket.addEventListener("error", (event) => {
        console.error("WebSocket error:", event);
    });

    socket.addEventListener("message", (event) => {
        console.log("WebSocket message:");
        return event.data;
    });
}
export async function requestOnlineUsers(socket) {
    return new Promise((resolve, reject) => {

        socket.send(JSON.stringify({ "type": "onlineUsers", "message": {} }));
        socket.addEventListener("open", () => {
            console.log("WebSocket connection established. in online users");
        });
        socket.addEventListener("message", (event) => {
            resolve(event.data);
        });

        socket.addEventListener("error", (event) => {
            console.error("WebSocket error:", event);
            reject(event);
            socket.close();
        });
    });

}
export async function requestMainData(socket) {
    socket.addEventListener("open", () => {
        console.log("WebSocket connection established.");
        socket.send(JSON.stringify({ "type": "mainData", "message": {} }));

    });
    return new Promise((resolve, reject) => {
        // const socket = new WebSocket(location);


        socket.addEventListener("message", (event) => {
            console.log("WebSocket message:");
            resolve(event.data);
        });

        socket.addEventListener("error", (event) => {
            console.error("WebSocket error:");
            reject(event);
            socket.close();
        });

    });
}
// requestPostData try to get post data from server
// that return likeStatus, likenumb, dislikenub, []comments table
export async function requestPostData(socket, id) {
    return new Promise((resolve, reject) => {
        socket.send(JSON.stringify({ "type": "content", "message": { "id": id } }));
        socket.addEventListener("message", (event) => {
            console.log("WebSocket message:");
            resolve(event.data);
        });
        socket.addEventListener("close", (event) => {
            console.log("WebSocket connection closed:");
            reject(event);
        });
        socket.addEventListener("error", (event) => {
            console.error("WebSocket error:");
            reject(event);
        });
    });
}
export async function requestProfileData(socket) {
    return new Promise((resolve, reject) => {
        socket.send(JSON.stringify({ "type": "getProfile", "message": {} }));
        socket.addEventListener("message", (event) => {
            console.log("WebSocket message:");
            resolve(event.data);
        });
        socket.addEventListener("close", (event) => {
            console.log("WebSocket connection closed:");
            reject(event);
        });
        socket.addEventListener("error", (event) => {
            console.error("WebSocket error:");
            reject(event);
        });
    });
}

export async function sendReactionData(socket, data) {
    socket.send(data);
    socket.addEventListener("close", (event) => {
        console.log("WebSocket connection closed:");
    });
    socket.addEventListener("error", (event) => {
        console.error("WebSocket error:");
    });
}

export async function requestAllChat(socket) {
    console.log("requestAllChat", "test, test im looking for you")
    return new Promise((resolve, reject) => {
        socket.send(JSON.stringify({ "type": "allChats", "message": {} }));
        socket.addEventListener("message", (event) => {
            console.log("WebSocket message:");
            resolve(event.data);
        });
        socket.addEventListener("close", (event) => {
            console.log("WebSocket connection closed:");
            reject(event);
        });
        socket.addEventListener("error", (event) => {
            console.error("WebSocket error:");
            reject(event);
        });
    });

}

export async function requestChat(socket, data) {
    return new Promise((resolve, reject) => {
        socket.send(JSON.stringify(data));
        socket.addEventListener("message", (event) => {
            console.log("WebSocket message:");
            resolve(event.data);
        });
        socket.addEventListener("close", (event) => {
            console.log("WebSocket connection closed:");
            reject(event);
        });
        socket.addEventListener("error", (event) => {
            console.error("WebSocket error:");
            reject(event);
        });
    });

}