-- ============================================================================
-- Accounts Master — Clean transactional/demo data for a new client deployment
-- ============================================================================
--
-- WHAT THIS DOES
--   Wipes every table that holds records accumulated through USING the app
--   (demo trips, bookings, clients, payments, expenditure, participants,
--   groups, loyalty history, workflow history, login sessions, push
--   subscriptions) so the client starts on a completely blank slate.
--
-- WHAT THIS DELIBERATELY LEAVES ALONE ("common configuration")
--   Everything that defines how the system behaves, built up over the whole
--   adventure-management build-out — this is the actual product being
--   handed over, not test data:
--     - parameters / parameter_values   (all lookup dropdowns: currencies,
--                                         trip statuses, expenditure types,
--                                         participation statuses, etc.)
--     - menus / role_menu_access / roles (navigation + permissions)
--     - process_types / ref_numbering    (ref-number formats — see the
--                                         serial-reset section below, which
--                                         is a separate, narrower step)
--     - workflows / workflow_stages / workflow_transitions
--                                        (the whole Bookings workflow —
--                                         stages, transitions, responsible
--                                         groups)
--     - loyalty_config                   (loyalty programme rules)
--     - dashboard_visibility             (per-role dashboard section config)
--     - receipt_config                   (receipt template config)
--     - users / user_roles               (staff accounts — see note below,
--                                         this is intentional: someone has
--                                         to be able to log in)
--
-- BEFORE RUNNING (do this on the actual target database, not this repo's dev DB):
--   1. Take a full backup first — this is not reversible otherwise:
--        mysqldump -u <user> -p <db_name> > pre_client_deploy_backup.sql
--   2. Read through every section below and confirm it matches what you
--      actually want wiped — this file is deliberately NOT run automatically
--      by anything; it's meant to be reviewed and executed by hand per
--      deployment.
--   3. After running, also clear orphaned uploaded files that no longer have
--      a DB row pointing at them (poster images, avatars):
--        server/uploads/trips/*        (trip posters — all trips are wiped)
--        server/uploads/avatars/*      (only if you also clear user photos —
--                                        not done by this script, see below)
--   4. Log in with an existing staff account, go to Configurations ›
--      Business Setup, and replace the placeholder business profile
--      (currently "Vuenture Brite Adventures" / a placeholder shareholder)
--      with the client's real business details — this script blanks the
--      profile out to templates rather than guessing real values for you.
--
-- NOTE ON STAFF USERS: this script does NOT touch `users` / `user_roles`,
-- on purpose — wiping every login would lock everyone out of the freshly
-- deployed system. Before handing over, review the Users screen yourself:
-- remove any developer/test accounts you don't want the client to see, and
-- have them change passwords on any accounts they're keeping.
-- ============================================================================


-- ── I. Wipe transactional / demo data ──────────────────────────────────────
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE bookings;
TRUNCATE TABLE payments;
TRUNCATE TABLE expenditure;
TRUNCATE TABLE participants;
TRUNCATE TABLE loyalty_points;
TRUNCATE TABLE workflow_history;
TRUNCATE TABLE portal_push_subscriptions;
TRUNCATE TABLE trips;
TRUNCATE TABLE clients;
TRUNCATE TABLE shops;

-- Dormant legacy tables from the pre-adventure (retail/wholesale) version of
-- the app — normally already empty, truncated here only for safety in case
-- any leftover test rows exist.
TRUNCATE TABLE order_items;
TRUNCATE TABLE order_receipts;
TRUNCATE TABLE orders;
TRUNCATE TABLE items;
TRUNCATE TABLE categories;
TRUNCATE TABLE units;

-- Force everyone to log in fresh on the new deployment rather than carrying
-- over dev/test session tokens.
TRUNCATE TABLE user_sessions;

-- Demo shareholder list under the business profile — see section II, which
-- blanks the business profile itself rather than deleting it.
TRUNCATE TABLE business_shareholders;

SET FOREIGN_KEY_CHECKS = 1;


-- ── II. Reset the business profile to a blank template ─────────────────────
-- `business` is a single-row settings table the app expects to always
-- exist, so it's blanked out here rather than truncated — the client fills
-- their real details in via Configurations > Business Setup after deploy.
-- Current contents before this runs are placeholder/demo values
-- ("Vuenture Brite Adventures", info@business.com, etc.) — verified before
-- writing this script, not real client data.
UPDATE business
SET business_name = NULL,
    owner_name = NULL,
    email = NULL,
    phone = NULL,
    location = NULL,
    incorporation_date = NULL,
    logo = NULL
WHERE id = 1;


-- ── III. Reset ref-number counters for every wiped data table ──────────────
-- Only for process types whose data was actually cleared above — explicitly
-- NOT `user_registration` (ADV/USR), since existing staff users (kept, see
-- header note) already hold ref numbers from that counter; resetting it
-- would let a newly-created user collide with an existing one's ref_no.
UPDATE ref_numbering rn
JOIN process_types pt ON rn.process_type_id = pt.id
SET rn.next_serial = rn.initial_serial
WHERE pt.process_type_name IN (
  'client_registration',
  'order_placement',        -- bookings (ADV/BKNG)
  'order_receipt',
  'trip_event_Creation',
  'participant_registration',
  'expenditure_creation',
  'payment_creation'
);

-- ============================================================================
-- End of script. Nothing below the line above needs to run for a clean
-- deployment — everything else in the schema (parameters, menus, roles,
-- workflow, loyalty config, dashboard visibility, receipt config, ref
-- numbering formats, staff users) is left exactly as configured.
-- ============================================================================
