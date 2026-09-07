/* =========================================
   CAMPUS CONNECT V2
   SUPABASE CONFIGURATION

   This file creates one shared Supabase
   client for the entire Campus Connect app.

   IMPORTANT:
   - Use Project URL
   - Use Publishable / Anon key
   - NEVER use a secret/service-role key
     in this frontend project
   ========================================= */

"use strict";


/* =========================================
   SUPABASE SETTINGS

   Replace the values below after creating
   your Supabase project.
   ========================================= */

const SUPABASE_URL =
  "YOUR_SUPABASE_PROJECT_URL";


const SUPABASE_PUBLISHABLE_KEY =
  "YOUR_SUPABASE_PUBLISHABLE_KEY";


/* =========================================
   VALIDATE CONFIGURATION
   ========================================= */

function validateSupabaseConfig() {
  const invalidUrl =
    !SUPABASE_URL ||
    SUPABASE_URL ===
      "YOUR_SUPABASE_PROJECT_URL";


  const invalidKey =
    !SUPABASE_PUBLISHABLE_KEY ||
    SUPABASE_PUBLISHABLE_KEY ===
      "YOUR_SUPABASE_PUBLISHABLE_KEY";


  if (
    invalidUrl ||
    invalidKey
  ) {
    console.warn(
      "[Campus Connect] Supabase is not configured yet."
    );

    return false;
  }


  return true;
}


/* =========================================
   CREATE SUPABASE CLIENT
   ========================================= */

let supabase = null;


/**
 * Create and return the Supabase client.
 *
 * @returns {Object|null}
 */
export function initializeSupabase() {
  /*
   Return existing client if it has already
   been created.
  */

  if (supabase) {
    return supabase;
  }


  /*
   Stop if project details have not yet
   been added.
  */

  if (
    !validateSupabaseConfig()
  ) {
    return null;
  }


  /*
   Check whether the Supabase library
   is available.
  */

  if (
    !window.supabase ||
    !window.supabase.createClient
  ) {
    console.error(
      "[Campus Connect] Supabase library was not loaded."
    );

    return null;
  }


  /*
   Create one shared client.
  */

  supabase =
    window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      }
    );


  console.log(
    "[Campus Connect] Supabase connected."
  );


  return supabase;
}


/* =========================================
   GET SUPABASE CLIENT
   ========================================= */

/**
 * Get the shared Supabase client.
 *
 * @returns {Object|null}
 */
export function getSupabase() {
  if (!supabase) {
    return initializeSupabase();
  }


  return supabase;
}


/* =========================================
   CHECK CONNECTION
   ========================================= */

/**
 * Check whether Supabase has been
 * configured and initialized.
 *
 * @returns {boolean}
 */
export function isSupabaseReady() {
  return Boolean(
    getSupabase()
  );
}


/* =========================================
   AUTH HELPERS
   ========================================= */

/**
 * Get the current Supabase session.
 *
 * @returns {Promise<Object|null>}
 */
export async function getSupabaseSession() {
  const client =
    getSupabase();


  if (!client) {
    return null;
  }


  try {
    const {
      data,
      error
    } =
      await client.auth.getSession();


    if (error) {
      console.error(
        "[Campus Connect] Session error:",
        error.message
      );

      return null;
    }


    return (
      data.session ||
      null
    );
  } catch (error) {
    console.error(
      "[Campus Connect] Unable to get session:",
      error
    );

    return null;
  }
}


/**
 * Get the current authenticated user.
 *
 * @returns {Promise<Object|null>}
 */
export async function getSupabaseUser() {
  const client =
    getSupabase();


  if (!client) {
    return null;
  }


  try {
    const {
      data,
      error
    } =
      await client.auth.getUser();


    if (error) {
      return null;
    }


    return (
      data.user ||
      null
    );
  } catch (error) {
    console.error(
      "[Campus Connect] Unable to get user:",
      error
    );

    return null;
  }
}


/* =========================================
   CONNECTION TEST

   This does not query your database.
   It only checks whether the client
   can be created.
   ========================================= */

export function testSupabaseConnection() {
  const client =
    getSupabase();


  if (!client) {
    console.warn(
      "[Campus Connect] Supabase connection is unavailable."
    );

    return false;
  }


  console.log(
    "[Campus Connect] Supabase client is ready."
  );


  return true;
}


/* =========================================
   GLOBAL API
   ========================================= */

window.CampusConnectSupabase = {
  initialize:
    initializeSupabase,

  getClient:
    getSupabase,

  isReady:
    isSupabaseReady,

  getSession:
    getSupabaseSession,

  getUser:
    getSupabaseUser,

  test:
    testSupabaseConnection
};