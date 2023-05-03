import { router } from "../index.js";

export const navigateTo = (url) => {
    history.pushState(null, null, url);
   router();
};