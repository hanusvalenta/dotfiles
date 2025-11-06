import { showNotification } from "./notifications.js";

// Get the appropriate browser API (chrome for Chrome/Edge/Opera, browser for Firefox).
const getBrowserAPI = () => (typeof browser !== "undefined" ? browser : chrome);
const api = getBrowserAPI();

const tineye = {};
tineye.SERVER = "tineye.com";
tineye.VERSION = "2.0.4";

/* 
  Detect the browser type from userAgent and set appropriate values 
  for BROWSER and contextMenuId.
*/
if (navigator.userAgent.includes("Edg")) {
  tineye.BROWSER = "edge";
  tineye.contextMenuId = "tineye-edge-ext";
} else if (navigator.userAgent.includes("OPR") || navigator.userAgent.includes("Opera")) {
  tineye.BROWSER = "opera";
  tineye.contextMenuId = "tineye-opera-ext";
} else if (navigator.userAgent.includes("Firefox")) {
  tineye.BROWSER = "firefox";
  tineye.contextMenuId = "tineye-firefox-ext";
} else {
  tineye.BROWSER = "chrome";
  tineye.contextMenuId = "tineye-chrome-ext";
}

/* 
  Set up the context menu when the extension is installed or updated, 
  or when the browser is updated to a new version.
  In Firefox, the API is `menus` instead of `contextMenus`, so we check for both.
*/
api.runtime.onInstalled.addListener(() => {
  (api.contextMenus || api.menus).create({
    id: tineye.contextMenuId,
    title: "Search Image on TinEye",
    contexts: ["image"],
  });
});

/* 
  When a user clicks on the TinEye extension icon in the extensions menu,  
  display a notification modal near the top-right corner, below the extensions menu. 
  NOTE: This is not a traditional popup, but a notification injected via JS.
*/
api.action.onClicked.addListener((tab) => {
  const iconURL = api.runtime.getURL("assets/tineye48.png");
  const messageText = "Right-click on an image to search.";
  const position = "top-right";

  api.scripting.executeScript({
    target: { tabId: tab.id },
    func: showNotification,
    args: [iconURL, messageText, position],
  });
});

/* 
  Handles the click event for the context menu item 
  and sends the selected image to TinEye.
*/
(api.contextMenus || api.menus).onClicked.addListener((info) => {
  // Retrieve user preferences for sort order and tab visibility from storage.
  api.storage.local.get(["sort_order", "tab_visibility"], (result) => {
    // Set default values if preferences are undefined.
    const sortOrder = result.sort_order || "best_match";
    const tabVisibility = result.tab_visibility || "background";

    // Generate the query string based on sort order preference.
    const sortOrderQueryString = tineye.sortOrder(sortOrder);
    const url = encodeURIComponent(info.srcUrl);

    // Check URL length; if over 30kb, redirect to an error page.
    const requestUrl =
      url.length < 30720
        ? "https://" +
          tineye.SERVER +
          "/search/?pluginver=" +
          tineye.BROWSER +
          "-" +
          tineye.VERSION +
          sortOrderQueryString +
          "&url=" +
          url
        : "https://" + tineye.SERVER + "/data_url_error";

    // Open the search URL in the specified tab visibility (background, foreground, or current).
    tineye.openUrl(tabVisibility, requestUrl);

    // Show modal only if the tab is set to open in the background.
    if (tabVisibility === "background") {
      const iconURL = api.runtime.getURL("assets/tineye48.png");
      const messageText = "TinEye search is running in a new tab.";
      const position = "bottom";

      api.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        api.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: showNotification,
          args: [iconURL, messageText, position],
        });
      });
    }
  });
});

// Generate the query string for the URL based on the user's sort order preference.
tineye.sortOrder = (sortOrder) => {
  let queryString = "";
  switch (sortOrder) {
    case "best_match":
      queryString = "&sort=score&order=desc";
      break;
    case "most_changed":
      queryString = "&sort=score&order=asc";
      break;
    case "biggest_image":
      queryString = "&sort=size&order=desc";
      break;
    case "newest":
      queryString = "&sort=crawl_date&order=desc";
      break;
    case "oldest":
      queryString = "&sort=crawl_date&order=asc";
      break;
    default:
      queryString = "";
  }
  return queryString;
};

// Open the search result in the specified tab type based on user preference.
tineye.openUrl = async (tabVisibility, url) => {
  let queryOptions = { currentWindow: true, active: true };
  // Get current tab
  let [tab] = await api.tabs.query(queryOptions);
  // Get new tab index and open new tabs next to current one.
  const newTabIndex = tab.index + 1;
  // Add openerTabId to provide better interop with other extensions.
  const openerTabId = tab.id;

  // Open the URL according to user settings.
  switch (tabVisibility) {
    case "background":
      api.tabs.create({
        url: url,
        active: false,
        index: newTabIndex,
        openerTabId,
      });
      break;
    case "foreground":
      api.tabs.create({
        url: url,
        active: true,
        index: newTabIndex,
        openerTabId,
      });
      break;
    case "current":
      api.tabs.update(tab.id, { url: url });
      break;
    default:
      api.tabs.create({
        url: url,
        active: false,
        index: newTabIndex,
        openerTabId,
      });
  }
};
