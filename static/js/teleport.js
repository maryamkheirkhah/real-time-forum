import { router } from "../index.js";

export const navigateTo = (url) => {
    console.log("navigateTo", url)
    history.pushState(null, null, url);
    router();
};