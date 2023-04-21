export function ContentReaction(id) {
    // like and dislike button
    const likeBtn = document.querySelectorAll("#pbDislikebtn,#pbLikebtn");

    likeBtn.forEach((btn) => {
        btn.addEventListener("click", async(event) => {
            console.log("like button clicked");
            if (btn.id == "pbDislikebtn") {
                console.log("dislike button clicked");
            } else if (btn.id == "pbLikebtn") {
                console.log("like button clicked");
            }
        });
    });
}