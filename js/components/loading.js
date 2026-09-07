/* =========================================
   CAMPUS CONNECT V2
   LOADING COMPONENT

   Handles:
   - Full-page loading overlay
   - Loading messages
   - Button loading states
   - Inline loading states
   - Page loading lifecycle
   ========================================= */

"use strict";

import {
  LOADING_CONFIG
} from "../core/constants.js";

import {
  $,
  wait
} from "../core/utils.js";


/* =========================================
   LOADING STATE
   ========================================= */

let activeLoadingOverlay = null;


/* =========================================
   CREATE LOADING OVERLAY
   ========================================= */

/**
 * Create the main loading overlay.
 *
 * @returns {HTMLElement}
 */
function createLoadingOverlay() {
  const overlay =
    document.createElement("div");


  overlay.className =
    "loading-overlay";


  overlay.setAttribute(
    "role",
    "status"
  );


  overlay.setAttribute(
    "aria-live",
    "polite"
  );


  overlay.setAttribute(
    "aria-label",
    "Loading"
  );


  overlay.innerHTML = `
    <div class="loading-overlay__content">

      <div
        class="loading-spinner"
        aria-hidden="true"
      ></div>

      <p class="loading-overlay__message">
        Loading...
      </p>

    </div>
  `;


  return overlay;
}


/* =========================================
   GET LOADING OVERLAY
   ========================================= */

/**
 * Get the existing loading overlay
 * or create a new one.
 *
 * @returns {HTMLElement}
 */
export function getLoadingOverlay() {
  let overlay =
    $(".loading-overlay");


  if (!overlay) {
    overlay =
      createLoadingOverlay();

    document.body.appendChild(
      overlay
    );
  }


  activeLoadingOverlay =
    overlay;


  return overlay;
}


/* =========================================
   SHOW PAGE LOADING
   ========================================= */

/**
 * Show the full-page loading overlay.
 *
 * @param {string} message
 * @returns {HTMLElement}
 */
export function showLoading(
  message = "Loading..."
) {
  const overlay =
    getLoadingOverlay();


  const messageElement =
    overlay.querySelector(
      ".loading-overlay__message"
    );


  if (messageElement) {
    messageElement.textContent =
      message;
  }


  overlay.classList.add(
    "is-visible"
  );


  document.body.classList.add(
    "is-loading"
  );


  activeLoadingOverlay =
    overlay;


  return overlay;
}


/* =========================================
   HIDE PAGE LOADING
   ========================================= */

/**
 * Hide the full-page loading overlay.
 */
export async function hideLoading() {
  const overlay =
    activeLoadingOverlay ||
    $(".loading-overlay");


  if (!overlay) {
    return;
  }


  /*
   Wait briefly so very fast loading
   does not create a flashing effect.
  */

  await wait(
    LOADING_CONFIG.PAGE_TRANSITION_DELAY
  );


  overlay.classList.remove(
    "is-visible"
  );


  document.body.classList.remove(
    "is-loading"
  );
}


/* =========================================
   SET LOADING MESSAGE
   ========================================= */

/**
 * Update the loading message.
 *
 * @param {string} message
 */
export function setLoadingMessage(
  message = "Loading..."
) {
  const overlay =
    activeLoadingOverlay ||
    $(".loading-overlay");


  if (!overlay) {
    return;
  }


  const messageElement =
    overlay.querySelector(
      ".loading-overlay__message"
    );


  if (messageElement) {
    messageElement.textContent =
      message;
  }
}


/* =========================================
   CHECK LOADING STATE
   ========================================= */

/**
 * Check whether the main loading overlay
 * is currently visible.
 *
 * @returns {boolean}
 */
export function isLoading() {
  const overlay =
    activeLoadingOverlay ||
    $(".loading-overlay");


  if (!overlay) {
    return false;
  }


  return overlay.classList.contains(
    "is-visible"
  );
}


/* =========================================
   BUTTON LOADING STATE
   ========================================= */

/**
 * Set a button into loading state.
 *
 * @param {HTMLElement|string} button
 * @param {string} loadingText
 * @returns {boolean}
 */
