/* =========================================
   CAMPUS CONNECT V2
   NOTIFICATIONS COMPONENT

   Reusable toast notification system.

   Supports:
   - Success
   - Error
   - Warning
   - Info
   - Primary
   - Auto dismiss
   - Manual dismiss
   - Maximum toast limit
   ========================================= */

"use strict";

import {
  TOAST_TYPES,
  TOAST_CONFIG
} from "../core/constants.js";

import {
  $,
  escapeHTML
} from "../core/utils.js";


/* =========================================
   TOAST CONTAINER
   ========================================= */

/**
 * Get or create the toast container.
 *
 * @returns {HTMLElement}
 */
function getToastContainer() {
  let container =
    $(".toast-container");


  if (container) {
    return container;
  }


  container =
    document.createElement("div");


  container.className =
    "toast-container";


  container.setAttribute(
    "aria-live",
    "polite"
  );


  container.setAttribute(
    "aria-atomic",
    "true"
  );


  document.body.appendChild(
    container
  );


  return container;
}


/* =========================================
   TOAST ICONS
   ========================================= */

function getToastIcon(type) {
  const icons = {
    [TOAST_TYPES.SUCCESS]: "✓",

    [TOAST_TYPES.ERROR]: "✕",

    [TOAST_TYPES.WARNING]: "!",

    [TOAST_TYPES.INFO]: "i",

    [TOAST_TYPES.PRIMARY]: "•"
  };


  return (
    icons[type] ||
    icons[TOAST_TYPES.INFO]
  );
}


/* =========================================
   TOAST ROLE
   ========================================= */

function getToastRole(type) {
  if (
    type === TOAST_TYPES.ERROR
  ) {
    return "alert";
  }


  return "status";
}


/* =========================================
   LIMIT NUMBER OF TOASTS
   ========================================= */

function enforceToastLimit(
  container
) {
  const toasts =
    Array.from(
      container.querySelectorAll(
        ".toast"
      )
    );


  const maximum =
    TOAST_CONFIG.MAX_TOASTS;


  if (
    toasts.length < maximum
  ) {
    return;
  }


  const excess =
    toasts.length -
    maximum +
    1;


  toasts
    .slice(0, excess)
    .forEach(
      (toast) => {
        removeToast(
          toast
        );
      }
    );
}


/* =========================================
   CREATE TOAST
   ========================================= */

/**
 * Create and display a toast notification.
 *
 * @param {Object} options
 * @param {string} options.type
 * @param {string} options.title
 * @param {string} options.message
 * @param {number} options.duration
 *
 * @returns {HTMLElement}
 */
export function showToast(
  options = {}
) {
  const {
    type = TOAST_TYPES.INFO,

    title = "Notification",

    message = "",

    duration =
      TOAST_CONFIG.DEFAULT_DURATION
  } = options;


  const container =
    getToastContainer();


  enforceToastLimit(
    container
  );


  const toast =
    document.createElement(
      "div"
    );


  toast.className =
    `toast toast--${type} toast--with-progress`;


  toast.setAttribute(
    "role",
    getToastRole(type)
  );


  toast.setAttribute(
    "aria-live",
    type === TOAST_TYPES.ERROR
      ? "assertive"
      : "polite"
  );


  const safeTitle =
    escapeHTML(title);


  const safeMessage =
    escapeHTML(message);


  const icon =
    getToastIcon(type);


  toast.innerHTML = `
    <div
      class="toast__icon"
      aria-hidden="true"
    >
      ${icon}
    </div>

    <div class="toast__content">

      <div class="toast__title">
        ${safeTitle}
      </div>

      ${
        message
          ? `
            <div class="toast__message">
              ${safeMessage}
            </div>
          `
          : ""
      }

    </div>

    <button
      class="toast__close"
      type="button"
      aria-label="Close notification"
    >
      ×
    </button>

    <div
      class="toast__progress"
    ></div>
  `;


  /*
   Set the CSS animation duration.
  */

  toast.style.setProperty(
    "--toast-duration",
    `${duration}ms`
  );


  /*
   Add to page.
  */

  container.appendChild(
    toast
  );


  /*
   Close button.
  */

  const closeButton =
    toast.querySelector(
      ".toast__close"
    );


  if (closeButton) {
    closeButton.addEventListener(
      "click",
      () => {
        removeToast(
          toast
        );
      }
    );
  }


  /*
   Auto dismiss.
  */

  let timer = null;


  if (
    duration > 0
  ) {
    timer =
      setTimeout(
        () => {
          removeToast(
            toast
          );
        },
        duration
      );


    toast.dataset.timer =
      String(timer);
  }


  /*
   Pause auto-dismiss when hovered.
  */

  toast.addEventListener(
    "mouseenter",
    () => {
      if (timer) {
        clearTimeout(timer);
      }
    }
  );


  /*
   Dispatch custom event.
  */

  toast.dispatchEvent(
    new CustomEvent(
      "toast:shown",
      {
        bubbles: true,

        detail: {
          type,
          title,
          message
        }
      }
    )
  );


  return toast;
}


