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
    results.insertBefore(createResultsOutput(result, "Me"), results.childNodes[results.childNodes.length - 2]);
    // results.appendChild(createResultsOutput(result, "Me"))
    saveToHistory(result);
    progressBar.value = 0;
    return result;
}
function createResultsOutput(results, name) {
    let personResult = document.createElement("div");
    let nameDiv = document.createElement("label");
    if (name == null) name = "External"
    nameDiv.innerText = name + ':';
    let list = document.createElement("div");

    let listContent = [];
    for (let i = 0; i < results.length; i++) {
        listContent[i] = (i + 1) + ". " + results[i];
    }
    list.innerText = listContent.join("\n");

    personResult.appendChild(nameDiv);
    personResult.appendChild(list);
    if (name == "Me") {
        personResult.id = "ownResults";
        let shareResultButton = document.createElement("button");
        shareResultButton.innerText = "Export";
        shareResultButton.addEventListener("click", function () {
            // shareUrlToOS()
        });
        personResult.appendChild(shareResultButton);
    }

    return personResult;
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
    var j, x, i;
    for (i = array.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = array[i];
        array[i] = array[j];
        array[j] = x;
    }
    return array;
}

function shareUrlToOS(shareUrl, title, then, notSupported) {
    if (navigator.share) {
        navigator.share({
            title: title,
            text: '',
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
}
loadFromUrlQuery();