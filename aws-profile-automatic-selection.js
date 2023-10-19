const CLS_PROFILE_LINK = 'profile-link';
const CLS_PROFILE_NAME = 'profile-name';
const CLS_INSTANCE_SECTION = 'instance-section';
const TAG_SSO_EXPANDER = 'SSO-EXPANDER';
const TAG_PORTAL_DASHBOARD = 'portal-dashboard';
const MSG_TYPE_PROFILE_CHANGED = 'profile-changed';

function isStartPage() {
    return location.href.indexOf(START_PAGE_URL_SUFFIX) >= 0;
}

async function wait(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms || 1000);
    });
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

async function expandableElementClickHandler(event) {
    if (!event || !event.target
        || event.target.classList.contains(CLS_PROFILE_LINK)) {
        return;
    }
    await wait(300);
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
    let profileToSelect = availableProfiles[0];
    if (availableProfiles.length > 1) {
        // first we capture the first 12h profile because it lasts longer
        profileToSelect = availableProfiles.find((el) => el.textContent.indexOf('Access12h') >= 0);
        if (!profileToSelect) {
            // otherwise we fallback to the first admin profile
            profileToSelect = availableProfiles.find((el) => el.textContent.indexOf('Admin') >= 0);
        }
    }
    try {
        if (profileToSelect && profileToSelect.nextElementSibling) {
            profileToSelect.nextElementSibling.click();
        }

    } catch (err) {
        console.log('Failed to click on profile', err);
    }
}

function findParentInstanceSection(node) {
    if (!node || !node.classList) {
        return;
    }
    if (node.classList.contains(CLS_INSTANCE_SECTION)) {
        return node;
    }
    return findParentInstanceSection(node.parentNode);
}

let portalContainer = false;

function clickOnAwsAccess12hOnExpand() {
    if (!isStartPage() || !document.querySelector) {
        return;
    }

    if (!portalContainer) {
        portalContainer = document.querySelector(TAG_PORTAL_DASHBOARD);
        portalContainer && portalContainer.addEventListener('click', expandableElementClickHandler);
    }
}