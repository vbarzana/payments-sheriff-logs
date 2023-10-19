const CLS_PROFILE_LINK = 'profile-link';
const CLS_PROFILE_NAME = 'profile-name';
const CLS_INSTANCE_SECTION = 'instance-section';
const TAG_SSO_EXPANDER = 'SSO-EXPANDER';
const TAG_PORTAL_DASHBOARD = 'portal-dashboard';

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