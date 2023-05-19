"use strict";

/////////////////////////////////////////
//Variables
let apiResults = [];
let counter = 0;
const getDataBtn = document.getElementById("get-data-btn");
const startGenerationBtn = document.getElementById("start-generation-btn");
//const downloadCsvBtn = document.getElementById("download-csv-btn");
const generateCsvBtn = document.getElementById("generate-csv");
const okDiv = document.getElementById("okDiv");
const alarmDiv = document.getElementById("alarmDiv");
const isGenStartedDiv = document.getElementById("isGen-started");

//show the data from api and show the array if there is something
getDataBtn.addEventListener("click", function () {
  fetch("https://api.coindesk.com/v1/bpi/currentprice.json")
    .then((response) => response.json())
    .then((data) => {
      const price = data.bpi.USD.rate;
      const cryptoDataDiv = document.getElementById("crypto-data");
      cryptoDataDiv.textContent = `Current Bitcoin Price: ${price} USD`;
    })
    .catch((error) => console.error(error));
  visualizeArray();
});

function visualizeArray() {
  const visualizeDiv = document.getElementById("visualize-array");
  let tableHtml =
    "<table><thead><tr><th>Price</th><th>Time</th></tr></thead><tbody>";
  const maxRows = Math.min(apiResults.length, 50);
  for (let i = apiResults.length - 1; i >= apiResults.length - maxRows; i--) {
    tableHtml += `<tr><td>${apiResults[i].price}</td><td>${apiResults[i].time}</td></tr>`;
  }
  tableHtml += "</tbody></table>";
  visualizeDiv.innerHTML = tableHtml;
}

startGenerationBtn.addEventListener("click", function () {
  setInterval(() => {
    fetch("https://api.coindesk.com/v1/bpi/currentprice.json")
      .then((response) => response.json())
      .then((data) => {
        const result = {
          price: data.bpi.USD.rate_float,
          time: new Date().toLocaleString(),
        };
        apiResults.push(result);
        console.log(apiResults);
      })
      .catch((error) => console.error(error));
  }, 60000);
  isGenStartedDiv.style.display = "block";
  console.log("Generation interval started");
});

generateCsvBtn.addEventListener("click", function () {
  const csv = apiResults.map((row) => Object.values(row).join(",")).join("\n");
  const filename = "manuallyGenerated_" + new Date().toISOString() + ".csv";
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
});

const checkArray = () => {
  //const interval = setInterval(() => {
  if (apiResults.length >= counter) {
    okDiv.style.display = "block";
    alarmDiv.style.display = "none";
  } else {
    okDiv.style.display = "none";
    alarmDiv.style.display = "block";
  }
  //counter = apiResults.length;
  //}, 120000);
  //return interval;
};

//checkArray();

//Midnight task**************************************************************
//************************************************************************

//last prompt - prevent page from closing
window.addEventListener("beforeunload", function (e) {
  e.preventDefault();
  e.returnValue = "";
});

//write the csv function with empty array
const writeCSV = () => {
  const csv = apiResults.map((row) => Object.values(row).join(",")).join("\n");
  const filename = "Report" + new Date().toISOString() + ".csv";
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  // Empty the apiResults array and reset the counter to zero
  apiResults = [];
  counter = 0;
};

// Schedule the writeCSV function to run every minute
//setInterval(writeCSV, 60000);
setInterval(visualizeArray, 60000);
setInterval(checkArray, 120000);
