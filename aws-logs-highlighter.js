const SECONDS_DIFF_TO_HIGHLIGHT = 14;
const SELECTOR_LOGS_HEADER = '.logs-table__header-row .logs-table__header-cell';
const START_PAGE_URL_SUFFIX = '.awsapps.com/start';
const CLOUDWATCH_PAGE_URL_SUFFIX = 'amazon.com/cloudwatch';

function findTimestampColumn(frame) {
    let pos = -1;
    frame.querySelectorAll(SELECTOR_LOGS_HEADER).forEach((cell, idx) => {
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
            try {
                fixCloudwatchLogsScrollProblem(iframes[i].document);
            } catch (err) {

            }
            highlightTimestampsInFrame(iframes[i].document);
        } catch (err) {
            if (err.message.indexOf('Blocked a frame') < 0) {
                console.warn(err);
            }
        }
    }
}

function changeDocumentTitleIfDifferent(frame) {
    const breadcrumbs = getBreadcrumbs(frame);
    const activeBreadcrumb = breadcrumbs[breadcrumbs.length - 1];
    if (activeBreadcrumb && activeBreadcrumb.textContent && isInCloudWatchLogs(frame)) {
        const newTitle = activeBreadcrumb.textContent.toUpperCase();
        updateDocumentTitle(newTitle);
    }
}

function updateDocumentTitle(newTitle) {
    if (document.title !== newTitle) {
        document.title = newTitle;
    }
}

function isStartPage() {
    return location.href.indexOf(START_PAGE_URL_SUFFIX) >= 0;
}

function isCloudWatch() {
    return location.href.indexOf(CLOUDWATCH_PAGE_URL_SUFFIX) >= 0;
}

function getBreadcrumbs(frame) {
    return frame.getElementsByClassName('awsui-breadcrumb');
}

function isInCloudWatchLogs(frame) {
    const breadcrumbs = getBreadcrumbs(frame);
    const firstBreadcrumb = breadcrumbs[0];
    return firstBreadcrumb && firstBreadcrumb.textContent && firstBreadcrumb.textContent.indexOf('CloudWatch') >= 0;
}

let scrollBound = false;

// Recently cloudwatch brought in a problem where the overlay is not positioned correctly
// hence, reading the logs is a pain. This function fixes that.
function fixCloudwatchLogsScrollProblem(frame) {
    const navBar = document.querySelector('#awsc-navigation-container');
    const overlay = frame.querySelector('.logs-table__wrapper .ReactModal__Overlay');
    const logsMainContainer = frame.querySelector('.logs__main');
    const logsTableWrapper = frame.querySelector('.logs-table__wrapper');

    if (navBar && overlay && logsMainContainer) {
        if (!scrollBound) {
            scrollBound = true;
            logsMainContainer.onscroll = fixCloudwatchLogsScrollProblem.bind(this, frame);
            if(logsTableWrapper) {
                logsTableWrapper.onclick = function(){
                    setTimeout(fixCloudwatchLogsScrollProblem.bind(this, frame), 1000);
                }
            }
        }
        const navBarHeight = navBar.clientHeight;
        let newTop = logsMainContainer.scrollTop - navBarHeight;
        if (newTop < 0) {
            newTop = 0;
        }
        if (overlay.style.position !== 'absolute') {
            overlay.style.position = 'absolute';
        }
        newTop = `${newTop + 10}px`;
        if (overlay.style.top !== newTop) {
            overlay.style.top = newTop;
        }
    }
}

window.addEventListener('load', () => {
    setTimeout(startEverything, 1000);
}, false);

function startEverything() {
    if (isStartPage()) {
        openPortal();
        clickOnAwsAccess12hOnExpand();
        setTimeout(clickOnAwsAccess12hOnExpand, 1000);
    } else if (isCloudWatch()) {
        highlightTimestampsOnPage();
        setInterval(function () {
            highlightTimestampsOnPage();
        }, 3000);
    }
}