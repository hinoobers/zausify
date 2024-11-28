const axios = require("axios");
const Auction = require("./auction/Auction");
const auctionManager = require("./auction/AuctionManager");
let lastUpdate = 0;


async function fetchPage(page) {
    const res = await axios.get("https://api.hypixel.net/v2/skyblock/auctions", {
        params: {
            page: page
        }
    });
    return res.data;
}

let fetching = false;
setInterval(async () => {
    if(fetching) return;
    fetching = true;

    try {
        const first = await fetchPage(0);

        const auctions = [];
        if(first && first.success) {
            const lastUpdated = first.lastUpdated;
            if(lastUpdated === lastUpdate) {
                auctionManager.findDeals();
                return;
            }

            lastUpdate = first.lastUpdated;

            const prom = [];
    
            for(let i = 0; i < first.totalPages; i++) {
                prom.push(
                    fetchPage(i).then(data => {
                        if(data && data.auctions) {
                            data.auctions.forEach(auction => {
                                auctions.push(new Auction(auction));
                            })
                        }
                    }).catch(err => {
                        console.error("Error fetching page " + i);
                    })
                )
            }
    
            await Promise.all(prom);
    
        }

        console.log("Fetched " + auctions.length + " auctions");
        auctionManager.update(auctions);
    } catch(err) {
        console.log("Error during fetching process", err);
    } finally {
        fetching = false;
    }
}, 1000);