export function setButtonLoading(
  button,
  loadingText = "Loading..."
) {
  const buttonElement =
    typeof button === "string"
      ? $(button)
      : button;


  if (!buttonElement) {
    return false;
  }


  /*
   Store original state.
  */

  if (
    !buttonElement.dataset.originalText
  ) {
    buttonElement.dataset.originalText =
      buttonElement.textContent.trim();
  }


  buttonElement.dataset.originalDisabled =
    String(
      buttonElement.disabled
    );


  /*
   Set loading state.
  */

  buttonElement.disabled =
    true;


  buttonElement.classList.add(
    "is-loading"
  );


  buttonElement.setAttribute(
    "aria-busy",
    "true"
  );


  buttonElement.innerHTML = `
    <span
      class="button-loader"
      aria-hidden="true"
    ></span>

    <span>
      ${loadingText}
    </span>
  `;


  return true;
}


/* =========================================
   RESET BUTTON LOADING
   ========================================= */

/**
 * Restore a button after loading.
 *
 * @param {HTMLElement|string} button
 * @returns {boolean}
 */
export function resetButtonLoading(
  button
) {
  const buttonElement =
    typeof button === "string"
      ? $(button)
      : button;


  if (!buttonElement) {
    return false;
  }


  /*
   Restore text.
  */

  if (
    buttonElement.dataset.originalText
  ) {
    buttonElement.textContent =
      buttonElement.dataset.originalText;
  }


  /*
   Restore disabled state.
  */

  buttonElement.disabled =
    buttonElement.dataset.originalDisabled ===
      "true";


  buttonElement.classList.remove(
    "is-loading"
  );


  buttonElement.removeAttribute(
    "aria-busy"
  );


  /*
   Clean temporary data.
  */

  delete buttonElement.dataset.originalText;

  delete buttonElement.dataset.originalDisabled;


  return true;
}


/* =========================================
   INLINE LOADING ELEMENT
   ========================================= */

/**
 * Create an inline loading spinner.
 *
 * @param {string} message
 * @returns {HTMLElement}
 */
export function createInlineLoader(
  message = "Loading..."
) {
  const loader =
    document.createElement(
      "div"
    );


  loader.className =
    "inline-loader";


  loader.setAttribute(
    "role",
    "status"
  );


  loader.innerHTML = `
    <div
      class="inline-loader__spinner"
      aria-hidden="true"
    ></div>

    <span class="inline-loader__text">
      ${message}
    </span>
  `;


  return loader;
}


/* =========================================
   REPLACE CONTENT WITH LOADER
   ========================================= */

/**
 * Show a loader inside a container.
 *
 * @param {HTMLElement|string} container
 * @param {string} message
 * @returns {HTMLElement|null}
 */
export function showInlineLoading(
  container,
  message = "Loading..."
) {
  const containerElement =
    typeof container === "string"
      ? $(container)
      : container;


  if (!containerElement) {
    return null;
  }


  /*
   Store original content.
  */

  if (
    !containerElement.dataset.originalContent
  ) {
    containerElement.dataset.originalContent =
      containerElement.innerHTML;
  }


  containerElement.innerHTML = "";


  const loader =
    createInlineLoader(
      message
    );


  containerElement.appendChild(
    loader
  );


  containerElement.setAttribute(
    "aria-busy",
    "true"
  );


  return loader;
}


/* =========================================
   RESTORE INLINE CONTENT
   ========================================= */

/**
 * Restore original container content.
 *
 * @param {HTMLElement|string} container
 * @returns {boolean}
 */
export function restoreInlineContent(
  container
) {
  const containerElement =
    typeof container === "string"
      ? $(container)
      : container;


  if (!containerElement) {
    return false;
  }


  if (
    containerElement.dataset.originalContent
  ) {
    containerElement.innerHTML =
      containerElement.dataset.originalContent;
  }


  containerElement.removeAttribute(
    "aria-busy"
  );


  delete containerElement.dataset.originalContent;


  return true;
}


/* =========================================
   PAGE LOAD INITIALIZATION
   ========================================= */

/**
 * Initialize loading behavior.
 */
export function initializeLoading() {
  /*
   Remove any loading state left behind
   after the page has fully loaded.
  */

  window.addEventListener(
    "load",
    async () => {
      if (isLoading()) {
        await hideLoading();
      }
    }
  );
}


/* =========================================
   GLOBAL API
   ========================================= */

window.CampusConnectLoading = {
  show: showLoading,

  hide: hideLoading,

  setMessage: setLoadingMessage,

  isLoading,

  setButtonLoading,

  resetButtonLoading,

  showInline: showInlineLoading,

  restoreInline: restoreInlineContent,

  createInline: createInlineLoader
};