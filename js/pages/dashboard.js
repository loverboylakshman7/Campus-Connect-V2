/* =========================================
   CAMPUS CONNECT V2
   DASHBOARD PAGE

   Handles:
   - User information
   - Dashboard greeting
   - Current date
   - Announcements summary
   - Assignments summary
   - Events summary
   - Timetable summary
   - Supabase dashboard data
   ========================================= */

"use strict";

import {
  getSupabase
} from "../config/supabase.js";

import {
  getCurrentUser,
  getUserDisplayName,
  getUserInitials
} from "../core/auth.js";

import {
  initializeGuards
} from "../core/guards.js";

import {
  formatDate
} from "../core/utils.js";

import {
  showLoading,
  hideLoading
} from "../components/loading.js";

import {
  showError
} from "../components/notifications.js";


/* =========================================
   DASHBOARD ELEMENTS
   ========================================= */

function getDashboardElements() {
  return {
    greeting:
      document.querySelector(
        "[data-dashboard-greeting]"
      ),

    userName:
      document.querySelector(
        "[data-user-name]"
      ),

    userInitials:
      document.querySelector(
        "[data-user-initials]"
      ),

    currentDate:
      document.querySelector(
        "[data-current-date]"
      ),

    announcementsCount:
      document.querySelector(
        "[data-announcements-count]"
      ),

    assignmentsCount:
      document.querySelector(
        "[data-assignments-count]"
      ),

    eventsCount:
      document.querySelector(
        "[data-events-count]"
      ),

    timetableCount:
      document.querySelector(
        "[data-timetable-count]"
      )
  };
}


/* =========================================
   GET GREETING
   ========================================= */

function getGreeting() {
  const hour =
    new Date().getHours();


  if (hour < 12) {
    return "Good morning";
  }


  if (hour < 17) {
    return "Good afternoon";
  }


  return "Good evening";
}


/* =========================================
   UPDATE USER INTERFACE
   ========================================= */

function updateUserInterface() {
  const {
    greeting,
    userName,
    userInitials
  } =
    getDashboardElements();


  const name =
    getUserDisplayName();


  if (greeting) {
    greeting.textContent =
      `${getGreeting()}, ${name}`;
  }


  if (userName) {
    userName.textContent =
      name;
  }


  if (userInitials) {
    userInitials.textContent =
      getUserInitials();
  }
}


/* =========================================
   UPDATE CURRENT DATE
   ========================================= */

function updateCurrentDate() {
  const {
    currentDate
  } =
    getDashboardElements();


  if (!currentDate) {
    return;
  }


  const today =
    new Date();


  currentDate.textContent =
    formatDate(
      today
    );
}


/* =========================================
   GET DATA COUNT
   ========================================= */

/**
 * Get the number of rows in a table.
 *
 * @param {Object} client
 * @param {string} table
 *
 * @returns {Promise<number>}
 */
async function getTableCount(
  client,
  table
) {
  try {
    const {
      count,
      error
    } =
      await client
        .from(table)
        .select(
          "*",
          {
            count: "exact",
            head: true
          }
        );


    if (error) {
      console.warn(
        `[Campus Connect] Could not load ${table}:`,
        error.message
      );

      return 0;
    }


    return (
      count ||
      0
    );
  } catch (error) {
    console.warn(
      `[Campus Connect] Dashboard count error for ${table}:`,
      error
    );

    return 0;
  }
}


/* =========================================
   LOAD DASHBOARD COUNTS
   ========================================= */

async function loadDashboardCounts() {
  const client =
    getSupabase();


  if (!client) {
    return;
  }


  const {
    announcementsCount,
    assignmentsCount,
    eventsCount,
    timetableCount
  } =
    getDashboardElements();


  /*
   Load all dashboard statistics
   simultaneously.
  */

  const [
    announcements,
    assignments,
    events,
    timetable
  ] =
    await Promise.all([
      getTableCount(
        client,
        "announcements"
      ),

      getTableCount(
        client,
        "assignments"
      ),

      getTableCount(
        client,
        "events"
      ),

      getTableCount(
        client,
        "timetable"
      )
    ]);


  if (announcementsCount) {
    announcementsCount.textContent =
      announcements;
  }


  if (assignmentsCount) {
    assignmentsCount.textContent =
      assignments;
  }


  if (eventsCount) {
    eventsCount.textContent =
      events;
  }


  if (timetableCount) {
    timetableCount.textContent =
      timetable;
  }
}


/* =========================================
   UPDATE EMPTY COUNTS
   ========================================= */

function initializeDashboardCounts() {
  const {
    announcementsCount,
    assignmentsCount,
    eventsCount,
    timetableCount
  } =
    getDashboardElements();


  if (announcementsCount) {
    announcementsCount.textContent =
      "0";
  }


  if (assignmentsCount) {
    assignmentsCount.textContent =
      "0";
  }


  if (eventsCount) {
    eventsCount.textContent =
      "0";
  }


  if (timetableCount) {
    timetableCount.textContent =
      "0";
  }
}


/* =========================================
   LOAD DASHBOARD
   ========================================= */

async function loadDashboard() {
  initializeDashboardCounts();

  updateUserInterface();

  updateCurrentDate();

  await loadDashboardCounts();
}


/* =========================================
   INITIALIZE DASHBOARD
   ========================================= */

export async function initializeDashboard() {
  /*
   Protect this page.
  */

  const allowed =
    initializeGuards();


  if (!allowed) {
    return;
  }


  /*
   Show loading screen.
  */

  showLoading(
    "Loading your dashboard..."
  );


  try {
    await loadDashboard();
  } catch (error) {
    console.error(
      "[Campus Connect] Dashboard error:",
      error
    );


    showError(
      "Dashboard error",
      "Some dashboard information could not be loaded."
    );
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
    initializeDashboard();
  }
);


/* =========================================
   GLOBAL API
   ========================================= */

window.CampusConnectDashboard = {
  initialize:
    initializeDashboard,

  reload:
    loadDashboard
};