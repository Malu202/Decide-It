let leftButton = document.getElementById("leftButton");
let rightButton = document.getElementById("rightButton");
let decisionPage = document.getElementById("decisionPage");
let startButton = document.getElementById("startButton");
let optionsInput = document.getElementById("optionsInput");
let splitBySelect = document.getElementById("splitBySelect");
let optionsAmount = document.getElementById("optionsAmount");
let progressBar = document.getElementById("progressBar");
let results = document.getElementById("results");
let history = document.getElementById("history");
let deleteHistory = document.getElementById("deleteHistory");
let inviteButton = document.getElementById("inviteButton");
let importFromOthersButton = document.getElementById("importFromOthersButton");
let importInput = document.getElementById("importInput");
let calculateTotal = document.getElementById("calculateTotal");

let decisions = 0;


function waitListener(element, listenerName) {
    return new Promise(function (resolve, reject) {
        var listener = event => {
            element.removeEventListener(listenerName, listener);
            resolve(event);
        };
        element.addEventListener(listenerName, listener);
    });
}

async function decide(arr) {
    decisions = 0
    leftButton.disabled = false;
    rightButton.disabled = false;
    let result = await mergeSort(shuffleArray(arr));
    result.reverse();
    leftButton.innerText = "";
    rightButton.innerText = "";
    leftButton.disabled = true;
    rightButton.disabled = true;
    progressBar.value = 1;

    console.log(decisions + " decisions");
    console.log(result);

    let ownResults = document.getElementById("ownResults");
    if (ownResults) ownResults.remove();
    createResultsOutput(arr, result, "Me")
    // results.appendChild(createResultsOutput(result, "Me"))
    saveToHistory(result);
    progressBar.value = 0;
    return result;
}
async function createResultsOutput(optionsArray, resultsArray, name) {
    let personResult = document.createElement("div");
    let nameDiv = document.createElement("label");
    if (name == null) name = "External"
    nameDiv.innerText = name + ':';
    let list = document.createElement("div");
    list.classList.add("resultsList");

    let listContent = [];
    for (let i = 0; i < resultsArray.length; i++) {
        listContent[i] = (i + 1) + ". " + resultsArray[i];
    }
    list.innerText = listContent.join("\n");

    personResult.appendChild(nameDiv);
    personResult.appendChild(list);
    if (name == "Me") {
        personResult.id = "ownResults";
        let shareResultButton = document.createElement("button");
        let encodedResults = await encodeResults(optionsArray, resultsArray);
        shareResultButton.innerText = "Copy: " + encodedResults;
        shareResultButton.addEventListener("click", function () {
            copyToClipboard(encodedResults);
        });
        personResult.appendChild(shareResultButton);
    } else {
        let deleteButton = document.createElement("button");
        deleteButton.innerText = "Delete";
        deleteButton.addEventListener("click", function () {
            results.removeChild(personResult);
        });
        personResult.appendChild(deleteButton);
    }
    results.insertBefore(personResult, results.childNodes[results.childNodes.length - 1]);
    // return personResult;
}

async function test() {
    let result = await decide([70, 50, 30])
    console.log(result);
    console.log("Decisions: " + decisions);
}
//test();

async function isBetterThan(value1, value2) {
    leftButton.innerText = value1;
    rightButton.innerText = value2;
    let event = await waitListener(decisionPage, "click");
    if (event.target.id == "rightButton") {
        decisions++;
        progressBar.value += 1 / expectedMaximumComparisons;
        return false;
    } else if (event.target.id == "leftButton") {
        decisions++;
        progressBar.value += 1 / expectedMaximumComparisons;
        return true;
    } else return await isBetterThan(value1, value2);
}

