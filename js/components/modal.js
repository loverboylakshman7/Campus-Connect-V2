/* =========================================
   CAMPUS CONNECT V2
   REUSABLE MODAL COMPONENT

   Handles:
   - Opening modals
   - Closing modals
   - Overlay click
   - Escape key
   - Focus management
   - Multiple modal support
   ========================================= */

"use strict";

import {
  MODAL_CONFIG
} from "../core/constants.js";

import {
  $,
  $$
} from "../core/utils.js";


/* =========================================
   MODAL STATE
   ========================================= */

let activeModal = null;

let previouslyFocusedElement = null;


/* =========================================
   GET MODAL
   ========================================= */

/**
 * Get a modal using its ID.
 *
 * @param {string} modalId
 * @returns {HTMLElement|null}
 */
export function getModal(modalId) {
  if (!modalId) {
    return null;
  }

  return document.getElementById(
    modalId
  );
}


/* =========================================
   CHECK MODAL STATE
   ========================================= */

/**
 * Check whether a modal is open.
 *
 * @param {HTMLElement|string} modal
 * @returns {boolean}
 */
export function isModalOpen(modal) {
  const modalElement =
    typeof modal === "string"
      ? getModal(modal)
      : modal;

  if (!modalElement) {
    return false;
  }

  return modalElement.classList.contains(
    "is-open"
  );
}


/* =========================================
   GET FOCUSABLE ELEMENTS
   ========================================= */

function getFocusableElements(modal) {
  if (!modal) {
    return [];
  }

  const selector = [
    "a[href]",
    "button:not([disabled])",
    "textarea:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    '[tabindex]:not([tabindex="-1"])'
  ].join(",");

  return $$(selector, modal)
    .filter((element) => {
      return (
        !element.hidden &&
        element.offsetParent !== null
      );
    });
}


/* =========================================
   OPEN MODAL
   ========================================= */

/**
 * Open a modal.
 *
 * @param {HTMLElement|string} modal
 * @returns {HTMLElement|null}
 */
export function openModal(modal) {
  const modalElement =
    typeof modal === "string"
      ? getModal(modal)
      : modal;

  if (!modalElement) {
    console.warn(
      "[Campus Connect] Modal not found."
    );

    return null;
  }


  /* Close currently active modal */

  if (
    activeModal &&
    activeModal !== modalElement
  ) {
    closeModal(
      activeModal,
      false
    );
  }


  /* Save previously focused element */

  previouslyFocusedElement =
    document.activeElement;


  /* Open modal */

  modalElement.classList.add(
    "is-open"
  );

  modalElement.setAttribute(
    "aria-hidden",
    "false"
  );


  /* Prevent page scrolling */

  document.body.classList.add(
    "modal-open"
  );


  activeModal =
    modalElement;


  /* Focus first useful element */

  const focusableElements =
    getFocusableElements(
      modalElement
    );

  const closeButton =
    modalElement.querySelector(
      "[data-modal-close]"
    );

  const focusTarget =
    closeButton ||
    focusableElements[0] ||
    modalElement;


  setTimeout(() => {
    focusTarget.focus();
  }, 50);


  /* Dispatch custom event */

  modalElement.dispatchEvent(
    new CustomEvent(
      "modal:opened",
      {
        bubbles: true
      }
    )
  );


  return modalElement;
}


/* =========================================
   CLOSE MODAL
   ========================================= */

/**
 * Close a modal.
 *
 * @param {HTMLElement|string} modal
 * @param {boolean} restoreFocus
 * @returns {boolean}
 */
export function closeModal(
  modal,
  restoreFocus = true
) {
  const modalElement =
    typeof modal === "string"
      ? getModal(modal)
      : modal;

  if (!modalElement) {
    return false;
  }


  /* Close modal */

  modalElement.classList.remove(
    "is-open"
  );

  modalElement.setAttribute(
    "aria-hidden",
    "true"
  );


  /* Remove body lock */

  if (
    activeModal === modalElement
  ) {
    document.body.classList.remove(
      "modal-open"
    );

    activeModal = null;
  }


  /* Restore focus */

  if (
    restoreFocus &&
    previouslyFocusedElement &&
    typeof previouslyFocusedElement.focus ===
      "function"
  ) {
    setTimeout(() => {
      previouslyFocusedElement.focus();
    }, 50);
  }


  /* Dispatch custom event */

  modalElement.dispatchEvent(
    new CustomEvent(
      "modal:closed",
      {
        bubbles: true
      }
    )
  );


  return true;
}


/* =========================================
   CLOSE ACTIVE MODAL
   ========================================= */

