/* =========================================
   CAMPUS CONNECT V2
   HEADER COMPONENT

   Handles:
   - Mobile sidebar menu button
   - Theme toggle
   - User dropdown
   - Header accessibility
   - Responsive header behaviour
   ========================================= */

"use strict";

import {
  STORAGE_KEYS
} from "../core/constants.js";

import {
  $,
  getStorage,
  setStorage
} from "../core/utils.js";

import {
  toggleSidebar,
  closeSidebar
} from "../core/navigation.js";


/* =========================================
   HEADER ELEMENTS
   ========================================= */

function getHeaderElements() {
  return {
    header:
      $(".header"),

    menuButton:
      $(".header-menu-button"),

    themeButton:
      $(".header-theme-button"),

    userButton:
      $(".header-user-button"),

    userMenu:
      $(".header-user-menu")
  };
}


/* =========================================
   THEME
   ========================================= */

/**
 * Get the currently active theme.
 *
 * @returns {"light"|"dark"}
 */
export function getTheme() {
  const theme =
    document.documentElement.getAttribute(
      "data-theme"
    );

  return theme === "dark"
    ? "dark"
    : "light";
}


/**
 * Apply a theme.
 *
 * @param {"light"|"dark"} theme
 */
export function setTheme(theme) {
  const newTheme =
    theme === "dark"
      ? "dark"
      : "light";


  if (newTheme === "dark") {
    document.documentElement.setAttribute(
      "data-theme",
      "dark"
    );
  } else {
    document.documentElement.removeAttribute(
      "data-theme"
    );
  }


  setStorage(
    STORAGE_KEYS.THEME,
    newTheme
  );


  updateThemeButton(
    newTheme
  );


  document.dispatchEvent(
    new CustomEvent(
      "theme:changed",
      {
        detail: {
          theme: newTheme
        }
      }
    )
  );
}


/**
 * Toggle between light and dark themes.
 *
 * @returns {"light"|"dark"}
 */
export function toggleTheme() {
  const currentTheme =
    getTheme();


  const newTheme =
    currentTheme === "dark"
      ? "light"
      : "dark";


  setTheme(
    newTheme
  );


  return newTheme;
}


/* =========================================
   UPDATE THEME BUTTON
   ========================================= */

function updateThemeButton(theme) {
  const {
    themeButton
  } =
    getHeaderElements();


  if (!themeButton) {
    return;
  }


  const isDark =
    theme === "dark";


  themeButton.setAttribute(
    "aria-pressed",
    String(isDark)
  );


  themeButton.setAttribute(
    "aria-label",
    isDark
      ? "Switch to light mode"
      : "Switch to dark mode"
  );


  themeButton.dataset.theme =
    theme;
}


/* =========================================
   INITIALIZE SAVED THEME
   ========================================= */

export function initializeTheme() {
  const savedTheme =
    getStorage(
      STORAGE_KEYS.THEME,
      null
    );


  if (
    savedTheme === "dark" ||
    savedTheme === "light"
  ) {
    setTheme(
      savedTheme
    );

    return;
  }


  /*
   Default to the user's system preference
   when no theme has been saved yet.
  */

  const prefersDark =
    window.matchMedia &&
    window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;


  setTheme(
    prefersDark
      ? "dark"
      : "light"
  );
}


/* =========================================
   USER MENU
   ========================================= */

export function isUserMenuOpen() {
  const {
    userMenu
  } =
    getHeaderElements();


  if (!userMenu) {
    return false;
  }


  return userMenu.classList.contains(
    "is-open"
  );
}


export function openUserMenu() {
  const {
    userButton,
    userMenu
  } =
    getHeaderElements();


  if (!userMenu) {
    return;
  }


  userMenu.classList.add(
    "is-open"
  );


  userMenu.setAttribute(
    "aria-hidden",
    "false"
  );


  if (userButton) {
    userButton.setAttribute(
      "aria-expanded",
      "true"
    );
  }
}


export function closeUserMenu() {
  const {
    userButton,
    userMenu
  } =
    getHeaderElements();


  if (!userMenu) {
    return;
  }


  userMenu.classList.remove(
    "is-open"
  );


  userMenu.setAttribute(
    "aria-hidden",
    "true"
  );


  if (userButton) {
    userButton.setAttribute(
      "aria-expanded",
      "false"
    );
  }
}


export function toggleUserMenu() {
  if (isUserMenuOpen()) {
    closeUserMenu();
  } else {
    openUserMenu();
  }
}


/* =========================================
   INITIALIZE HEADER
   ========================================= */

export function initializeHeader() {
  const {
    menuButton,
    themeButton,
    userButton,
    userMenu
  } =
    getHeaderElements();


  /* ---------------------------------------
     MOBILE MENU BUTTON
     --------------------------------------- */

  if (menuButton) {
    menuButton.addEventListener(
      "click",
      () => {
        closeUserMenu();

        toggleSidebar();
      }
    );
  }


  /* ---------------------------------------
     THEME BUTTON
     --------------------------------------- */

  if (themeButton) {
    themeButton.addEventListener(
      "click",
      () => {
        toggleTheme();
      }
    );
  }


  /* ---------------------------------------
     USER MENU BUTTON
     --------------------------------------- */

  if (userButton) {
    userButton.addEventListener(
      "click",
      (event) => {
        event.stopPropagation();

        toggleUserMenu();
      }
    );
  }


  /* ---------------------------------------
     CLICK OUTSIDE USER MENU
     --------------------------------------- */

  document.addEventListener(
    "click",
    (event) => {
      if (!isUserMenuOpen()) {
        return;
      }


      if (
        userMenu &&
        !userMenu.contains(
          event.target
        ) &&
        userButton &&
        !userButton.contains(
          event.target
        )
      ) {
        closeUserMenu();
      }
    }
  );


  /* ---------------------------------------
     ESCAPE KEY
     --------------------------------------- */

  document.addEventListener(
    "keydown",
    (event) => {
      if (
        event.key === "Escape" &&
        isUserMenuOpen()
      ) {
        closeUserMenu();

        if (userButton) {
          userButton.focus();
        }
      }
    }
  );


  /* ---------------------------------------
     CLOSE USER MENU ON RESIZE
     --------------------------------------- */

  window.addEventListener(
    "resize",
    () => {
      closeUserMenu();
    }
  );


  /* ---------------------------------------
     INITIAL ACCESSIBILITY STATE
     --------------------------------------- */

  if (userMenu) {
    userMenu.setAttribute(
      "aria-hidden",
      String(
        !userMenu.classList.contains(
          "is-open"
        )
      )
    );
  }


  if (userButton) {
    userButton.setAttribute(
      "aria-expanded",
      String(
        isUserMenuOpen()
      )
    );
  }
}


/* =========================================
   INITIALIZE COMPLETE HEADER SYSTEM
   ========================================= */

export function initializeHeaderComponent() {
  initializeTheme();

  initializeHeader();
}


/* =========================================
   GLOBAL API
   ========================================= */

window.CampusConnectHeader = {
  initialize:
    initializeHeaderComponent,

  getTheme,

  setTheme,

  toggleTheme,

  openUserMenu,

  closeUserMenu,

  toggleUserMenu,

  isUserMenuOpen
};