const CLS_SSO_SEARCH_RESULT_LIST = 'sso-search-result-list';
const CLS_PORTAL_INSTANCE_RESULT_LIST = 'portal-instance-list';
const CLS_PROFILE_LINK = 'profile-link';
const CLS_PROFILE_NAME = 'profile-name';
const START_PAGE_URL_SUFFIX = '.awsapps.com/start';
const TAG_SSO_EXPANDER = 'SSO-EXPANDER';

function isStartPage() {
    return location.href.indexOf(START_PAGE_URL_SUFFIX) >= 0;
}

async function wait(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms || 1000);
    });
}

async function expandableElementClickHandler(event) {
    if (!event || !event.target
        || event.target.classList.contains(CLS_PROFILE_LINK)) {
        return;
    }
    await wait(500);
    const parentSection = findParentInstanceSection(event.target);
    let expander;
    const nextSibling = parentSection && parentSection.nextElementSibling;
    if (nextSibling && (
        nextSibling.classList.contains(TAG_SSO_EXPANDER.toLowerCase()) ||
        nextSibling.tagName === TAG_SSO_EXPANDER
    )) {
        expander = nextSibling;
    }

    if (!expander) {
        return;
    }
    const availableProfiles = Array.from(expander.querySelectorAll('.' + CLS_PROFILE_NAME));
    const aws12hProfile = availableProfiles.find((el) => el.textContent.indexOf('Access12h') >= 0);
    const firstAdminProfile = availableProfiles.find((el) => el.textContent.indexOf('Admin') >= 0);
    try {
        if (aws12hProfile && aws12hProfile.nextElementSibling) {
            aws12hProfile.nextElementSibling.click();
        } else if (firstAdminProfile && firstAdminProfile.nextElementSibling) {
            firstAdminProfile.nextElementSibling.click();
        }
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

let portalClickRegistered = false, ssoClickRegistered = false;

function clickOnAwsAccess12hOnExpand() {
    if (!isStartPage() || !document.querySelector) {
        return;
    }
    const ssoSearchResultList = document.querySelector(CLS_SSO_SEARCH_RESULT_LIST);
    const portalInstanceList = document.querySelector(CLS_PORTAL_INSTANCE_RESULT_LIST);

    if (!portalClickRegistered && portalInstanceList) {
        portalClickRegistered = true;
        portalInstanceList.addEventListener('click', expandableElementClickHandler);
    }
    if (!ssoClickRegistered && ssoSearchResultList) {
        ssoClickRegistered = true;
        ssoSearchResultList.addEventListener('click', expandableElementClickHandler);
    }
}

window.addEventListener('load', () => {
    setTimeout(start, 1000);
}, false);

function start() {
    clickOnAwsAccess12hOnExpand();
    setTimeout(clickOnAwsAccess12hOnExpand, 2000);
}