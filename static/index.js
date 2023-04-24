import login from "./js/login.js";
import register from "./js/register.js";
import blamer from "./js/blamer.js";
import profile from "./js/profile.js";
import logout from "./js/logout.js";
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
};

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
            if (value){
                online = true;
            } else {
                online = false;
            }
          break;
        }
      }
     let routes = []
    if (online){
            routes = [
            {path: "/blamer",view: blamer,}, 
            {path: "/profile",view: profile,}
        ]
    }else{
        routes = [
            {path: "/login", view: login,},
            {path: "/register", view: register,}
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

    const loc = "ws://localhost:8080/api/data-route";

    const socket = new WebSocket(loc);

    socket.addEventListener("open", () => {
        console.log("WebSocket connection established.");
    });
    socket.addEventListener("error", (event) => {
        console.error("WebSocket error:", event);
    });
    socket.addEventListener("close", (event) => {
        console.log("WebSocket connection closed:", event);
    });
    socket.addEventListener("message", (event) => {
        console.log("WebSocket message:");
    });
    // make page
    document.querySelector("#app").innerHTML = await view.getHtml(socket);
    
    if (match.route.view == blamer && online
    ) {
        if (
            document.getElementById("activeUserName") !== null &&
            document.getElementById("activeUserName").textContent !==
            "guest"
        ) {
            // click on Chat to see contact list
            document.getElementById("bChatButton").addEventListener("click", (e) => {
                if (document.querySelectorAll(".bChatBox").length > 0) {
                    document.querySelectorAll(".bChatBox").forEach((box) => {
                        box.remove();
                    });
                }
                if (document.querySelectorAll(".bContactBox").length === 0) {
                    document.querySelectorAll(".bTopic").forEach((box) => {
                        box.style.height = "25px";
                    });
                    document.getElementById("bRightSideArea").appendChild(view.findContactList());
                } else if (document.querySelectorAll(".bContactBox").length > 0) {
                    document.querySelectorAll(".bTopic").forEach((box) => {
                        box.style.height = "100px";
                    });

                    document.querySelectorAll(".bContactBox").forEach((box) => {
                        box.remove()
                    });
                }
                if (document.querySelectorAll(".bChatBox")) {

                    const socketChat = new WebSocket("ws://localhost:8080/api/chat");
                    // update chatbox when receive message from server
                    socketChat.onmessage = async(event) => {
                        view.updatedChatBox(JSON.parse(event.data));
                    };

                    document.querySelectorAll(".bcButton").forEach((button) => {
                        button.addEventListener("click", async() => {
                            document.getElementById("bRightSideArea").appendChild(view.findChatBox(button.id));

                            view.updatedChatBox();
                            document.querySelectorAll(".bContactBox").forEach((box) => {
                                box.remove()
                            });
                            const messageInput = document.getElementById("message-input");
                            //  messageinput get event == enter will sent message to server
                            messageInput.addEventListener("keydown", async(event) => {
                                if (event.key === "Enter" && messageInput.value !== "") {
                                    const message = messageInput.value;
                                    messageInput.value = "";
                                    const payload = {
                                        sender: document.getElementById("activeUserName").textContent,
                                        receiver: document.getElementById("receiverName").textContent,
                                        content: message,
                                        time: new Date().toLocaleString(),
                                    };
                                    socketChat.send(
                                        JSON.stringify(
                                            payload
                                        )
                                    );
                                }
                            });
                        });
                    });
                    document.querySelectorAll(".bContactName").forEach((button) => {
                        button.addEventListener("click", async() => {
                            socket.send(JSON.stringify({"type":"profile","message":{"nickname":button.textContent}}))
                            navigateTo("/profile");
                        })

                  } );

                }

            });
            // click on post button will post content
            document.getElementById("letPost").addEventListener("click", async(e) => {
                    e.preventDefault();
                    console.log("post button clicked");
                    sendNewPostData(socket, await dataGathering("blameP"));
                });

            // delete cookie when click logout button
            document.getElementById("logout").addEventListener("click", async(e) => {
                e.preventDefault();
                    const logout =
                        document.querySelector("#logout");
                    if (e) {
                        const response = await fetch(
                            "/logout", {
                                method: "POST",
                            }
                        );
                        //delete cookie
                        document.cookie =
                            "sessionID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                        console.log(response);
                        if (response.status === 200) {
                            navigateTo("/login");
                        }
                    }
                });
        } else if (document.getElementById("activeUserName") !== null &&document.getElementById("activeUserName").textContent ==="guest") {
            let postBox = document.getElementById("cPostBox");
            postBox.remove();
        }
        // click on post box will show post content
        let allPost = document.querySelectorAll(".pBox");
        allPost.forEach((element) => {
            element.addEventListener("click", async() => {
                console.log("element", element)
             new Content(element,socket)
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
                        console.log("box", box)
                    new Content(box,socket)
                    });
                });
            });
        });
    }
    if (match.route.view == register&& !online) {
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
            e.preventDefault();
            sendLoginData(socket, await dataGathering("login"));
        });
    }
    if (match.route.view == profile && !online) {
      const userNavBtn = document.querySelectorAll(".userNavBtn")
      const userInfo = document.querySelectorAll(".userInfo")
      console.log("userNavBtn", userNavBtn)
        userNavBtn.forEach((btn) => {
            btn.addEventListener("click", (e) => {
            if (e.target.id === "aboutMeBtn") {
                userInfo.forEach((info) => {
                    if (info.id === "aboutMe") {
                        info.style.display = "block"
                    }else{
                        info.style.display = "none"
                    }
                })
            }
             if (e.target.id === "createdPostsBtn") {
                userInfo.forEach((info) => {
                    if (info.id === "createdPosts") {
                        info.style.display = "block"
                    }else{
                        info.style.display = "none"
                    }
                })
            }
             if (e.target.id === "likedPostsBtn") {
                userInfo.forEach((info) => {
                    if (info.id === "likedPosts") {
                        info.style.display = "block"
                    }else{
                        info.style.display = "none"
                    }
                })
            }
             if (e.target.id === "dislikedPostsBtn") {
                userInfo.forEach((info) => {
                    if (info.id === "dislikedPosts") {
                        info.style.display = "block"
                    }else{
                        info.style.display = "none"
                    }
                })
            }
        })
    })


    }
    socket.addEventListener("close", (event) => {
        console.log("WebSocket connection closed:", event);
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

