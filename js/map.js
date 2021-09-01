"use strict";

var descriptions;
var selectedDistrict;
var hoveredDistrict;
var helpInfo;

function showHelp() {
    // Show the help information from the landing screen
    document.getElementById("infobox").innerHTML = helpInfo;
}

function showSelected() {
    // Check if there's a district already selected and update info if so,
    // otherwise show help info
    if (selectedDistrict) {
        showInfo(selectedDistrict.id);
    } else {
        showHelp();
    }
}

function setDescriptionsFromJson(jsonText) {
    // Update descriptions variable based on JSON text
    try {
        descriptions = JSON.parse(jsonText);
    } catch (e) {
        alert(`Error with JSON file: ${e}`);
        setDefaultDescriptions();
    }
    showSelected();
}

function descriptionsFromUrl(url) {
    const xhr_json = new XMLHttpRequest();
    xhr_json.open("GET", url, false);
    xhr_json.onload = () => {
        console.log(`Loaded descriptions from ${url}`);
        setDescriptionsFromJson(xhr_json.responseText);
    };
    try {
        xhr_json.send();
    } catch (e) {
        alert(`Error loading from ${url}, ensure that CORS is enabled at target.`);
        setDefaultDescriptions();
    }
}

function setDefaultDescriptions() {
    if (typeof descriptions === "undefined") {
        descriptionsFromUrl("districtInfo.json");
    }
}

function initialize() {
    // Get help info
    helpInfo = document.getElementById("infobox").innerHTML;

    // Ajax load the SVG
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "sharn.svg", false);
    xhr.overrideMimeType("image/svg+xml");
    xhr.onload = (e) => {
        document.getElementById("map-container").append(xhr.responseXML.documentElement);
    };
    xhr.send();

    // As well as the JSON containing the district information
    // Check URL for query string with JSON file
    let urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("json")) {
        let jsonUrl = urlParams.get("json");
        descriptionsFromUrl(jsonUrl);
    } else {
        setDefaultDescriptions();
    }

    // Add class to SVG
    document.getElementsByTagName("svg")[0].classList.add("map");

    // Add click event listeners to districts
    const districts = document.querySelectorAll(".districts>path");
    for (const district of districts) {
        district.addEventListener("click", () => {
            if (selectedDistrict === district) {
                deselectDistrict();
            } else {
                selectDistrict(district);
            }
        });
    }

    // Add JSON upload handler
    const jsonInput = document.getElementById("jsonInput");
    jsonInput.onchange = () => {
        const uploadedJson = jsonInput.files[0];
        uploadedJson.text().then(setDescriptionsFromJson);
    };

    // Check hashtag in URL
    selectFromHash();
    window.addEventListener("hashchange", selectFromHash);
}

function selectFromHash() {
    // Select district based on hash in URL
    const hash = window.location.hash.substr(1);
    if (hash) {
        const hashRef = document.getElementById(hash);
        if (hashRef !== null) {
            selectDistrict(hashRef);
        }
    }
}

function addNotableLocations(names, descriptions, section) {
    // Add notable locations table to the given section
    if (names.length == 0) {
        return;
    }
    let table = document.createElement("table");
    table.classList.add("locationsTable");

    let theader = document.createElement("tr");

    const columnNames = ["Location", "Description"];
    columnNames.forEach(element => {
        let headerCell = document.createElement("th");
        headerCell.appendChild(document.createTextNode(element));
        theader.appendChild(headerCell);
    });

    table.appendChild(theader);

    for (let index = 0; index < names.length; index++) {
        const districtName = names[index];
        const districtDesc = descriptions[index];

        let trow = document.createElement("tr");
        let tName = document.createElement("td");
        let tDesc = document.createElement("td");

        tName.innerHTML = marked(districtName);
        tDesc.innerHTML = marked(districtDesc);

        trow.appendChild(tName);
        trow.appendChild(tDesc);

        table.appendChild(trow);
    }

    section.appendChild(table);
}

