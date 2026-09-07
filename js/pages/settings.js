/* =========================================
   CAMPUS CONNECT V2
   SETTINGS PAGE

   Handles:
   - Page authentication
   - Theme preference
   - Notification preference
   - Local settings storage
   - Account logout
   ========================================= */

"use strict";

import {
  initializeGuards
} from "../core/guards.js";

import {
  getStorage,
  setStorage
} from "../core/utils.js";

import {
  logout
} from "../core/auth.js";

import {
  showSuccess,
  showError
} from "../components/notifications.js";


/* =========================================
   SETTINGS STORAGE KEY
   ========================================= */

const SETTINGS_KEY =
  "campus_connect_settings";


/* =========================================
   DEFAULT SETTINGS
   ========================================= */

const DEFAULT_SETTINGS = {
  theme: "system",

  notifications: true
};


/* =========================================
   PAGE ELEMENTS
   ========================================= */

function getSettingsElements() {
  return {
    themeSelect:
      document.querySelector(
        "#theme-setting"
      ),

    notificationsToggle:
      document.querySelector(
        "#notifications-setting"
      ),

    logoutButton:
      document.querySelector(
        "[data-logout]"
      )
  };
}


/* =========================================
   GET SETTINGS
   ========================================= */

/**
 * Get saved Campus Connect settings.
 *
 * @returns {Object}
 */
function getSettings() {
  const savedSettings =
    getStorage(
      SETTINGS_KEY
    );


  if (
    !savedSettings ||
    typeof savedSettings !==
      "object"
  ) {
    return {
      ...DEFAULT_SETTINGS
    };
  }


  return {
    ...DEFAULT_SETTINGS,
    ...savedSettings
  };
}


/* =========================================
   SAVE SETTINGS
   ========================================= */

/**
 * Save Campus Connect settings.
 *
 * @param {Object} settings
 */
function saveSettings(
  settings
) {
  setStorage(
    SETTINGS_KEY,
    settings
  );
}


/* =========================================
   APPLY THEME
   ========================================= */

/**
 * Apply selected theme.
 *
 * @param {string} theme
 */
function applyTheme(
  theme
) {
  const root =
    document.documentElement;


  if (!root) {
    return;
  }


  /*
   System preference.
  */

  if (
    theme === "system"
  ) {
    root.removeAttribute(
      "data-theme"
    );

    return;
  }


  /*
   Light or dark mode.
  */

  root.setAttribute(
    "data-theme",
    theme
  );
}


/* =========================================
   LOAD SETTINGS INTO PAGE
   ========================================= */

function renderSettings() {
  const settings =
    getSettings();


  const {
    themeSelect,
    notificationsToggle
  } =
    getSettingsElements();


  if (themeSelect) {
    themeSelect.value =
      settings.theme;
  }


  if (notificationsToggle) {
    notificationsToggle.checked =
      Boolean(
        settings.notifications
      );
  }


  applyTheme(
    settings.theme
  );
}


/* =========================================
   UPDATE THEME
   ========================================= */

function handleThemeChange(
  event
) {
  const theme =
    event.target.value;


  const settings =
    getSettings();


  settings.theme =
    theme;


  saveSettings(
    settings
  );


  applyTheme(
    theme
  );


  showSuccess(
    "Theme updated",
    "Your appearance preference has been saved."
  );
}


/* =========================================
   UPDATE NOTIFICATIONS
   ========================================= */

function handleNotificationChange(
  event
) {
  const enabled =
    event.target.checked;


  const settings =
    getSettings();


  settings.notifications =
    enabled;


  saveSettings(
    settings
  );


  showSuccess(
    "Settings updated",
    enabled
      ? "Notifications have been enabled."
      : "Notifications have been disabled."
  );
}


/* =========================================
   LOGOUT
   ========================================= */

async function handleLogout() {
  try {
    /*
     Use the shared authentication system.
    */

    await logout();


    showSuccess(
      "Signed out",
      "You have been logged out successfully."
    );


    /*
     Redirect to login page.
    */

    setTimeout(
      () => {
        window.location.href =
          "login.html";
      },
      300
    );
  } catch (error) {
    console.error(
      "[Campus Connect] Logout error:",
      error
    );


    showError(
      "Logout failed",
      error.message ||
        "Please try again."
    );
  }
}


/* =========================================
   INITIALIZE EVENT LISTENERS
   ========================================= */

function initializeSettingsEvents() {
  const {
    themeSelect,
    notificationsToggle,
    logoutButton
  } =
    getSettingsElements();


  if (themeSelect) {
    themeSelect.addEventListener(
      "change",
      handleThemeChange
    );
  }


  if (notificationsToggle) {
    notificationsToggle.addEventListener(
      "change",
      handleNotificationChange
    );
  }


  if (logoutButton) {
    logoutButton.addEventListener(
      "click",
      handleLogout
    );
  }
}


/* =========================================
   INITIALIZE SETTINGS PAGE
   ========================================= */

export function initializeSettingsPage() {
  /*
   Protect this page.
  */

  const allowed =
    initializeGuards();


  if (!allowed) {
    return;
  }


  /*
   Load saved preferences.
  */

  renderSettings();


  /*
   Activate settings controls.
  */

  initializeSettingsEvents();
}


/* =========================================
   PAGE INITIALIZATION
   ========================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {
    initializeSettingsPage();
  }
);


/* =========================================
   GLOBAL API
   ========================================= */

window.CampusConnectSettings = {
  initialize:
    initializeSettingsPage,

  get:
    getSettings,

  save:
    saveSettings,

  applyTheme
};