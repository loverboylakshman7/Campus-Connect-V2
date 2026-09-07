/* =========================================
   CAMPUS CONNECT V2
   ROUTE GUARDS

   Handles:
   - Protected pages
   - Login page redirects
   - Authentication checks
   - Redirecting unauthenticated users
   - Redirecting logged-in users away
     from the login page
   ========================================= */

"use strict";

import {
  isLoggedIn,
  getCurrentUser
} from "./auth.js";

import {
  getCurrentPage,
  getRootPrefix
} from "./navigation.js";


/* =========================================
   PAGE CONFIGURATION
   ========================================= */

/*
   Pages that require the user to be logged in.
*/

const PROTECTED_PAGES = [
  "index.html",
  "announcements.html",
  "assignments.html",
  "events.html",
  "profile.html",
  "settings.html",
  "study-planner.html",
  "timetable.html"
];


/*
   Pages intended for users who are
   not logged in.
*/

const GUEST_ONLY_PAGES = [
  "login.html"
];


/* =========================================
   GET LOGIN PAGE
   ========================================= */

/**
 * Get the correct relative path
 * to login.html.
 *
 * @returns {string}
 */
export function getLoginPagePath() {
  return (
    getRootPrefix() +
    "login.html"
  );
}


/* =========================================
   GET DASHBOARD PAGE
   ========================================= */

/**
 * Get the correct relative path
 * to the main dashboard.
 *
 * @returns {string}
 */
export function getDashboardPath() {
  const prefix =
    getRootPrefix();


  /*
   If already inside /pages,
   the dashboard is one level up.
  */

  return (
    prefix +
    "index.html"
  );
}


/* =========================================
   REDIRECT
   ========================================= */

/**
 * Redirect to a Campus Connect page.
 *
 * @param {string} path
 */
export function redirectTo(path) {
  if (!path) {
    return;
  }


  window.location.replace(
    path
  );
}


/* =========================================
   CHECK PROTECTED PAGE
   ========================================= */

/**
 * Check if the current page requires login.
 *
 * @returns {boolean}
 */
export function isProtectedPage() {
  const currentPage =
    getCurrentPage();


  return PROTECTED_PAGES.includes(
    currentPage
  );
}


/* =========================================
   CHECK GUEST PAGE
   ========================================= */

/**
 * Check if the current page is
 * only for logged-out users.
 *
 * @returns {boolean}
 */
export function isGuestOnlyPage() {
  const currentPage =
    getCurrentPage();


  return GUEST_ONLY_PAGES.includes(
    currentPage
  );
}


/* =========================================
   REQUIRE AUTH
   ========================================= */

/**
 * Protect the current page.
 *
 * If the user is not logged in,
 * redirect them to login.html.
 *
 * @returns {boolean}
 */
export function requireAuthentication() {
  if (
    isLoggedIn()
  ) {
    return true;
  }


  const loginPath =
    getLoginPagePath();


  redirectTo(
    loginPath
  );


  return false;
}


/* =========================================
   REQUIRE GUEST
   ========================================= */

/**
 * Prevent logged-in users from
 * accessing login.html.
 *
 * @returns {boolean}
 */
export function requireGuest() {
  if (
    !isLoggedIn()
  ) {
    return true;
  }


  const dashboardPath =
    getDashboardPath();


  redirectTo(
    dashboardPath
  );


  return false;
}


/* =========================================
   CHECK USER SESSION
   ========================================= */

/**
 * Validate that the user session exists.
 *
 * @returns {boolean}
 */
export function hasValidSession() {
  const user =
    getCurrentUser();


  if (!user) {
    return false;
  }


  if (!user.id) {
    return false;
  }


  return true;
}


/* =========================================
   RUN PAGE GUARD
   ========================================= */

/**
 * Automatically apply the correct
 * guard for the current page.
 *
 * @returns {boolean}
 */
export function runPageGuard() {
  /*
   Protect dashboard and student pages.
  */

  if (
    isProtectedPage()
  ) {
    return requireAuthentication();
  }


  /*
   Prevent logged-in users from returning
   to login.html.
  */

  if (
    isGuestOnlyPage()
  ) {
    return requireGuest();
  }


  /*
   Public page.
  */

  return true;
}


/* =========================================
   AUTH EVENT LISTENERS
   ========================================= */

/*
   When the user logs out,
   send them back to login.html
   if they are currently on
   a protected page.
*/

document.addEventListener(
  "auth:logout",
  () => {
    if (
      isProtectedPage()
    ) {
      redirectTo(
        getLoginPagePath()
      );
    }
  }
);


/* =========================================
   INITIALIZE GUARDS
   ========================================= */

/**
 * Initialize Campus Connect route guards.
 *
 * @returns {boolean}
 */
export function initializeGuards() {
  return runPageGuard();
}


/* =========================================
   GLOBAL API
   ========================================= */

window.CampusConnectGuards = {
  initialize:
    initializeGuards,

  run:
    runPageGuard,

  requireAuthentication,

  requireGuest,

  isProtectedPage,

  isGuestOnlyPage,

  hasValidSession,

  redirectTo,

  getLoginPagePath,

  getDashboardPath
};