// ==UserScript==
// @name         sb.ltn.fi Time Saved Column
// @namespace    NMA
// @version      1.6
// @description  Adds a "Time Saved" column to the video table on LTN site and populates it with the product of "Views" and "Duration" columns for each row. If category is 'poi_highlight', duration is calculated using the end time instead of the length.
// @author       ChatGPT, NoMoreAngel
// @match        https://sb.ltn.fi/*
// @updateURL    https://github.com/DrQuackster/userscripts/raw/main/sbltnfi/sbltnfi-time-saved-column.user.js
// @downloadURL  https://github.com/DrQuackster/userscripts/raw/main/sbltnfi/sbltnfi-time-saved-column.user.js
// @icon         https://sb.ltn.fi/static/browser/logo.png
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // Find the table element
    const table = document.querySelector('.table-hover');

    if (!table) return; // Exit if the table is not found

    // Find the header row and append a new cell with the "Time Saved" header
    const timeSavedHeader = document.createElement('th');
    timeSavedHeader.textContent = 'Time Saved';
    const headers = [...document.querySelectorAll("thead th")];
    const headerNames = headers.map(item => item.textContent.trim());
    const viewsIndex = headerNames.indexOf("Views");
    const categoryIndex = headerNames.indexOf("Category");
    headers[viewsIndex].after(timeSavedHeader);

    function addColumn() {
        // Find all the data rows and append a new cell with the product of "Views" and "Duration"
        table.querySelectorAll('tbody tr').forEach(row => {
            if (row.querySelector('td.time-saved')) return;

            const views = parseInt(row.children[viewsIndex].textContent);
            const category = categoryIndex !== -1 ? row.children[categoryIndex].textContent.trim() : '';
            let duration;

            if (category === 'poi_highlight') {
                const endColumn = headerNames.indexOf("End");
                const endTime = row.children[endColumn].textContent.trim();
                const [endHours, endMinutes, endSeconds] = endTime.split(':').map(parseFloat);
                duration = (endHours * 3600 + endMinutes * 60 + endSeconds) || 0;
            } else {
                const lengthIndex = headerNames.indexOf("Length");
                duration = row.children[lengthIndex].textContent
                    .split(':')
                    .map(time => parseFloat(time))
                    .reduce((total, time) => total * 60 + time) || 0;
            }

            const timeSaved = views * duration;
            const timeSavedCell = document.createElement('td');
            timeSavedCell.classList.add("time-saved");
            timeSavedCell.textContent = formatTime(timeSaved);
            row.children[viewsIndex].after(timeSavedCell);
        });
    }

    addColumn();
    document.addEventListener("newSegments", (e) => addColumn());

    // Format the time in DD:HH:MM:SS format
    function formatTime(timeInSeconds) {
        const days = Math.floor(timeInSeconds / (24 * 60 * 60));
        const hours = Math.floor(timeInSeconds / (60 * 60)) % 24;
        const minutes = Math.floor(timeInSeconds / 60) % 60;
        const seconds = Math.round(timeInSeconds % 60); // Round to nearest second
        let formattedTime = "";

        if (days > 0) {
            formattedTime += days + "d ";
        }

        if (hours > 0) {
            formattedTime += hours + "h ";
        }

        if (minutes > 0) {
            formattedTime += minutes + "m ";
        }

        formattedTime += seconds + "s"; // Use rounded seconds

        return formattedTime;
    }
})();