function showInfo(districtId) {
    const wardIds = {
        "C": "central",
        "M": "menthis",
        "T": "tavicks",
        "N": "northedge",
        "D": "dura"
    };
    const ward = document.getElementById("ward");
    const wardInfo = document.getElementById("wardInfo");

    const upperDistrict = document.getElementById("upperDistrict");
    const middleDistrict = document.getElementById("middleDistrict");
    const lowerDistrict = document.getElementById("lowerDistrict");

    const upperInfo = document.getElementById("upperInfo");
    const middleInfo = document.getElementById("middleInfo");
    const lowerInfo = document.getElementById("lowerInfo");

    const upperSection = document.getElementById("upperSection");
    const middleSection = document.getElementById("middleSection");
    const lowerSection = document.getElementById("lowerSection");

    // Determine ward name
    let isCliffside = true;
    let wardKey;
    for (const key in wardIds) {
        if (Object.hasOwnProperty.call(wardIds, key)) {
            const currentWard = wardIds[key];
            if (districtId.startsWith(key)) {
                wardKey = currentWard;
                isCliffside = false;
                break;
            }
        }
    }

    // Remove location information tables
    const locationTables = document.getElementsByClassName("locationsTable");
    for (const table of locationTables) {
        table.remove();
    }

    let upperName, middleName, lowerName;
    let upperDesc, middleDesc, lowerDesc;
    let upperLocs;
    const descEntry = descriptions[districtId];
    if (isCliffside) {
        wardKey = "cliffside";
        upperName = descEntry["name"];
        upperDesc = descToHtml(descEntry["description"]);
        upperLocs = descEntry["notableLocations"];

        middleName = "";
        lowerName = "";
        middleDesc = "";
        lowerDesc = "";
    } else {
        const upperEntry = descEntry["upper"];
        const middleEntry = descEntry["middle"];
        const lowerEntry = descEntry["lower"];

        upperLocs = upperEntry["notableLocations"];
        const middleLocs = middleEntry["notableLocations"];
        const lowerLocs = lowerEntry["notableLocations"];

        upperName = upperEntry["name"];
        middleName = middleEntry["name"];
        lowerName = lowerEntry["name"];

        upperDesc = descToHtml(upperEntry["description"]);
        middleDesc = descToHtml(middleEntry["description"]);
        lowerDesc = descToHtml(lowerEntry["description"]);

        const middleLocNames = middleLocs["name"];
        const lowerLocNames = lowerLocs["name"];

        const middleLocDescs = middleLocs["description"];
        const lowerLocDescs = lowerLocs["description"];

        addNotableLocations(middleLocNames, middleLocDescs, middleSection);
        addNotableLocations(lowerLocNames, lowerLocDescs, lowerSection);
    }
    // Handle upper locations the same regardless
    let upperLocNames = upperLocs["name"];
    let upperLocDescs = upperLocs["description"];
    addNotableLocations(upperLocNames, upperLocDescs, upperSection);

    // And handle ward names
    const wardEntry = descriptions[wardKey];
    const wardName = wardEntry["name"];
    const wardDesc = descToHtml(wardEntry["description"]);

    ward.innerText = wardName;
    if (isCliffside) {
        setDistrictName(upperDistrict, upperName, null);
        middleDistrict.innerHTML = "";
        lowerDistrict.innerHTML = "";
    } else {
        setDistrictName(upperDistrict, upperName, "upper");
        setDistrictName(middleDistrict, middleName, "middle");
        setDistrictName(lowerDistrict, lowerName, "lower");
    }

    wardInfo.innerHTML = wardDesc;
    upperInfo.innerHTML = upperDesc;
    middleInfo.innerHTML = middleDesc;
    lowerInfo.innerHTML = lowerDesc;

    const districtIdSpan = document.getElementById("districtId");
    districtIdSpan.innerText = districtId;
}

function setDistrictName(nameElement, name, height) {
    // Set a district name for a given height
    const nameText = document.createTextNode(name);
    // Clear the element
    nameElement.innerHTML = "";

    let direction;
    switch (height) {
        case "lower":
            direction = "down";
            break;
        case "middle":
            direction = "right";
            break;
        case "upper":
            direction = "up";
            break;
        default:
            // Cliffside district
            nameElement.appendChild(nameText);
            return;
    }

    const heightIcon = document.createElement("i");
    heightIcon.classList.add("heightIcon");
    heightIcon.classList.add("bi");
    // heightIcon.classList.add(`bi-arrow-${direction}-circle-fill`);
    heightIcon.classList.add(`bi-arrow-${direction}-square-fill`);

    nameElement.appendChild(heightIcon);
    nameElement.appendChild(nameText);
}

function descToHtml(description) {
    // Convert a markdown description to sanitised HTML
    return DOMPurify.sanitize(marked(description));
}

function selectDistrict(district) {
    // Select a district and show information about it
    const districtId = district.id;
    // Remove any other selected districts
    /* beautify preserve:start */
    selectedDistrict?.classList.remove("selected");
    /* beautify preserve:end */
    // And make this one selected
    selectedDistrict = district;
    district.classList.add("selected");
    // Update permalink pointer
    const districtLink = document.getElementById("districtLink");
    districtLink.setAttribute("href", `#${districtId}`);
    // Show district info
    showInfo(districtId);
}

function deselectDistrict() {
    // Deselect district in order to show help info
    /* beautify preserve:start */
    selectedDistrict?.classList.remove("selected");
    /* beautify preserve:end */
    selectedDistrict = null;
    showHelp();
}

initialize();