/* =========================================
   REMOVE TOAST
   ========================================= */

/**
 * Remove a toast notification.
 *
 * @param {HTMLElement} toast
 */
export function removeToast(
  toast
) {
  if (
    !toast ||
    !toast.isConnected
  ) {
    return;
  }


  /*
   Prevent duplicate removal.
  */

  if (
    toast.classList.contains(
      "is-hiding"
    )
  ) {
    return;
  }


  /*
   Clear timer.
  */

  if (
    toast.dataset.timer
  ) {
    clearTimeout(
      Number(
        toast.dataset.timer
      )
    );
  }


  /*
   Start exit animation.
  */

  toast.classList.add(
    "is-hiding"
  );


  /*
   Remove after animation.
  */

  const removeElement =
    () => {
      if (
        toast.isConnected
      ) {
        toast.remove();
      }
    };


  toast.addEventListener(
    "animationend",
    removeElement,
    {
      once: true
    }
  );


  /*
   Fallback in case animation
   is disabled or unsupported.
  */

  setTimeout(
    removeElement,
    600
  );
}


/* =========================================
   SUCCESS NOTIFICATION
   ========================================= */

export function showSuccess(
  title = "Success",
  message = "",
  duration =
    TOAST_CONFIG.SUCCESS_DURATION
) {
  return showToast({
    type:
      TOAST_TYPES.SUCCESS,

    title,

    message,

    duration
  });
}


/* =========================================
   ERROR NOTIFICATION
   ========================================= */

export function showError(
  title = "Error",
  message = "",
  duration =
    TOAST_CONFIG.ERROR_DURATION
) {
  return showToast({
    type:
      TOAST_TYPES.ERROR,

    title,

    message,

    duration
  });
}


/* =========================================
   WARNING NOTIFICATION
   ========================================= */

export function showWarning(
  title = "Warning",
  message = "",
  duration =
    TOAST_CONFIG.DEFAULT_DURATION
) {
  return showToast({
    type:
      TOAST_TYPES.WARNING,

    title,

    message,

    duration
  });
}


/* =========================================
   INFO NOTIFICATION
   ========================================= */

export function showInfo(
  title = "Information",
  message = "",
  duration =
    TOAST_CONFIG.DEFAULT_DURATION
) {
  return showToast({
    type:
      TOAST_TYPES.INFO,

    title,

    message,

    duration
  });
}


/* =========================================
   PRIMARY NOTIFICATION
   ========================================= */

export function showPrimary(
  title = "Notification",
  message = "",
  duration =
    TOAST_CONFIG.DEFAULT_DURATION
) {
  return showToast({
    type:
      TOAST_TYPES.PRIMARY,

    title,

    message,

    duration
  });
}


/* =========================================
   CLEAR ALL TOASTS
   ========================================= */

export function clearAllToasts() {
  const container =
    $(".toast-container");


  if (!container) {
    return;
  }


  const toasts =
    container.querySelectorAll(
      ".toast"
    );


  toasts.forEach(
    (toast) => {
      removeToast(
        toast
      );
    }
  );
}


/* =========================================
   INITIALIZE NOTIFICATION BUTTONS

   Optional usage:

   <button
     data-toast="success"
     data-toast-title="Saved"
     data-toast-message="Changes saved successfully."
   >
     Save
   </button>
   ========================================= */

export function initializeNotifications() {
  document.addEventListener(
    "click",
    (event) => {
      const trigger =
        event.target.closest(
          "[data-toast]"
        );


      if (!trigger) {
        return;
      }


      const type =
        trigger.dataset.toast ||
        TOAST_TYPES.INFO;


      const title =
        trigger.dataset.toastTitle ||
        "Notification";


      const message =
        trigger.dataset.toastMessage ||
        "";


      const duration =
        Number(
          trigger.dataset.toastDuration
        ) ||
        TOAST_CONFIG.DEFAULT_DURATION;


      showToast({
        type,
        title,
        message,
        duration
      });
    }
  );
}


/* =========================================
   GLOBAL API
   ========================================= */

window.CampusConnectNotifications = {
  show: showToast,

  success: showSuccess,

  error: showError,

  warning: showWarning,

  info: showInfo,

  primary: showPrimary,

  remove: removeToast,

  clearAll: clearAllToasts
};