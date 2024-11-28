const auctions = [];
const { start } = require("repl");
const { broadcast} = require("../wsserver");
const Auction = require("./Auction");

const lowestBinMap = new Map(); // based on IDS
const averageBinMap = new Map(); // based on IDS

function update(newAuctions) {
    // Instead of replacing, do a "smart" replace, remove what doesn't exist in newAuctions and add what doesn't exist in auctions
    // Using toString()
    if(!newAuctions.every(ac => ac instanceof Auction) || !auctions.every(ac => ac instanceof Auction)) {
        console.log("Something went wrong!");
        return;
    }

    const newAuctionsMap = new Map();
    newAuctions.forEach(auction => newAuctionsMap.set(auction.toString(), auction));

    const auctionsMap = new Map();
    auctions.forEach(auction => auctionsMap.set(auction.toString(), auction));

    const toRemove = auctions.filter(auction => !newAuctionsMap.has(auction.toString()));
    const toAdd = newAuctions.filter(auction => !auctionsMap.has(auction.toString()));

    toRemove.forEach(auction => auctions.splice(auctions.indexOf(auction), 1));
    auctions.push(...toAdd);

    // Fill lowest bin
    for(let i = 0; i < auctions.length; i++) {
        const auction = auctions[i];
        if(auction.isBin) {
            const id = auction.getItemID();
            const startingBid = auction.getStartingBid();
            if(id != null && id != undefined && id != "") {

                if (typeof startingBid !== 'number' || isNaN(startingBid)) {
                    console.warn(`Invalid starting bid for auction ${startingBid}`);
                    continue; // Skip this auction or handle it gracefully
                }
                
                if(lowestBinMap.has(id)) {
                    if(startingBid < lowestBinMap.get(id)) {
                        lowestBinMap.set(id, startingBid);
                    }
                } else {
                    lowestBinMap.set(id, startingBid);
                }

                if(averageBinMap.has(id)) {
                    let bids = averageBinMap.get(id);
                    if(!Array.isArray(bids)) {
                        bids = [bids];
                    }
                    bids.push(auction.getStartingBid());

                    averageBinMap.set(id, bids);
                } else {
                    const array = [];
                    array.push(auction.getStartingBid());
                    averageBinMap.set(id, array);
                }
            }
        }
    }

    // Calculate average
    for(let [id, arr] of averageBinMap) {
        if(!Array.isArray(arr)) {
            arr = [arr];
        }

        const sum = arr.reduce((a, b) => a + b, 0);
        const average = sum / arr.length;
        averageBinMap.set(id, average);
    }

    // Best time to do checks to see if something's cheap
    findDeals();
}

function findDeals() {
    for(let i = 0; i < auctions.length; i++) {   
        const auction = auctions[i];
        if(auction.getItemID() === undefined) {
            continue;
        }

        // Find very cheap auctions that are not BIN and ending soon
        const price = (auction.isBin ? auction.getStartingBid() : auction.getHighestBid() == 0 ? auction.getStartingBid() : auction.getHighestBid());
        if(!auction.isBin && auction.isEndingSoon() && price < lowestBinMap.get(auction.getItemID())) {
            broadcast(JSON.stringify({
                type: "cheap",
                lowestBin: lowestBinMap.get(auction.getItemID()),
                price: price,
                auction: auction
            }));
        }

        // Find BIN auctions that are cheaper than average
        if(auction.isBin && price < averageBinMap.get(auction.getItemID()) && price < lowestBinMap.get(auction.getItemID())) {
            broadcast(JSON.stringify({
                type: "deal",
                lowestBin: lowestBinMap.get(auction.getItemID()),
                price: price,
                auction: auction
            }));
        }
    }
}

function getAuctions() {
    return auctions;
}

module.exports = {update, findDeals, getAuctions};