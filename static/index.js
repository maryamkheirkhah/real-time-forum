import login from "./js/login.js";
import register from "./js/register.js";
import blamer from "./js/blamer.js";
import {
    navigateTo
} from "./js/teleport.js";
import {
    sendLoginData,
    sendRegisterData,
    sendNewPostData,
    dataGathering,
} from "./js/datahandler.js";
import Content from "./js/subclass/content.js";
import Chat from "./js/subclass/chat.js";
import Profile from "./js/subclass/profile.js";
//import all of websocket.js
import {
    socket,
    socketChat
} from "./js/webSocket.js";
const pathToRegex = (path) =>
    new RegExp(
        "^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$"
    );

const getParams = (match) => {
    const values = match.result.slice(1);
    const keys = Array.from(match.route.path.matchAll(/:(\w+)/g)).map(
        (result) => result[1]
    );

    return Object.fromEntries(
        keys.map((key, i) => {
            return [key, values[i]];
        })
    );
    }
export const router = async() => {
    const cookies = document.cookie.split(";")
    let online = false;
    for (var i = 0; i < cookies.length; i++) {

        // Get the name and value of each cookie
        var name = cookies[i].split("=")[0];
        var value = cookies[i].split("=")[1];

        // Check if the cookie with name "myCookie" exists
        if (name.trim() == "sessionID") {
            // Print the value of the cookie
            if (value) {
                online = true;
            } else {
                online = false;
            }
            break;
        }
    }
    let routes = []
    if (online) {
        routes = [{
            path: "/blamer",
            view: blamer,
        }]
    } else {
        routes = [{
                path: "/login",
                view: login,
            },

            {
                path: "/register",
                view: register,
            }
        ];

    }

    // Test each route for potential match
    const potentialMatches = routes.map((route) => {
        return {
            route: route,
            result: location.pathname.match(pathToRegex(route.path)),
        };
    });

    let match = potentialMatches.find(
        (potentialMatch) => potentialMatch.result !== null
    );

    if (!match) {
        match = {
            route: routes[0],
            result: [location.pathname],
        };
    }

    const view = new match.route.view(getParams(match));


    view.socket = socket;


    socket.addEventListener("open", () => {
        console.log("WebSocket connection established.");
    });
    socket.addEventListener("error", async(event) => {
        console.error("WebSocket error:", event);
        const response = await fetch(
            "/logout", {
                method: "POST",
            }
        );
        //delete cookie
        document.cookie =
            "sessionID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        if (response.status === 200) {
            navigateTo("/login");
        }

    });
    socket.addEventListener("close", (event) => {
        console.log("WebSocket connection closed:");
    });
    socket.addEventListener("message", (event) => {
        const pingInterval = 30 * 1000 // 30 seconds
        setInterval(() => {
            socket.send(JSON.stringify({ type: 'PING' }))
        }, pingInterval)

        socket.addEventListener('pong', (event) => {
            console.log('Received pong message.')
        })
    });

    // make page
    document.querySelector("#app").innerHTML = await view.getHtml(socket);

    if (match.route.view == blamer && online) {
        // click on userNAme
/*         document.getElementById("activeUserName").addEventListener("click", (e) => {
            socket.send(JSON.stringify({
                "type": "profile",
                "message": {
                    "nickname": document.getElementById("activeUserName").textContent
                }
            }))
            let boxs = document.querySelectorAll(".bPost");
            if (boxs) {
                boxs.forEach((box) => {
                    box.remove();
                });
            }
            new Profile(socket, view);
        }); */
        let payload = {
            type: "status",
            content: "online",
            sender: document.getElementById("activeUserName").textContent,
        };
        socketChat.addEventListener("open", () => {
            console.log("WebSocket connection established. sending payload");
            socketChat.send(JSON.stringify(payload));


            const pingInterval = 30 * 1000 // 30 seconds
            setInterval(() => {
                socketChat.send(JSON.stringify({ type: 'PING' }))
            }, pingInterval)

            socketChat.addEventListener('pong', (event) => {
                console.log('Received pong message.')
            })
        });
        if (
            document.getElementById("activeUserName") !== null &&
            document.getElementById("activeUserName").textContent !==
            "guest"
        ) {
            // click on Chat to see contact list
            document.getElementById("bChatButton").addEventListener("click", async(e) => {
                
                /*   requestAllChat(socket); */
                if (document.querySelectorAll(".bChatBox").length > 0) {
                    document.querySelectorAll(".bChatBox").forEach((box) => {
                        box.remove();
                    });
                }
                if (document.querySelectorAll(".bContactBox").length === 0) {
                    document.querySelectorAll(".bTopic").forEach((box) => {
                        box.style.height = "25px";
                    });
                    document.getElementById("bRightSideArea").appendChild(await view.findContactList());
                } else if (document.querySelectorAll(".bContactBox").length > 0) {
                    document.querySelectorAll(".bTopic").forEach((box) => {
                        box.style.height = "100px";
                    });
                    document.querySelectorAll(".bContactBox").forEach((box) => {
                        box.remove()
                    });
                    navigateTo("/blamer");
                }
                if (document.querySelectorAll(".bChatBox")) {
                    socketChat.onmessage = async(event) => {
                            const data = JSON.parse(event.data);
                            if (data.type === "status") {
                                if (data.content === "online") {
                                    document.getElementsByName(`Status_${data.sender}`)[0].style.backgroundColor = "#8ead7c";
                                } else if (data.content === "offline") {
                                    console.log(data,  document.getElementsByName(`Status_${data.sender}`)[0])
                                    document.getElementsByName(`Status_${data.sender}`)[0].style.backgroundColor = "#e3ded7";
                                }
                            } else if (data.type === "message") {

                                let numb = parseInt(document.getElementsByName(`notif_${data.sender}`)[0].textContent)
                                if (isNaN(numb)) {
                                    numb = 1
                                } else {
                                    numb += 1
                                }
                                document.getElementsByName(`notif_${data.sender}`)[0].textContent = numb.toString()
                            }
                        }
                        // update chatbox when receive message from server

                    document.querySelectorAll(".bcButton").forEach((button) => {
                        button.addEventListener("click", async() => {
                            document.querySelectorAll(".bContactBox").forEach((box) => {
                                box.remove()
                            })

                            const newChat = new Chat(document.getElementById("bRightSideArea"), socketChat, button.id);

                            await newChat.chatHeader()
                        });
                    });
/*                     document.querySelectorAll(".bContactName").forEach((button) => {
                        button.addEventListener("click", async() => {
                            socket.send(JSON.stringify({
                                "type": "profile",
                                "message": {
                                    "nickname": button.querySelector("#fpUser").textContent
                                }
                            }))
                            let boxs = document.querySelectorAll(".bPost");
                            if (boxs) {
                                boxs.forEach((box) => {
                                    box.remove();
                                });
                            }
                            new Profile(socket, view);

                        })

                    }); */

                }

            });
            // click on post button will post content
            document
                .getElementById("letPost")
                .addEventListener("click", async(e) => {
                    e.preventDefault();
                    sendNewPostData(socket, await dataGathering("blameP"));
                    navigateTo("/blamer");
                });

            // delete cookie when click logout button
            document
                .getElementById("logout")
                .addEventListener("click", async(e) => {
                    e.preventDefault();
                    console.log("logout button clicked");
                    const logout = document.querySelector("#logout");
                    if (e) {
                        const response = await fetch(
                            "/logout", {
                                method: "POST",
                            }
                        );
                        //delete cookie
                        document.cookie =
                            "sessionID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                        console.log("cookie deleted");
                        console.log("WebSocket connection established.in logout");
                        console.log("socket", socket);
                        socket.send(JSON.stringify({
                            "type": "logout",
                            "message": {
                                "nickname": document.getElementById("activeUserName").textContent
                            }
                        }));
                        console.log("logout message sent");
                        const payload = {
                            type: "status",
                            content: "offline",
                            sender: document.getElementById("activeUserName").textContent,
                        };
                        socketChat.send(JSON.stringify(payload));
                        if (response.status === 200) {
                            navigateTo("/login");
                        }
                    }
                });
        } else if (
            document.getElementById("activeUserName") !== null &&
            document.getElementById("activeUserName").textContent ===
            "guest"
        ) {
            let postBox = document.getElementById("cPostBox");
            postBox.remove();
        }
        // click on post box will show post content
        let allPost = document.querySelectorAll(".pBox");
        allPost.forEach((element) => {
            element.addEventListener("click", async() => {
                new Content(element, socket)
            });
        });
        // click on topic will show only posts belong to that topic

        document.querySelectorAll(".bTopic").forEach((topic) => {
            topic.addEventListener("click", async() => {
                if (topic.className === "bTopic") {
                    view.updatedPostList(
                        topic.querySelector(".tName")
                        .textContent
                    );
                }
                allPost = document.querySelectorAll(".pBox");
                allPost.forEach((box) => {
                    box.addEventListener("click", async() => {
                        new Content(box, socket)
                    });
                });
            });
        });
    }
    if (match.route.view == register && !online) {
        const button = document.getElementById("register-submit");
        button.addEventListener("click", async(e) => {
            e.preventDefault();
            await sendRegisterData(socket, await dataGathering("register"))
        });

    }
    if (match.route.view == login) {
        const button = document.getElementById("loginSubmit");
        button.addEventListener("click", async(e) => {
            e.preventDefault();
            sendLoginData(socket, await dataGathering("login"));
        });
    }
    socket.addEventListener("close", (event) => {
        console.log("WebSocket connection closed:");
    });
};

window.addEventListener("popstate", router);

document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("click", (e) => {
        if (e.target.matches("[data-link]")) {
            e.preventDefault();
            navigateTo(e.target.href);
        }
    });

    router();
});