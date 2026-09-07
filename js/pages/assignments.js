/* =========================================
   CAMPUS CONNECT V2
   ASSIGNMENTS PAGE

   Handles:
   - Page authentication
   - Loading assignments from Supabase
   - Student-specific assignments
   - Assignment status
   - Due dates
   - Overdue detection
   - Empty and error states
   - Refreshing assignments
   ========================================= */

"use strict";

import {
  getSupabase
} from "../config/supabase.js";

import {
  getCurrentUser
} from "../core/auth.js";

import {
  initializeGuards
} from "../core/guards.js";

import {
  formatDate,
  escapeHTML
} from "../core/utils.js";

import {
  showLoading,
  hideLoading
} from "../components/loading.js";

import {
  showError,
  showInfo
} from "../components/notifications.js";


/* =========================================
   PAGE ELEMENTS
   ========================================= */

function getAssignmentElements() {
  return {
    container:
      document.querySelector(
        "[data-assignments-list]"
      ),

    count:
      document.querySelector(
        "[data-assignments-count]"
      ),

    refreshButton:
      document.querySelector(
        "[data-refresh-assignments]"
      )
  };
}


/* =========================================
   FETCH ASSIGNMENTS
   ========================================= */

/**
 * Get assignments from Supabase.
 *
 * @returns {Promise<Array>}
 */
async function fetchAssignments() {
  const client =
    getSupabase();


  if (!client) {
    throw new Error(
      "Supabase is not configured yet."
    );
  }


  const user =
    getCurrentUser();


  /*
   Basic query.

   Later, when the final database schema
   is created, we can filter assignments
   by course, branch, semester, section,
   or student.
  */

  let query =
    client
      .from("assignments")
      .select("*")
      .order(
        "due_date",
        {
          ascending: true
        }
      );


  /*
   Optional student-specific filtering.

   This will work if the assignments
   table contains a student_id column.
  */

  if (
    user &&
    user.id
  ) {
    /*
     Do not force filtering yet.

     Campus-wide assignments may not
     contain student_id.

     Supabase RLS can later control
     which assignments a student sees.
    */
  }


  const {
    data,
    error
  } =
    await query;


  if (error) {
    throw new Error(
      error.message
    );
  }


  return (
    data ||
    []
  );
}


/* =========================================
   ASSIGNMENT DATA HELPERS
   ========================================= */

function getAssignmentTitle(
  assignment
) {
  return (
    assignment.title ||
    assignment.name ||
    "Untitled Assignment"
  );
}


function getAssignmentSubject(
  assignment
) {
  return (
    assignment.subject ||
    assignment.course ||
    assignment.department ||
    "General"
  );
}


function getAssignmentDescription(
  assignment
) {
  return (
    assignment.description ||
    assignment.content ||
    ""
  );
}


function getAssignmentDueDate(
  assignment
) {
  return (
    assignment.due_date ||
    assignment.deadline ||
    null
  );
}


function getAssignmentStatus(
  assignment
) {
  return (
    assignment.status ||
    "pending"
  ).toLowerCase();
}


/* =========================================
   OVERDUE CHECK
   ========================================= */

/**
 * Check whether an assignment is overdue.
 *
 * @param {Object} assignment
 * @returns {boolean}
 */
function isAssignmentOverdue(
  assignment
) {
  const status =
    getAssignmentStatus(
      assignment
    );


  /*
   Completed assignments cannot be overdue.
  */

  if (
    status === "completed" ||
    status === "submitted"
  ) {
    return false;
  }


  const dueDate =
    getAssignmentDueDate(
      assignment
    );


  if (!dueDate) {
    return false;
  }


  const due =
    new Date(
      dueDate
    );


  const now =
    new Date();


  return (
    due < now
  );
}


/* =========================================
   GET DISPLAY STATUS
   ========================================= */

function getDisplayStatus(
  assignment
) {
  if (
    isAssignmentOverdue(
      assignment
    )
  ) {
    return {
      label: "Overdue",
      className: "overdue"
    };
  }


  const status =
    getAssignmentStatus(
      assignment
    );


  if (
    status === "completed" ||
    status === "submitted"
  ) {
    return {
      label: "Completed",
      className: "completed"
    };
  }


  if (
    status === "in-progress" ||
    status === "in_progress"
  ) {
    return {
      label: "In Progress",
      className: "progress"
    };
  }


  return {
    label: "Pending",
    className: "pending"
  };
}


/* =========================================
   CREATE ASSIGNMENT CARD
   ========================================= */

/**
 * Create one assignment card.
 *
 * @param {Object} assignment
 * @returns {HTMLElement}
 */
