/* =========================================
   CAMPUS CONNECT V2
   CORE AUTHENTICATION

   Handles:
   - User session storage
   - Login state
   - Logout
   - Current user access
   - Authentication checks

   Firebase/Supabase authentication can be
   connected here later without changing
   the page-level code significantly.
   ========================================= */

"use strict";

import {
  STORAGE_KEYS
} from "./constants.js";

import {
  getStorage,
  setStorage,
  removeStorage
} from "./utils.js";


/* =========================================
   AUTH STATE
   ========================================= */

let currentUser = null;

let authInitialized = false;


/* =========================================
   INITIALIZE AUTH
   ========================================= */

/**
 * Initialize the authentication state.
 *
 * @returns {Object|null}
 */
export function initializeAuth() {
  if (authInitialized) {
    return currentUser;
  }


  currentUser = getStorage(
    STORAGE_KEYS.USER,
    null
  );


  authInitialized = true;


  return currentUser;
}


/* =========================================
   GET CURRENT USER
   ========================================= */

/**
 * Get the currently logged-in user.
 *
 * @returns {Object|null}
 */
export function getCurrentUser() {
  if (!authInitialized) {
    initializeAuth();
  }


  return currentUser;
}


/* =========================================
   CHECK LOGIN STATUS
   ========================================= */

/**
 * Check whether a user is logged in.
 *
 * @returns {boolean}
 */
export function isLoggedIn() {
  const user =
    getCurrentUser();


  return Boolean(
    user &&
    user.id
  );
}


/* =========================================
   SET CURRENT USER
   ========================================= */

/**
 * Save the current user session.
 *
 * @param {Object} user
 * @returns {Object|null}
 */
export function setCurrentUser(user) {
  if (
    !user ||
    typeof user !== "object"
  ) {
    console.error(
      "[Campus Connect] Invalid user data."
    );

    return null;
  }


  if (!user.id) {
    console.error(
      "[Campus Connect] User must have an ID."
    );

    return null;
  }


  currentUser = {
    ...user
  };


  setStorage(
    STORAGE_KEYS.USER,
    currentUser
  );


  document.dispatchEvent(
    new CustomEvent(
      "auth:login",
      {
        detail: {
          user: currentUser
        }
      }
    )
  );


  return currentUser;
}


/* =========================================
   UPDATE CURRENT USER
   ========================================= */

/**
 * Update selected user properties.
 *
 * @param {Object} updates
 * @returns {Object|null}
 */
export function updateCurrentUser(
  updates = {}
) {
  const user =
    getCurrentUser();


  if (!user) {
    return null;
  }


  currentUser = {
    ...user,
    ...updates
  };


  setStorage(
    STORAGE_KEYS.USER,
    currentUser
  );


  document.dispatchEvent(
    new CustomEvent(
      "auth:user-updated",
      {
        detail: {
          user: currentUser
        }
      }
    )
  );


  return currentUser;
}


/* =========================================
   LOGOUT
   ========================================= */

/**
 * Clear the current authentication session.
 */
export function logout() {
  const previousUser =
    getCurrentUser();


  currentUser = null;


  removeStorage(
    STORAGE_KEYS.USER
  );


  removeStorage(
    STORAGE_KEYS.LAST_PAGE
  );


  document.dispatchEvent(
    new CustomEvent(
      "auth:logout",
      {
        detail: {
          user: previousUser
        }
      }
    )
  );
}


/* =========================================
   REQUIRE AUTHENTICATION
   ========================================= */

/**
 * Check whether authentication is required.
 *
 * @returns {boolean}
 */
export function requireAuth() {
  return isLoggedIn();
}


/* =========================================
   USER DISPLAY NAME
   ========================================= */

/**
 * Get the best available user display name.
 *
 * @returns {string}
 */
export function getUserDisplayName() {
  const user =
    getCurrentUser();


  if (!user) {
    return "Guest";
  }


  if (user.name) {
    return user.name;
  }


  if (user.displayName) {
    return user.displayName;
  }


  if (user.email) {
    return user.email.split("@")[0];
  }


  return "Student";
}


/* =========================================
   USER INITIALS
   ========================================= */

/**
 * Generate initials for the current user.
 *
 * @returns {string}
 */
export function getUserInitials() {
  const name =
    getUserDisplayName()
      .trim();


  if (!name) {
    return "U";
  }


  const parts =
    name.split(/\s+/);


  if (
    parts.length === 1
  ) {
    return parts[0]
      .charAt(0)
      .toUpperCase();
  }


  return (
    parts[0]
      .charAt(0) +
    parts[
      parts.length - 1
    ].charAt(0)
  ).toUpperCase();
}


/* =========================================
   INITIALIZE AUTH AUTOMATICALLY
   ========================================= */

initializeAuth();


/* =========================================
   GLOBAL API
   ========================================= */

window.CampusConnectAuth = {
  initialize:
    initializeAuth,

  getCurrentUser,

  setCurrentUser,

  updateCurrentUser,

  isLoggedIn,

  requireAuth,

  logout,

  getUserDisplayName,

  getUserInitials
};