startButton.addEventListener("click", function () {
    updateURL();
    decide(parseInput());
});
optionsInput.addEventListener("change", function () {
    // parseInput();
    updateURL();
});
splitBySelect.addEventListener("change", function () {
    // parseInput();
    updateURL();
})
function parseInput() {
    let options = optionsInput.value;
    let splitBy = splitBySelect.value;
    if (splitBy == "newline") splitBy = '\n';
    let arr = options.split(splitBy);

    for (let i = arr.length - 1; i >= 0; i--) {
        //Concat whitespaces:
        arr[i] = arr[i].replace(/\s+/g, ' ');
        //Concat newlines
        arr[i] = arr[i].replace(new RegExp("[\r\n]+", 'g'), '\n');

        if (arr[i] == "" || arr[i] == " " || arr[i] == "\n" || arr[i] == "\r") arr.splice(i, 1);
    }
    optionsAmount.innerText = arr.length + " options detected => " + numberOfComparisons(arr.length) + " comparisons at max.";
    expectedMaximumComparisons = numberOfComparisons(arr.length);
    return arr;
}

let expectedMaximumComparisons = Infinity;
function numberOfComparisons(lengthOfArray) {
    let n = lengthOfArray;
    // return n * Math.log2(n) - (n - 1);
    // return n * Math.log2(n) - 2 * Math.log2(n) + 1;
    return Math.floor(n * Math.log2(n));
}


// Merging two sorted subarrays properly
async function merge(arr1, arr2) {
    // Make a new array, and 2 pointers to keep track of elements of arr1 and arr2     
    let res = [],
        i = 0,
        j = 0;

    // Loop until either arr1 or arr2 becomes empty
    while (i < arr1.length && j < arr2.length) {
        // If the current element of arr1 is lesser than that of arr2, push arr1[i] and increment i         
        if (await isBetterThan(arr2[j], arr1[i])) {
            // if (arr1[i] < arr2[j]) {
            res.push(arr1[i]);
            i++;
        } else {
            res.push(arr2[j]);
            j++;
        }
    }

    // Add the rest of the remining subarray, to our new array
    while (i < arr1.length) {
        res.push(arr1[i]);
        i++;
    }
    while (j < arr2.length) {
        res.push(arr2[j]);
        j++;
    }
    return res;
}

// Recursive merge sort
async function mergeSort(arr) {
    // Base case
    if (arr.length <= 1) return arr;

    // Splitting into two halves
    let mid = Math.floor(arr.length / 2);
    let left = await mergeSort(arr.slice(0, mid));
    let right = await mergeSort(arr.slice(mid));

    // merging the two sorted halves
    return await merge(left, right);
}

function createHistoryElement(array) {
    let historyElement = document.createElement("div");
    historyElement.innerText = array.join(',');
    historyElement.addEventListener("click", function () {
        optionsInput.value = array.join("\n");
    });

    history.insertBefore(historyElement, history.childNodes[0]);
}
function saveToHistory(array) {
    let storageJSON = JSON.parse(localStorage.getItem("Decide-It"));
    if (storageJSON == null && storageJSON.history == null) storageJSON.history = [array];
    else storageJSON.history.push(array);
    localStorage.setItem("Decide-It", JSON.stringify(storageJSON));
    createHistoryElement(array);
}

function loadHistory() {
    let storageJSON = JSON.parse(localStorage.getItem("Decide-It"));
    if (storageJSON == null || storageJSON.history == null) return;
    for (let i = 0; i < storageJSON.history.length; i++) {
        createHistoryElement(storageJSON.history[i])
    }
}
loadHistory();
deleteHistory.addEventListener("click", function () {
    localStorage.removeItem("Decide-It");
    history.innerText = "";
})

