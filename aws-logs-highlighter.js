const SECONDS_DIFF_TO_HIGHLIGHT = 14;

function findTimestampColumn(frame) {
    let pos = -1;
    frame.querySelectorAll('.logs-table__header-row .logs-table__header-cell').forEach((cell, idx) => {
        if (cell.innerHTML.indexOf('timestamp') > 0) {
            pos = idx + 1;
            return true;
        }
    });
    return pos;
}

function parseTimestamp(timestamp) {
    // Convert the timestamp string to a Date object
    return new Date(timestamp);
}

function isNSecondsBefore(date1, date2, seconds = SECONDS_DIFF_TO_HIGHLIGHT) {
    // Calculate the time difference in milliseconds between two Date objects
    const timeDifference = Math.abs(date1 - date2);
    const msThreshold = seconds * 1000; // 30 seconds in milliseconds
    return timeDifference >= msThreshold;
}

function formatMilliseconds(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');

    return `${formattedMinutes} min ${formattedSeconds} seconds`;
}

function highlightTimestampsInFrame(frame) {
    const allCells = Array.from(frame.querySelectorAll('.logs-table__body-cell'));
    for (let cell of allCells) {
        // matches error inside any string, except in /error/ or /errors/ or errorUrl
        if (cell.innerHTML.match(/(\s*error\s*)(?!Url\b|\/)/gi)) {
            cell.style.color = 'red';
        }
        if (cell.innerHTML.indexOf('startPaymentGateway_INITRequest') >= 0) {
            cell.style.fontWeight = 'bold';
            cell.style.fontFamily = 'Amazon Ember';
            cell.style.fontSize = '14px';
        }
    }
    clickOnAwsAccess12hOnExpand(frame);
    changeDocumentTitleIfDifferent(frame);
    if (isQueryRunning(frame)) {
        return;
    }
    const timestampPos = findTimestampColumn(frame);
    const timestampNodes = frame.querySelectorAll(
        `.logs-table__body-cell:nth-child(${timestampPos})`
    );

    const timestamps = Array.from(timestampNodes);

    for (let i = 0; i < timestamps.length - 1; i++) {
        const currentTimestamp = parseTimestamp(timestamps[i].innerHTML);
        const nextTimestamp = parseTimestamp(timestamps[i + 1].innerHTML);

        if (isNSecondsBefore(currentTimestamp, nextTimestamp)) {
            // Apply the yellow background color directly to the DOM node
            timestamps[i].style.color = '#ec7211';
            const formattedTime = formatMilliseconds(Math.abs(currentTimestamp - nextTimestamp));

            timestamps[i].title = `Operation took ${formattedTime}`
        }
    }
}

function isQueryRunning(frame) {
    const btn = frame.querySelector('[data-testid="scroll-run-query"] button');
    return btn && btn.disabled;
}

function highlightTimestampsOnPage() {
    try {
        highlightTimestampsInFrame(document);
    } catch (err) {
        console.log(err);
    }
    const iframes = window.frames;
    for (let i = 0; i < iframes.length; i++) {
        try {
            highlightTimestampsInFrame(iframes[i].document);
        } catch (err) {
            if (err.message.indexOf('Blocked a frame') < 0) {
                console.warn(err);
            }
        }
    }
}

let isPortalOpen = false;
let portalTimeout;

function openPortal() {
    if (isPortalOpen || !isStartPage()) {
        return clearTimeout(portalTimeout);
    }
    let portalBtn = document.getElementsByTagName('portal-application')[0];
    if (!portalBtn) {
        return portalTimeout = setTimeout(openPortal, 300);
    }
    try {
        console.log('Portal button loaded, clicking it for you! Your sheriff life just got easier :)');
        portalBtn.click();
        const searchInput = document.querySelector('sso-search input');
        searchInput.focus();
    } catch (err) {
        console.log('Could not open profiles or focus search input', err);
    }
}

function changeDocumentTitleIfDifferent(frame) {
    const breadcrumbs = getBreadcrumbs(frame);
    const activeBreadcrumb = breadcrumbs[breadcrumbs.length - 1];
    if (activeBreadcrumb && activeBreadcrumb.textContent && isInCloudWatchLogs(frame)) {
        const newTitle = activeBreadcrumb.textContent.toUpperCase() || document.title;
        if (document.title !== newTitle) {
            document.title = newTitle;
        }
    }
}

function isStartPage() {
    return location.href.indexOf('.awsapps.com/start') >= 0;
}

function getBreadcrumbs(frame) {
    return frame.getElementsByClassName('awsui-breadcrumb');
}

function isInCloudWatchLogs(frame) {
    const breadcrumbs = getBreadcrumbs(frame);
    const firstBreadcrumb = breadcrumbs[0];
    return firstBreadcrumb && firstBreadcrumb.textContent && firstBreadcrumb.textContent.indexOf('CloudWatch') >= 0;
}

async function wait(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms || 1000);
    });
}

async function expandableElementClickHandler(event) {
    if (!event || !event.target
        || event.target.classList.contains('profile-link')) {
        return;
    }
    await wait(1000);
    const parentSection = findParentInstanceSection(event.target);
    let expander;
    if (parentSection && parentSection.nextElementSibling && parentSection.nextElementSibling.classList.contains('sso-expander')) {
        expander = parentSection.nextElementSibling;
    } else {
        expander = document.querySelector('sso-expander');
    }

    if (!expander) {
        return;
    }
    const aws12hProfile = Array.from(expander.querySelectorAll('.profile-name')).find((el) => el.textContent.indexOf('Access12h') >= 0);
    try {
        aws12hProfile && aws12hProfile.nextElementSibling.click();
    } catch (err) {
        console.error(err);
    }
}

function findParentInstanceSection(node) {
    if (!node) {
        return;
    }
    if (node.classList.contains('instance-section')) {
        return node;
    }
    return findParentInstanceSection(node.parentNode);
}

let element;

function clickOnAwsAccess12hOnExpand(frame) {
    if (!isStartPage() || element || !frame || !frame.querySelector) {
        return;
    }
    element = frame.querySelector('sso-search-result-list');
    element && element.addEventListener('click', expandableElementClickHandler);
}

function start() {
    openPortal();
    setInterval(function () {
        highlightTimestampsOnPage();
    }, 3000);
    // add more initializers here
}

start();