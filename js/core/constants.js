/* =========================================
   CAMPUS CONNECT V2
   APPLICATION CONSTANTS

   Central location for reusable constants.
   Avoid hardcoding important values across
   multiple JavaScript files.
   ========================================= */


/* =========================================
   APPLICATION INFORMATION
   ========================================= */

export const APP = {
  NAME: "Campus Connect",
  VERSION: "2.0.0",

  STORAGE_PREFIX: "campus-connect",

  DEFAULT_THEME: "light",

  MOBILE_BREAKPOINT: 768,
  DESKTOP_BREAKPOINT: 1024
};


/* =========================================
   STORAGE KEYS
   ========================================= */

export const STORAGE_KEYS = {
  THEME: `${APP.STORAGE_PREFIX}-theme`,
  USER: `${APP.STORAGE_PREFIX}-user`,
  SIDEBAR_STATE: `${APP.STORAGE_PREFIX}-sidebar`,
  LAST_PAGE: `${APP.STORAGE_PREFIX}-last-page`
};


/* =========================================
   USER ROLES
   ========================================= */

export const USER_ROLES = {
  STUDENT: "student",
  FACULTY: "faculty",
  ADMIN: "admin"
};


/* =========================================
   USER ROLE LABELS
   ========================================= */

export const USER_ROLE_LABELS = {
  [USER_ROLES.STUDENT]: "Student",
  [USER_ROLES.FACULTY]: "Faculty",
  [USER_ROLES.ADMIN]: "Administrator"
};


/* =========================================
   PAGE ROUTES
   ========================================= */

export const ROUTES = {
  LOGIN: "login.html",

  DASHBOARD: "index.html",

  ANNOUNCEMENTS: "pages/announcements.html",
  ASSIGNMENTS: "pages/assignments.html",
  EVENTS: "pages/events.html",
  PROFILE: "pages/profile.html",
  SETTINGS: "pages/settings.html",
  STUDY_PLANNER: "pages/study-planner.html",
  TIMETABLE: "pages/timetable.html"
};


/* =========================================
   NAVIGATION ITEMS
   ========================================= */

export const NAVIGATION_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    route: ROUTES.DASHBOARD,
    icon: "home"
  },

  {
    id: "announcements",
    label: "Announcements",
    route: ROUTES.ANNOUNCEMENTS,
    icon: "megaphone"
  },

  {
    id: "assignments",
    label: "Assignments",
    route: ROUTES.ASSIGNMENTS,
    icon: "clipboard"
  },

  {
    id: "timetable",
    label: "Timetable",
    route: ROUTES.TIMETABLE,
    icon: "calendar"
  },

  {
    id: "events",
    label: "Events",
    route: ROUTES.EVENTS,
    icon: "calendar-days"
  },

  {
    id: "study-planner",
    label: "Study Planner",
    route: ROUTES.STUDY_PLANNER,
    icon: "book-open"
  }
];


/* =========================================
   ACCOUNT NAVIGATION
   ========================================= */

export const ACCOUNT_NAVIGATION_ITEMS = [
  {
    id: "profile",
    label: "My Profile",
    route: ROUTES.PROFILE,
    icon: "user"
  },

  {
    id: "settings",
    label: "Settings",
    route: ROUTES.SETTINGS,
    icon: "settings"
  }
];


/* =========================================
   TOAST TYPES
   ========================================= */

export const TOAST_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
  PRIMARY: "primary"
};


/* =========================================
   DEFAULT TOAST SETTINGS
   ========================================= */

export const TOAST_CONFIG = {
  DEFAULT_DURATION: 5000,

  SUCCESS_DURATION: 4000,

  ERROR_DURATION: 6000,

  MAX_TOASTS: 5
};


/* =========================================
   MODAL SETTINGS
   ========================================= */

export const MODAL_CONFIG = {
  ANIMATION_DURATION: 250,

  CLOSE_ON_OVERLAY_CLICK: true,

  CLOSE_ON_ESCAPE: true
};


/* =========================================
   FORM VALIDATION
   ========================================= */

export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,

  NAME_MIN_LENGTH: 2,

  NAME_MAX_LENGTH: 100,

  ANNOUNCEMENT_TITLE_MAX_LENGTH: 150,

  ASSIGNMENT_TITLE_MAX_LENGTH: 150,

  EVENT_TITLE_MAX_LENGTH: 150
};


/* =========================================
   DATE AND TIME FORMATS
   ========================================= */

export const DATE_FORMATS = {
  SHORT: {
    day: "numeric",
    month: "short",
    year: "numeric"
  },

  LONG: {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  },

  TIME: {
    hour: "numeric",
    minute: "2-digit"
  }
};


/* =========================================
   APPLICATION STATUS
   ========================================= */

export const STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",

  PENDING: "pending",
  COMPLETED: "completed",

  UPCOMING: "upcoming",
  OVERDUE: "overdue"
};


/* =========================================
   PRIORITY LEVELS
   ========================================= */

export const PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high"
};


/* =========================================
   ASSIGNMENT STATUS
   ========================================= */

export const ASSIGNMENT_STATUS = {
  PENDING: "pending",
  SUBMITTED: "submitted",
  COMPLETED: "completed",
  OVERDUE: "overdue"
};


/* =========================================
   EVENT STATUS
   ========================================= */

export const EVENT_STATUS = {
  UPCOMING: "upcoming",
  ONGOING: "ongoing",
  COMPLETED: "completed",
  CANCELLED: "cancelled"
};


/* =========================================
   LOADING CONFIGURATION
   ========================================= */

export const LOADING_CONFIG = {
  MIN_DISPLAY_TIME: 300,

  PAGE_TRANSITION_DELAY: 150
};


/* =========================================
   API / DATABASE STATUS
   ========================================= */

export const DATABASE = {
  ENABLED: true,

  /* Firebase collection names */

  COLLECTIONS: {
    USERS: "users",
    ANNOUNCEMENTS: "announcements",
    ASSIGNMENTS: "assignments",
    EVENTS: "events",
    TIMETABLE: "timetable"
  }
};


/* =========================================
   ERROR MESSAGES
   ========================================= */

export const MESSAGES = {
  GENERIC_ERROR:
    "Something went wrong. Please try again.",

  NETWORK_ERROR:
    "Unable to connect. Please check your internet connection.",

  UNAUTHORIZED:
    "You are not authorized to perform this action.",

  LOGIN_REQUIRED:
    "Please log in to continue.",

  SAVED_SUCCESS:
    "Changes saved successfully.",

  DELETED_SUCCESS:
    "Item deleted successfully.",

  ADDED_SUCCESS:
    "Item added successfully."