"use strict";

var descriptions;
var selectedDistrict;

function showSelected() {
    // Check if there's a district already selected and update info if so
    const selectedDistricts = document.getElementsByClassName("selected");
    if (selectedDistricts.length) {
        showInfo(selectedDistricts[0].id);
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

function loadMap() {
    // Ajax load the SVG
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "sharn_css_cleared_elem_style.svg", false);
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
            selectDistrict(district);
        });
        district.addEventListener("hover", () => {
            // TODO: show information, so long as we're hovering
        });
    }

    // Add JSON upload handler
    const jsonInput = document.getElementById("jsonInput");
    jsonInput.onchange = () => {
        const uploadedJson = jsonInput.files[0];
        uploadedJson.text().then(setDescriptionsFromJson);
    };
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
    const wardNames = {
        "C": "Central Plateau",
        "M": "Menthis Plateau",
        "T": "Tavick's Landing",
        "N": "Northedge",
        "D": "Dura"
    };
    const ward = document.getElementById("ward");

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
    let wardName;
    for (const key in wardNames) {
        if (Object.hasOwnProperty.call(wardNames, key)) {
            const currentWard = wardNames[key];
            if (districtId.startsWith(key)) {
                wardName = currentWard;
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
        wardName = "Cliffside";
        upperName = descEntry["name"];
        upperDesc = marked(descEntry["description"]);
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

        upperDesc = marked(upperEntry["description"]);
        middleDesc = marked(middleEntry["description"]);
        lowerDesc = marked(lowerEntry["description"]);

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

    // Convenience for debugging + populating descriptions
    if ([upperName, middleName, lowerName, upperDesc, middleDesc, lowerDesc].includes("")) {
        lowerDesc += "\nID = " + districtId;
    }
    if (!isCliffside) {
        upperName = "Upper: " + upperName;
        middleName = "Middle: " + middleName;
        lowerName = "Lower: " + lowerName;
    }

    ward.innerText = wardName;
    upperDistrict.innerText = upperName;
    middleDistrict.innerText = middleName;
    lowerDistrict.innerText = lowerName;

    upperInfo.innerHTML = upperDesc;
    middleInfo.innerHTML = middleDesc;
    lowerInfo.innerHTML = lowerDesc;
}

function selectDistrict(district) {
    // Select a district and show information about it
    // Remove any other selected districts
    /* beautify preserve:start */
    document.getElementsByClassName("selected")[0]?.classList.remove("selected");
    /* beautify preserve:end */
    // And make this one selected
    district.classList.add("selected");
    showInfo(district.id);
}

loadMap();