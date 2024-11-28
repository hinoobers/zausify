const express = require("express");
const app = express();
const {getAuctions} = require("./auction/AuctionManager");

require("./functions");
app.use(express.static("public/"))

app.get("/auctions", async (req, res) => {
    // only show first 100
    const auctions = getAuctions().slice(0, 100);
    res.json(auctions);
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
})