import login from "./js/login.js";
import register from "./js/register.js";
import blamer from "./js/blamer.js";
import profile from "./js/profile.js";
import logout from "./js/logout.js";
const pathToRegex = path => new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$");

const getParams = match => {
    const values = match.result.slice(1);
    const keys = Array.from(match.route.path.matchAll(/:(\w+)/g)).map(result => result[1]);

    return Object.fromEntries(keys.map((key, i) => {
        return [key, values[i]];
    }));
};

const navigateTo = url => {
    history.pushState(null, null, url);
    router();
};

const router = async () => {
    const routes = [
        //    { path: "/", view: Dashboard },
        {
            path: "/blamer",
            view: blamer
        },
        {
            path: "/register",
            view: register
        },
        {
            path: "/login",
            view: login
        },
        {
            path: "/profile",
            view: profile
        },
        {
            path: "/logout",
            view: logout
        }

    ];

    // Test each route for potential match
    const potentialMatches = routes.map(route => {
        return {
            route: route,
            result: location.pathname.match(pathToRegex(route.path))
        };
    });

    let match = potentialMatches.find(potentialMatch => potentialMatch.result !== null);

    if (!match) {
        match = {
            route: routes[0],
            result: [location.pathname]
        };
    }

    const view = new match.route.view(getParams(match));
    
    document.querySelector("#app").innerHTML = await view.getHtml();
    if (match.route.view == blamer) {
    if (document.getElementById("activeUserName").textContent !== "guest" && document.getElementById("activeUserName") !== null) {
        document.getElementById("logout").addEventListener("click", async (e) => {
            e.preventDefault();
            const logout = document.querySelector("#logout");
            if (e) {
                console.log("logout");
            }
        });
        document.getElementById("letPost").addEventListener("click", async (e) => {
            console.log("post");
            e.preventDefault();
            const form = document.querySelector("form");
            const data = new FormData(form);
            const values = {};
            for (let [key, value] of data.entries()) {
                values[key] = value;
            }
            const response = await fetch('/blamer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(values)
            });
            const json = await response.json();
            console.log(json);
        });
    } else if (document.getElementById("activeUserName").textContent === "guest"){
        console.log("guest");
        let postBox = document.getElementById("cPostBox")
        postBox.style.display = "none";
    }
    }
    if (match.route.view == register) {

        console.log("register");
        document.getElementById("register-submit").addEventListener("click", async (e) => {
            console.log("register-submit");
            e.preventDefault();

            const form = document.getElementById("register-form");
            const data = new FormData(form);
            const values = {};
            for (let [key, value] of data.entries()) {
                values[key] = value;
            }
            console.log("values is :",values);
            const response = await fetch('/register', {
                
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(values)
            }).then((response) => response.text()
            ).then
            (data => {console.log(values);document.getElementById("register-form").innerHTML = values.registerfname
            ;
        }).catch((error) => {
            console.error('Error:', error);
            });

         //   const json = await response.json();
        //    console.log("json file is:",json);


        });
    }
};

window.addEventListener("popstate", router);

document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("click", e => {
        if (e.target.matches("[data-link]")) {
            e.preventDefault();
            navigateTo(e.target.href);
        }
    });

    router();
});