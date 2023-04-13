import login from "./js/login.js";
import register from "./js/register.js";
import blamer from "./js/blamer.js";
import profile from "./js/profile.js";
import logout from "./js/logout.js";
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

const navigateTo = (url) => {
       history.pushState(null, null, url);
       router();
};

const router = async () => {
       const routes = [
              //    { path: "/", view: Dashboard },
              {
                     path: "/blamer",
                     view: blamer,
              },
              {
                     path: "/register",
                     view: register,
              },
              {
                     path: "/login",
                     view: login,
              },
              {
                     path: "/profile",
                     view: profile,
              },
              {
                     path: "/logout",
                     view: logout,
              },
       ];

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

       document.querySelector("#app").innerHTML = await view.getHtml();
       if (match.route.view == blamer) {
              if (
                     document.getElementById("activeUserName") !== null &&
                     document.getElementById("activeUserName").textContent !==
                            "guest"
              ) {
                     // click on post button will post content
                     document
                            .getElementById("letPost")
                            .addEventListener("click", async (e) => {
                                   console.log("im working on posting");
                                   e.preventDefault();
                                   const form = document.querySelector("form");
                                   const data = new FormData(form);
                                   const values = {};
                                   for (let [key, value] of data.entries()) {
                                          values[key] = value;
                                   }
                                   if (values.Content !== "" && values.Topics !== "" && values.Title !== "" 
                                   && values.Content !== undefined && values.Topics !== undefined && values.Title !== undefined) {
                                          console.log(values);
                                   const response = await fetch("/blamer", {
                                          method: "POST",
                                          headers: {
                                                 "Content-Type":
                                                        "application/json",
                                          },
                                          body: JSON.stringify(values),
                                   });
                                   if (response.status === 200) {
                                          navigateTo("/blamer");
                                   }
                            }
                            });

                     // delete cookie when click logout button
                     document
                            .getElementById("logout")
                            .addEventListener("click", async (e) => {
                                   e.preventDefault();
                                   const logout =
                                          document.querySelector("#logout");
                                   if (e) {
                                          const response = await fetch(
                                                 "/logout",
                                                 {
                                                        method: "POST",
                                                 }
                                          );
                                          //delete cookie
                                          document.cookie =
                                                 "forum_session_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                                          console.log(response);
                                          if (response.status === 200) {
                                                 navigateTo("/blamer");
                                          }
                                   }
                            });
                     
              } else if (
                     document.getElementById("activeUserName") !== null &&
                     document.getElementById("activeUserName").textContent ===
                            "guest"
              ) {
                     let postBox = document.getElementById("cPostBox");
                    postBox.remove()
              }
              // click on post box will show post content
              let allPost = document.querySelectorAll(".pBox");
              allPost.forEach((box) => {
                     box.addEventListener("click", async () => {
                            view.blameContent(box);
                     });
              });
              // click on topic will show only posts belong to that topic

              document.querySelectorAll(".bTopic").forEach((topic) => {
                     topic.addEventListener("click", async () => {
                            if (topic.className === "bTopic") {
                            view.updatedPostList(
                                   topic.querySelector(".tName").textContent
                            );}
                            allPost = document.querySelectorAll(".pBox");
                            allPost.forEach((box) => {
                                   box.addEventListener("click", async () => {
                                          view.blameContent(box);
                                   });
                            });
                     });
              });
       }
       if (match.route.view == register) {
              console.log("register js");
              const button = document.getElementById("register-submit");
              button.addEventListener("click", async (e) => {
                     e.preventDefault();
                     readForm("/api/registerData");
              });
       }
       if (match.route.view == login) {
              const button = document.getElementById("loginSubmit");
              button.addEventListener("click", async (e) => {
                     e.preventDefault();
                     const form = document.querySelector("form");
                     const data = new FormData(form);
                     const values = {};
                     for (let [key, value] of data.entries()) {
                            values[key] = value;
                     }

                     const response = await fetch("/api/loginData", {
                            method: "POST",
                            headers: {
                                   "Content-Type": "application/json",
                            },
                            body: JSON.stringify(values),
                     });
                     console.log(response);
                     if (response.ok) {
                            const user = await response.json();
                            console.log("user", user);
                            if (
                                   user.nickname !== "" &&
                                   user.nickname !== "wrong"
                            ) {
                                   console.log("user", user.nickname);
                                   // Set a cookie with the user's username
                                   document.cookie = `forum_session_id=${user.nickname}; path=/; max-age=3600;`;
                                   navigateTo("/blamer");
                            } else if (user.nickname === "") {
                                   console.log("password or username is wrong");
                            } else if (user.nickname === "wrong") {
                                   console.log("password or username is wrong");
                            }
                     } else {
                            alert("Invalid username or password");
                     }
              });
       }
};

window.addEventListener("popstate", router);

document.addEventListener("DOMContentLoaded", () => {
       document.body.addEventListener("click", (e) => {
              if (e.target.matches("[data-link]")) {
                     /*   console.log(
                            "link",
                            e.target,
                            e.target.matches("[data-link]")
                     ); */
                     e.preventDefault();
                     navigateTo(e.target.href);
              }
       });

       router();
});

async function readForm(address) {
       const form = document.querySelector("form");
       const data = new FormData(form);
       const values = {};
       for (let [key, value] of data.entries()) {
              values[key] = value;
       }
       console.log("values is :", values);
       const response = await fetch(address, {
              method: "POST",
              headers: {
                     "Content-Type": "application/json",
              },
              body: JSON.stringify(values),
       });
       const json = await response.json();
       console.log(json);
       return response;
}


/*  //webSocket connection
 const socket = new WebSocket("ws://localhost:8080/ws");

 const messageInput =
        document.getElementById("message-input");

 //  messageinput get event == enter will sent message to server
 messageInput.addEventListener("keydown", (event) => {
        if (
               event.key === "Enter" &&
               messageInput.value !== ""
        ) {
               const message = messageInput.value;
               messageInput.value = "";
               const payload = {
                      sender: document.getElementById(
                             "activeUserName"
                      ).textContent,
                      receiver: document.getElementById(
                             "bReceiver"
                      ).value,
                      content: message,
               };
               socket.send(JSON.stringify(payload));
        }
 });
 // update chatbox when receive message from server
 socket.onmessage = async (event) => {
        console.log("message", event.data);
        view.updatedChatBox(JSON.parse(event.data));
 };
 // update chatbox when click on chage chat name
 document
        .getElementById("bReceiver")
        .addEventListener("change", (event) => {
               view.updatedChatBox();
        });
  */