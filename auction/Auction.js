const nbt = require('prismarine-nbt')

class Auction {
    uuid;
    itemName;
    isBin;
    itemBytes;
    itemID;
    startingBid;
    highestBid;
    category;
    tier;
    end;


    constructor(jsonData) {
        this.uuid = jsonData.uuid;
        this.itemName = jsonData.item_name;
        this.isBin = jsonData.bin;
        this.itemBytes = jsonData.item_bytes;
        this.startingBid = jsonData.starting_bid;
        this.highestBid = jsonData.highest_bid_amount;
        this.category = jsonData.category;
        this.tier = jsonData.tier;
        this.end = jsonData.end;

        this.decodeData(this.itemBytes, (error, json) => {
            if (error) {
                logger.error(error);
            }
            this.itemID = json.value.i.value.value[0].tag.value.ExtraAttributes.value.id.value;
        })
    }

    getName() {
        return this.itemName;
    }

    getItemID() {
        return this.itemID;
    }

    getHighestBid() {
        return this.highestBid;
    }

    getStartingBid() {
        return this.startingBid;
    }

    isEndingSoon() {
        // 5 minutes
        return this.end - Date.now() < 300000;
    }

    decodeData(string, callback) {
        const data = Buffer.from(string, 'base64');
        nbt.parse(data, (error, json) => {
            if (error) {
                logger.error(error);
            }
            return callback(error, json);
        });
    }

    toString() {
        return `${this.itemName} ${this.isBin ? "BIN" : "Auction"} ${this.itemBytes}`;
    }
}

module.exports = Auction;