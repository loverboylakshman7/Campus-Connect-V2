/* =========================================
   CAMPUS CONNECT V2
   CORE NAVIGATION

   Handles:
   - Current page detection
   - Active navigation links
   - Page navigation
   - Mobile sidebar
   - Sidebar overlay
   - Responsive navigation behaviour
   ========================================= */

"use strict";

import {
  APP,
  ROUTES,
  STORAGE_KEYS
} from "./constants.js";

import {
  $,
  $$,
  getStorage,
  setStorage
} from "./utils.js";


/* =========================================
   CURRENT PAGE
   ========================================= */


/**
 * Get the current page filename.
 *
 * Examples:
 * index.html
 * assignments.html
 * profile.html
 *
 * @returns {string}
 */
export function getCurrentPage() {
  const pathname =
    window.location.pathname;


  const page =
    pathname
      .split("/")
      .pop();


  if (!page) {
    return "index.html";
  }


  return page;
}


/* =========================================
   CURRENT PATH
   ========================================= */


/**
 * Get the current relative path.
 *
 * @returns {string}
 */
export function getCurrentPath() {
  return window.location.pathname;
}


/* =========================================
   CHECK CURRENT PAGE
   ========================================= */


/**
 * Check whether a specific page is active.
 *
 * @param {string} page
 * @returns {boolean}
 */
export function isCurrentPage(page) {
  return getCurrentPage() === page;
}


/* =========================================
   PAGE LEVEL DETECTION
   ========================================= */


/**
 * Check whether the current page is inside
 * the /pages folder.
 *
 * @returns {boolean}
 */
export function isInsidePagesFolder() {
  const pathname =
    window.location.pathname;


  return pathname.includes(
    "/pages/"
  );
}


/* =========================================
   GET ROOT PREFIX
   ========================================= */


/**
 * Return the correct relative prefix based
 * on the current HTML page location.
 *
 * Root pages:
 * index.html
 * login.html
 *
 * Prefix:
 * ""
 *
 * Pages folder:
 * pages/assignments.html
 *
 * Prefix:
 * "../"
 *
 * @returns {string}
 */
export function getRootPrefix() {
  return isInsidePagesFolder()
    ? "../"
    : "";
}


/* =========================================
   NORMALIZE ROUTE
   ========================================= */


/**
 * Convert a route from constants.js into
 * the correct route for the current page.
 *
 * @param {string} route
 * @returns {string}
 */
export function normalizeRoute(route) {
  const prefix =
    getRootPrefix();


  return (
    prefix +
    route
  );
}


/* =========================================
   NAVIGATE TO PAGE
   ========================================= */


/**
 * Navigate to another Campus Connect page.
 *
 * @param {string} route
 */
export function navigateTo(route) {
  if (!route) {
    return;
  }


  const destination =
    normalizeRoute(route);


  window.location.href =
    destination;
}


/* =========================================
   SAVE LAST PAGE
   ========================================= */


/**
 * Save the current page so the application
 * can remember where the user was.
 */
export function saveCurrentPage() {
  const currentPath =
    window.location.pathname;


  setStorage(
    STORAGE_KEYS.LAST_PAGE,
    currentPath
  );
}


/* =========================================
   GET LAST PAGE
   ========================================= */


/**
 * Get the previously visited page.
 *
 * @returns {string|null}
 */
export function getLastPage() {
  return getStorage(
    STORAGE_KEYS.LAST_PAGE,
    null
  );
}


/* =========================================
   ACTIVE NAVIGATION LINK
   ========================================= */


/**
 * Update navigation links to show which
 * page is currently active.
 */
export function updateActiveNavigation() {
  const currentPage =
    getCurrentPage();


  const navigationLinks =
    $$("[data-nav-page]");


  navigationLinks.forEach(
    (link) => {
      const linkPage =
        link.dataset.navPage;


      const isActive =
        linkPage === currentPage;


      link.classList.toggle(
        "is-active",
        isActive
      );


      if (isActive) {
        link.setAttribute(
          "aria-current",
          "page"
        );
      } else {
        link.removeAttribute(
          "aria-current"
        );
      }
    }
  );
}


/* =========================================
   NAVIGATION CLICK HANDLING
   ========================================= */


/**
 * Attach navigation behaviour to elements
 * using:
 *
 * data-route="pages/assignments.html"
 */
export function initializeNavigationLinks() {
  document.addEventListener(
    "click",
    (event) => {
      const link =
        event.target.closest(
          "[data-route]"
        );


      if (!link) {
        return;
      }


      const route =
        link.dataset.route;


      if (!route) {
        return;
      }


      event.preventDefault();


      navigateTo(route);
    }
  );
}


/* =========================================
   SIDEBAR ELEMENTS
   ========================================= */

