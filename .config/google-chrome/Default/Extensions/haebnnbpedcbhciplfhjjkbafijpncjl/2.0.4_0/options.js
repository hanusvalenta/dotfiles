// ===========================================
// This file holds the logic to set/save/load extension preferences.
// This includes changing the sort order and opening images in either the background, foreground or the current tab.
// ===========================================

// Detects the appropriate browser API (chrome for Chrome/Edge/Opera, browser for Firefox).
const getBrowserAPI = () => (typeof browser !== "undefined" ? browser : chrome);
const api = getBrowserAPI();

const tineye = {};

// Saves options to storage.
tineye.saveOptions = function () {
  const sortOrderRadio = document.getElementsByName("sort_order");
  const tabVisibilityRadio = document.getElementsByName("tab_visibility");

  for (let i = 0; i < sortOrderRadio.length; i++) {
    if (sortOrderRadio[i].checked) api.storage.local.set({ sort_order: sortOrderRadio[i].value });
  }

  for (let k = 0; k < tabVisibilityRadio.length; k++) {
    if (tabVisibilityRadio[k].checked)
      api.storage.local.set({ tab_visibility: tabVisibilityRadio[k].value });
  }
};

// Restores select box state to saved value from localStorage.
tineye.restoreOptions = function () {
  api.storage.local.get(["sort_order", "tab_visibility"], function (result) {
    let sortOrder = null;
    let tabVisibility = null;

    if (result.sort_order) {
      sortOrder = result.sort_order;
    } else {
      sortOrder = "last_used";
      api.storage.local.set({ sort_order: "last_used" });
    }

    if (result.tab_visibility) {
      tabVisibility = result.tab_visibility;
    } else {
      tabVisibility = "background";
      api.storage.local.set({ tab_visibility: "background" });
    }

    document.getElementById(sortOrder).checked = true;
    document.getElementById(tabVisibility).checked = true;
  });

  // Bind save to radio buttons.
  const sortOrderRadio = document.getElementsByName("sort_order");
  const tabVisibilityRadio = document.getElementsByName("tab_visibility");

  for (let i = 0; i < sortOrderRadio.length; i++) {
    sortOrderRadio[i].addEventListener("click", tineye.saveOptions, false);
  }

  for (let k = 0; k < tabVisibilityRadio.length; k++) {
    tabVisibilityRadio[k].addEventListener("click", tineye.saveOptions, false);
  }
};

// Load options
document.addEventListener("DOMContentLoaded", tineye.restoreOptions);