export function closeActiveModal() {
  if (!activeModal) {
    return false;
  }

  return closeModal(
    activeModal
  );
}


/* =========================================
   CLOSE ALL MODALS
   ========================================= */

export function closeAllModals() {
  const modals =
    $$(".modal.is-open");

  modals.forEach(
    (modal) => {
      modal.classList.remove(
        "is-open"
      );

      modal.setAttribute(
        "aria-hidden",
        "true"
      );
    }
  );


  document.body.classList.remove(
    "modal-open"
  );

  activeModal = null;
}


/* =========================================
   HANDLE MODAL OPEN TRIGGERS
   ========================================= */

function initializeOpenTriggers() {
  document.addEventListener(
    "click",
    (event) => {
      const trigger =
        event.target.closest(
          "[data-modal-open]"
        );

      if (!trigger) {
        return;
      }


      const modalId =
        trigger.dataset.modalOpen;


      if (!modalId) {
        return;
      }


      event.preventDefault();

      openModal(
        modalId
      );
    }
  );
}


/* =========================================
   HANDLE MODAL CLOSE TRIGGERS
   ========================================= */

function initializeCloseTriggers() {
  document.addEventListener(
    "click",
    (event) => {
      const closeButton =
        event.target.closest(
          "[data-modal-close]"
        );

      if (!closeButton) {
        return;
      }


      const modal =
        closeButton.closest(
          ".modal"
        );


      if (modal) {
        event.preventDefault();

        closeModal(
          modal
        );
      }
    }
  );
}


/* =========================================
   OVERLAY CLICK
   ========================================= */

function initializeOverlayClick() {
  document.addEventListener(
    "click",
    (event) => {
      if (
        !MODAL_CONFIG
          .CLOSE_ON_OVERLAY_CLICK
      ) {
        return;
      }


      const modal =
        event.target.closest(
          ".modal"
        );


      if (!modal) {
        return;
      }


      /*
       Close only when the user clicks the
       modal overlay itself, not the content.
      */

      if (
        event.target === modal
      ) {
        closeModal(
          modal
        );
      }
    }
  );
}


/* =========================================
   ESCAPE KEY
   ========================================= */

function initializeEscapeKey() {
  document.addEventListener(
    "keydown",
    (event) => {
      if (
        event.key !== "Escape"
      ) {
        return;
      }


      if (
        !MODAL_CONFIG
          .CLOSE_ON_ESCAPE
      ) {
        return;
      }


      if (activeModal) {
        closeModal(
          activeModal
        );
      }
    }
  );
}


/* =========================================
   FOCUS TRAP
   ========================================= */

function initializeFocusTrap() {
  document.addEventListener(
    "keydown",
    (event) => {
      if (
        event.key !== "Tab" ||
        !activeModal
      ) {
        return;
      }


      const focusableElements =
        getFocusableElements(
          activeModal
        );


      if (
        focusableElements.length === 0
      ) {
        event.preventDefault();

        activeModal.focus();

        return;
      }


      const firstElement =
        focusableElements[0];

      const lastElement =
        focusableElements[
          focusableElements.length - 1
        ];


      if (
        event.shiftKey &&
        document.activeElement ===
          firstElement
      ) {
        event.preventDefault();

        lastElement.focus();
      }


      if (
        !event.shiftKey &&
        document.activeElement ===
          lastElement
      ) {
        event.preventDefault();

        firstElement.focus();
      }
    }
  );
}


/* =========================================
   INITIALIZE MODALS
   ========================================= */

/**
 * Initialize the Campus Connect
 * reusable modal system.
 */
export function initializeModals() {
  initializeOpenTriggers();

  initializeCloseTriggers();

  initializeOverlayClick();

  initializeEscapeKey();

  initializeFocusTrap();


  /* Prepare all modals */

  const modals =
    $$(".modal");

  modals.forEach(
    (modal) => {
      if (
        !modal.hasAttribute(
          "aria-hidden"
        )
      ) {
        modal.setAttribute(
          "aria-hidden",
          "true"
        );
      }


      /*
       Allows focus when a modal has no
       focusable children.
      */

      if (
        !modal.hasAttribute(
          "tabindex"
        )
      ) {
        modal.setAttribute(
          "tabindex",
          "-1"
        );
      }
    }
  );
}


/* =========================================
   GLOBAL API
   ========================================= */

/*
   Optional global access for simple HTML
   interactions and debugging.
*/

window.CampusConnectModal = {
  open: openModal,
  close: closeModal,
  closeActive: closeActiveModal,
  closeAll: closeAllModals,
  get: getModal,
  isOpen: isModalOpen
};