function createAssignmentCard(
  assignment
) {
  const card =
    document.createElement(
      "article"
    );


  const status =
    getDisplayStatus(
      assignment
    );


  card.className =
    `assignment-card assignment-card--${status.className}`;


  const title =
    escapeHTML(
      getAssignmentTitle(
        assignment
      )
    );


  const subject =
    escapeHTML(
      getAssignmentSubject(
        assignment
      )
    );


  const description =
    escapeHTML(
      getAssignmentDescription(
        assignment
      )
    );


  const dueDate =
    getAssignmentDueDate(
      assignment
    );


  const formattedDueDate =
    dueDate
      ? formatDate(dueDate)
      : "No due date";


  card.innerHTML = `
    <div class="assignment-card__header">

      <div class="assignment-card__heading">

        <span class="assignment-card__subject">
          ${subject}
        </span>

        <h3 class="assignment-card__title">
          ${title}
        </h3>

      </div>

      <span
        class="assignment-card__status assignment-card__status--${status.className}"
      >
        ${status.label}
      </span>

    </div>

    ${
      description
        ? `
          <p class="assignment-card__description">
            ${description}
          </p>
        `
        : ""
    }

    <div class="assignment-card__footer">

      <span class="assignment-card__due">
        Due: ${escapeHTML(formattedDueDate)}
      </span>

    </div>
  `;


  return card;
}


/* =========================================
   EMPTY STATE
   ========================================= */

function renderEmptyState(
  container
) {
  container.innerHTML = `
    <div class="empty-state">

      <div
        class="empty-state__icon"
        aria-hidden="true"
      >
        📚
      </div>

      <h3 class="empty-state__title">
        No assignments yet
      </h3>

      <p class="empty-state__text">
        Your upcoming assignments will appear here.
      </p>

    </div>
  `;
}


/* =========================================
   LOADING STATE
   ========================================= */

function renderLoadingState(
  container
) {
  container.innerHTML = `
    <div class="page-loading-state">

      <div
        class="loading-spinner"
        aria-hidden="true"
      ></div>

      <p>
        Loading assignments...
      </p>

    </div>
  `;
}


/* =========================================
   ERROR STATE
   ========================================= */

function renderErrorState(
  container
) {
  container.innerHTML = `
    <div class="empty-state">

      <div
        class="empty-state__icon"
        aria-hidden="true"
      >
        ⚠
      </div>

      <h3 class="empty-state__title">
        Unable to load assignments
      </h3>

      <p class="empty-state__text">
        Please refresh and try again.
      </p>

    </div>
  `;
}


/* =========================================
   RENDER ASSIGNMENTS
   ========================================= */

/**
 * Render assignments into the page.
 *
 * @param {Array} assignments
 */
function renderAssignments(
  assignments
) {
  const {
    container,
    count
  } =
    getAssignmentElements();


  if (!container) {
    return;
  }


  container.innerHTML = "";


  if (
    !assignments.length
  ) {
    renderEmptyState(
      container
    );


    if (count) {
      count.textContent =
        "0";
    }


    return;
  }


  assignments.forEach(
    (assignment) => {
      const card =
        createAssignmentCard(
          assignment
        );


      container.appendChild(
        card
      );
    }
  );


  if (count) {
    count.textContent =
      String(
        assignments.length
      );
  }
}


/* =========================================
   LOAD ASSIGNMENTS
   ========================================= */

export async function loadAssignments() {
  const {
    container
  } =
    getAssignmentElements();


  if (!container) {
    console.warn(
      "[Campus Connect] Assignment container was not found."
    );

    return;
  }


  renderLoadingState(
    container
  );


  try {
    const assignments =
      await fetchAssignments();


    renderAssignments(
      assignments
    );
  } catch (error) {
    console.error(
      "[Campus Connect] Assignments error:",
      error
    );


    renderErrorState(
      container
    );


    showError(
      "Unable to load assignments",
      error.message ||
        "Please try again."
    );
  }
}


/* =========================================
   REFRESH BUTTON
   ========================================= */

function initializeRefreshButton() {
  const {
    refreshButton
  } =
    getAssignmentElements();


  if (!refreshButton) {
    return;
  }


  refreshButton.addEventListener(
    "click",
    async () => {
      await loadAssignments();


      showInfo(
        "Updated",
        "Assignments have been refreshed."
      );
    }
  );
}


/* =========================================
   INITIALIZE PAGE
   ========================================= */

export async function initializeAssignmentsPage() {
  /*
   Protect the page.
  */

  const allowed =
    initializeGuards();


  if (!allowed) {
    return;
  }


  showLoading(
    "Loading assignments..."
  );


  try {
    initializeRefreshButton();

    await loadAssignments();
  } finally {
    await hideLoading();
  }
}


/* =========================================
   PAGE INITIALIZATION
   ========================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {
    initializeAssignmentsPage();
  }
);


/* =========================================
   GLOBAL API
   ========================================= */

window.CampusConnectAssignments = {
  initialize:
    initializeAssignmentsPage,

  load:
    loadAssignments,

  refresh:
    loadAssignments
};