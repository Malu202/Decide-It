let leftButton = document.getElementById("leftButton");
let rightButton = document.getElementById("rightButton");
let decisionPage = document.getElementById("decisionPage");
let startButton = document.getElementById("startButton");
let optionsInput = document.getElementById("optionsInput");
let splitBySelect = document.getElementById("splitBySelect");
let optionsAmount = document.getElementById("optionsAmount");
let progressBar = document.getElementById("progressBar");

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
    let result = await mergeSort(arr);
    result.reverse();
    leftButton.innerText = "";
    rightButton.innerText = "";
    leftButton.disabled = true;
    rightButton.disabled = true;
    progressBar.value = 1;

    console.log(decisions + " decisions");
    console.log(result);
    alert(result.join("\n"));
    progressBar.value = 0;
    return result;
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

    decide(arr);
});

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