let sampleHistory = '{"history":[["Müsli","Toast","Spaghetti"],["3","2","1"],["Müsli","Toast","Spaghetti"],["3","2","1"],["Priester","Jäger","Mage"],["Müsli","Toast","Spaghetti"],["3","2","1"],["Müsli","Toast","Spaghetti"],["3","2","1"],["Priester","Jäger","Mage"],["Müsli","Toast","Spaghetti"],["3","2","1"],["Müsli","Toast","Spaghetti"],["3","2","1"],["Priester","Jäger","Mage"],["Müsli","Toast","Spaghetti"],["3","2","1"],["Müsli","Toast","Spaghetti"],["3","2","1"],["Priester","Jäger","Mage"],["nächstes ultralanges wort um zu überprüfen obst passt","ultra langes wort um abgeschnittenen text zu überprüfen","das wird teilweise umgebrochen, mal schauen obs passt"],["Löffel","Gabel","Messer"]]}';
function setSampleHistory() {
    localStorage.setItem("Decide-It", sampleHistory);
}
function shuffleArray(array) {
    //clone array to avoid overriding original order
    let shuffledArray = array.slice();
    var j, x, i;
    for (i = shuffledArray.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = shuffledArray[i];
        shuffledArray[i] = shuffledArray[j];
        shuffledArray[j] = x;
    }
    return shuffledArray;
}

function shareUrlToOS(shareUrl, title, then, notSupported) {
    if (navigator.share) {
        navigator.share({
            title: title,
            text: shareUrl,
            url: shareUrl
        }).then(() => {
            if (then) then();
        }).catch(err => {
            console.log(`Couldn't share because of`, err.message);
        });
    } else {
        if (notSupported) notSupported();
        console.log('web share not supported');
    }
}
function copyToClipboard(text, onerror, callback) {
    navigator.permissions.query({ name: "clipboard-write" }).then((result) => {
        if (result.state == "granted" || result.state == "prompt") {
            navigator.clipboard.writeText(text).then(() => {
                if (callback) callback()
            }, (e) => {
                if (onerror) onerror(e)
            });
        } else {
            if (onerror) onerror(result)
        }
    });
}

inviteButton.addEventListener("click", async function () {
    let shareUrl = updateURL();
    shareUrlToOS(shareUrl, 'Join the decision:', null, function () { alert("Sharing not supported. You can copy the URL from your address bar and send it to your friends to invite them.") });

})
function updateURL() {
    let options = parseInput();
    for (let i = 0; i < options.length; i++) {
        options[i] = options[i].replace(',', '');
    }
    options = options.join(',')
    let shareUrl;
    if (window.location.hostname != "") shareUrl = new URL(window.location.pathname, window.location.protocol + "//" + window.location.hostname);
    else shareUrl = new URL(window.location.pathname.slice(1))
    shareUrl.searchParams.set('options', encodeURIComponent(options));
    window.history.pushState({ info: "hi" }, "", shareUrl);
    return shareUrl;
}
function loadFromUrlQuery() {
    let urlSearchParams = new URLSearchParams(window.location.search);
    let params = Object.fromEntries(urlSearchParams.entries());
    if (!params.options) return;
    let options = decodeURIComponent(params.options).split(',');

    optionsInput.value = options.join('\n')
    parseInput();
}
loadFromUrlQuery();

importFromOthersButton.addEventListener("click", function () {
    let points = decodeResults(importInput.value);
    let options = parseInput();
    let resultsArray = pointsArrayToSortedArray(options, points);
    createResultsOutput(options, resultsArray, null);
})

