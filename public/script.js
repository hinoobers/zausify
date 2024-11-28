// handle websocket
// conenct

const socket = new WebSocket("ws://localhost:3001");
const loadedIds = []; // Prevent duplicates

socket.addEventListener("open", () => {
    console.log("Connected to server");
})

socket.addEventListener("message", (event) => {
    console.log("Message from server", event.data);
    const auction = JSON.parse(event.data);

    if(loadedIds.includes(auction.auction.itemID)) return;
    loadedIds.push(auction.auction.itemID);

    const minPrice = document.getElementById("minprice").value;
    if(auction.price < minPrice) return;

    const item = document.createElement("div");
    item.classList.add("item");

    const name = document.createElement("h3");
    name.innerText = `${auction.auction.itemName + (auction.auction.isBin ? " (BIN)" : " (BID)")}`;
    item.appendChild(name);

    const img = document.createElement("img");
    img.src = `https://sky.shiiyu.moe/item/${auction.auction.itemID}`;
    item.appendChild(img);

    const price = document.createElement("p");
    price.innerText = `Price: ${formatNumber(auction.price)}`;
    item.appendChild(price);

    const expPrice = document.createElement("p");
    expPrice.innerText = `LBIN: ${formatNumber(auction.lowestBin)}`;
    item.appendChild(expPrice);

    const profit = document.createElement("p");
    profit.innerText = `Profit: ${formatNumber(auction.lowestBin - (auction.price))}`;
    item.appendChild(profit);


    const copy = document.createElement("button");
    copy.innerText = "Copy";
    copy.addEventListener("click", () => {
        fallbackCopyTextToClipboard(`/viewauction ${auction.auction.uuid}`);
    })
    item.appendChild(copy);

    document.querySelector(".container").appendChild(item);

    // Setting
    if(document.getElementById("autoscroll").checked) {
        document.querySelector(".container").scrollTo(document.querySelector(".container").scrollWidth, 0);
    }
})

function formatNumber(num) {
    if(num < 1000) {
        return num;
    }

    if(num < 1000000) {
        return (num / 1000).toFixed(1) + "k";
    }

    if(num < 1000000000) {
        return (num / 1000000).toFixed(1) + "m";
    }

    return (num / 1000000000).toFixed(1) + "b";
}

function fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
  
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
  
    try {
      var successful = document.execCommand('copy');
      var msg = successful ? 'successful' : 'unsuccessful';
      console.log('Fallback: Copying text command was ' + msg);
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
    }
  
    document.body.removeChild(textArea);
  }
  function copyTextToClipboard(text) {
    if (!navigator.clipboard) {
      fallbackCopyTextToClipboard(text);
      return;
    }
    navigator.clipboard.writeText(text).then(function() {
      console.log('Async: Copying to clipboard was successful!');
    }, function(err) {
      console.error('Async: Could not copy text: ', err);
    });
  }