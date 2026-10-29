---
title: Barangay Safety
tagline: Incident reporting with geo-tagging and live maps for high-density barangays in Lipa City.
summary: A full-stack mobile safety platform for barangay-level emergency response. Residents report incidents with GPS-tagged photos; officials see them on a live map, get escalating alerts when a report goes unanswered, and track response times — all on a secured Supabase backend I designed from the schema up.
order: 1
type: Capstone Project
year: 2026
status: Completed
role: Sole Developer — design, mobile, web, backend
platform: Android · Web dashboard
stack: [Flutter, Dart, Supabase, PostgreSQL, Row-Level Security, pg_cron, Edge Functions, Firebase Cloud Messaging, OpenStreetMap, Geolocator, Provider, fl_chart]
logo: /App Logo/Barangay Safety.png
logoBg: '#ffffff'
accent: '#e0574b'
demo: barangay
stats:
  - { value: '5', label: Barangays covered }
  - { value: '4', label: User roles }
  - { value: '27', label: Database migrations }
  - { value: '32', label: Test suites }
features:
  - { title: Geo-tagged reports, text: 'Residents file a report in a few taps — category, photo or video, and their GPS location dropped on a map. Reports queue offline and send when the signal returns.' }
  - { title: Auto-escalation, text: 'An unanswered report escalates at 5, 10 and 15 minutes, widening who gets alerted each time. After hours, the Captain and tanods on call are alerted first. Runs on the server, so it works with every phone closed.' }
  - { title: "\"I'm responding\"", text: 'A Captain, Secretary or tanod can claim a report in one tap; the resident is told help is on the way and the response clock stops.' }
  - { title: Live maps & heatmaps, text: 'Officials see every incident on an interactive map, with a heatmap of hotspots and live tracking of responders on the move.' }
  - { title: Duplicate & fake-report defence, text: 'Perceptual image hashing flags re-used photos, and a trust score built from each account''s history helps officials triage.' }
  - { title: Analytics & exports, text: 'Response-time analytics per barangay, an audit log of every official action, and one-click PDF and Excel exports for reports to the city.' }
  - { title: Privacy by default, text: 'Row-level security on every table, private photo storage with short-lived signed links, ID verification, and an explicit privacy consent flow.' }
  - { title: Built for everyone, text: 'English and Filipino, read-aloud with text-to-speech, and a practice-report tutorial so first-time users learn without sending a real alert.' }
architecture:
  - { name: Mobile app, tech: Flutter · Dart, text: 'One codebase for residents, officials, non-residents and the super admin. Provider for state, flutter_map for maps, an offline queue for bad signal.' }
  - { name: Web dashboard, tech: Flutter Web · Firebase Hosting, text: 'The officials'' command view in the browser — the same code compiled to the web, with cache-busted deploys so stations always run the latest build.' }
  - { name: Database & auth, tech: Supabase · PostgreSQL, text: 'The source of truth. Row-level security decides what every role can see, enforced by the database itself rather than the app.' }
  - { name: Escalation engine, tech: pg_cron · SQL functions, text: 'A scheduled job checks unanswered reports every 30 seconds and escalates them idempotently — no report is ever alerted twice for the same tier.' }
  - { name: Push notifications, tech: Edge Functions · Firebase Cloud Messaging, text: 'A database webhook calls a secured edge function that pushes alerts to phones even when the app is closed.' }
---

## The problem

In high-density barangays, incidents are still reported by phone call, walk-in, or a message to whoever happens to be online. Reports get lost, nobody knows who is already responding, and there is no record of how long help took to arrive.

## What I built

Barangay Safety turns a report into a tracked case. A resident pins the incident on a map with a photo; the barangay hall sees it instantly; if nobody acts, the system escalates on its own until someone does. Every step is timestamped, so the barangay can finally measure its response times.

I built it end to end, alone — the Flutter app, the web dashboard, the database schema and security policies, the escalation engine and the push-notification pipeline.

## What I learned

Security has to live in the database, not the app. Early on I proved that incident photos were readable by anyone with the link, and fixed it by moving them to private storage with signed URLs and writing the policies to match. Since then every feature starts with the question: *who is allowed to see this, and how does the database enforce it?*