async function encodeResults(arr, results) {
    let points = sortedArrayToPointsArray(arr, results);
    let outputSizeBits = points.length * 8;

    let outputArray = new Uint8Array(outputSizeBits / 8);
    outputArray.fill(1);

    let outputView = new DataView(outputArray.buffer);
    for (let i = 0; i < outputSizeBits / 8; i++) {
        outputView.setUint8(i, points[i])
    }
    console.log(points)
    console.log("encoding: " + points);
    console.log(await base64_arraybuffer(outputArray));
    // console.log(window.btoa(outputArray));
    return await base64_arraybuffer(outputArray);
}
function decodeResults(base64Results) {
    console.log("decoding:");
    // let weird = window.atob(base64Results);
    // let byteArray = Uint8Array.from(weird);
    // let view = new DataView(byteArray.buffer);

    // let points = []
    // for (let i = 0; i < byteArray.length; i++) {
    //     let point = view.getUint8(i);
    //     console.log("adding: " + point);
    //     points.push(point)
    // }
    let byteArray = window.atob(base64Results);
    let points = []
    for (let i = 0; i < byteArray.length; i++) {
        let point = byteArray.charCodeAt(i);
        points.push(point);
    }
    console.log(points)
    return points;
}
const base64_arraybuffer = async (data) => {
    // Use a FileReader to generate a base64 data URI
    const base64url = await new Promise((r) => {
        const reader = new FileReader()
        reader.onload = () => r(reader.result)
        reader.readAsDataURL(new Blob([data]))
    })

    /*
    The result looks like 
    "data:application/octet-stream;base64,<your base64 data>", 
    so we split off the beginning:
    */
    return base64url.split(",", 2)[1]
}



function sortedArrayToPointsArray(options, sortedResults) {
    if (options.length != sortedResults.length) return null;
    let points = [];
    for (let i = 0; i < options.length; i++) {
        for (let j = 0; j < sortedResults.length; j++) {
            if (options[i] == sortedResults[j]) points.push(options.length - j - 1);
        }
    }
    if (points.length != options.length) return null;
    return points;
}
// function pointsArrayToSortedArray(options, points) {
//     if (options.length != points.length) return null;
//     let sortedArray = [];
//     for (let i = 0; i < points.length; i++) {
//         sortedArray[points[i] - 1] = options[i];
//     }
//     sortedArray.reverse();
//     return sortedArray;
// }
function pointsArrayToSortedArray(options, points) {
    if (options.length != points.length) return null;
    let pointsArray = points.slice();
    let sortedArray = [];
    for (let i = 0; i < points.length; i++) {
        let highestScore = Math.max.apply(null, pointsArray);
        let highestScoreIndex = pointsArray.indexOf(highestScore);
        sortedArray.push(options[highestScoreIndex])
        pointsArray[highestScoreIndex] = -Infinity;
    }
    return sortedArray;
}
function rankingWithPossibleDraws(options, points) {
    let sortedArray = pointsArrayToSortedArray(options, points);
    let pointsSorted = points.sort(function (a, b) {
        return b - a;
    });
    let output = "";
    for (let i = 0; i < sortedArray.length; i++) {
        let place = i + 1;
        output += place + ". " + sortedArray[i] + " (" + pointsSorted[i] + " Pts.)\n";

        let samePlaceIndex = 1;
        while (i + samePlaceIndex < sortedArray.length && pointsSorted[i + samePlaceIndex] == pointsSorted[i]) {
            output += place + ". " + sortedArray[i + samePlaceIndex] + " (" + pointsSorted[i + samePlaceIndex] + " Pts.)\n";
            samePlaceIndex++;
        }
        i += samePlaceIndex - 1;
    }
    return output;
}

calculateTotal.addEventListener("click", function () {
    let persons = results.children;
    let options = parseInput();
    let totalPoints = [];
    for (let i = 0; i < persons.length; i++) {
        let htmlList = persons[i].getElementsByClassName("resultsList")[0].innerText;
        let sortedList = htmlList.split('\n');
        for (let j = 0; j < sortedList.length; j++) {
            sortedList[j] = sortedList[j].substring(sortedList[j].indexOf('.') + 2)
        }
        let pointList = sortedArrayToPointsArray(options, sortedList);
        if (pointList == null) {
            alert("Error, lists are not matching");
        }
        for (let k = 0; k < pointList.length; k++) {
            if (totalPoints[k] == null) totalPoints[k] = 0;
            totalPoints[k] += pointList[k];
        }
    }
    alert(rankingWithPossibleDraws(options, totalPoints))

})