function getSidebarElements() {
  return {
    sidebar:
      $(".sidebar"),

    overlay:
      $(".sidebar-overlay"),

    menuButton:
      $(".header-menu-button"),

    closeButton:
      $(".sidebar__close")
  };
}


/* =========================================
   SIDEBAR STATE
   ========================================= */


/**
 * Check whether sidebar is open.
 *
 * @returns {boolean}
 */
export function isSidebarOpen() {
  const sidebar =
    $(".sidebar");


  if (!sidebar) {
    return false;
  }


  return sidebar.classList.contains(
    "is-open"
  );
}


/* =========================================
   OPEN SIDEBAR
   ========================================= */

export function openSidebar() {
  const {
    sidebar,
    overlay,
    menuButton
  } =
    getSidebarElements();


  if (!sidebar) {
    return;
  }


  sidebar.classList.add(
    "is-open"
  );


  if (overlay) {
    overlay.classList.add(
      "is-visible"
    );
  }


  document.body.classList.add(
    "sidebar-open"
  );


  if (menuButton) {
    menuButton.setAttribute(
      "aria-expanded",
      "true"
    );
  }


  setStorage(
    STORAGE_KEYS.SIDEBAR_STATE,
    "open"
  );
}


/* =========================================
   CLOSE SIDEBAR
   ========================================= */

export function closeSidebar() {
  const {
    sidebar,
    overlay,
    menuButton
  } =
    getSidebarElements();


  if (!sidebar) {
    return;
  }


  sidebar.classList.remove(
    "is-open"
  );


  if (overlay) {
    overlay.classList.remove(
      "is-visible"
    );
  }


  document.body.classList.remove(
    "sidebar-open"
  );


  if (menuButton) {
    menuButton.setAttribute(
      "aria-expanded",
      "false"
    );
  }


  setStorage(
    STORAGE_KEYS.SIDEBAR_STATE,
    "closed"
  );
}


/* =========================================
   TOGGLE SIDEBAR
   ========================================= */

export function toggleSidebar() {
  if (isSidebarOpen()) {
    closeSidebar();
  } else {
    openSidebar();
  }
}


/* =========================================
   INITIALIZE SIDEBAR
   ========================================= */

export function initializeSidebar() {
  const {
    sidebar,
    overlay,
    menuButton,
    closeButton
  } =
    getSidebarElements();


  if (!sidebar) {
    return;
  }


  /* ---------------------------------------
     MENU BUTTON
     --------------------------------------- */

  if (menuButton) {
    menuButton.addEventListener(
      "click",
      () => {
        toggleSidebar();
      }
    );
  }


  /* ---------------------------------------
     CLOSE BUTTON
     --------------------------------------- */

  if (closeButton) {
    closeButton.addEventListener(
      "click",
      () => {
        closeSidebar();
      }
    );
  }


  /* ---------------------------------------
     OVERLAY
     --------------------------------------- */

  if (overlay) {
    overlay.addEventListener(
      "click",
      () => {
        closeSidebar();
      }
    );
  }


  /* ---------------------------------------
     SIDEBAR NAVIGATION LINKS
     --------------------------------------- */

  const sidebarLinks =
    $$(".sidebar a");


  sidebarLinks.forEach(
    (link) => {
      link.addEventListener(
        "click",
        () => {
          if (
            window.innerWidth <
            APP.DESKTOP_BREAKPOINT
          ) {
            closeSidebar();
          }
        }
      );
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
        isSidebarOpen()
      ) {
        closeSidebar();
      }
    }
  );


  /* ---------------------------------------
     WINDOW RESIZE
     --------------------------------------- */

  window.addEventListener(
    "resize",
    () => {
      if (
        window.innerWidth >=
        APP.DESKTOP_BREAKPOINT
      ) {
        closeSidebar();
      }
    }
  );
}


/* =========================================
   INITIALIZE NAVIGATION
   ========================================= */


/**
 * Initialize all Campus Connect navigation.
 */
export function initializeNavigation() {
  updateActiveNavigation();

  initializeNavigationLinks();

  initializeSidebar();

  saveCurrentPage();
}


/* =========================================
   REFRESH ACTIVE NAVIGATION
   ========================================= */


/**
 * Public helper to refresh active navigation
 * after dynamic content changes.
 */
export function refreshNavigation() {
  updateActiveNavigation();
}


/* =========================================
   GLOBAL NAVIGATION FUNCTIONS
   ========================================= */

window.CampusConnectNavigation = {
  getCurrentPage,
  getCurrentPath,

  isCurrentPage,

  getRootPrefix,
  normalizeRoute,

  navigateTo,

  openSidebar,
  closeSidebar,
  toggleSidebar,

  isSidebarOpen,

  refreshNavigation
};