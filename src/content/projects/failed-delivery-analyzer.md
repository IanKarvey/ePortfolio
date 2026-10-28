---
title: Failed Delivery Analyzer
tagline: Finds out why deliveries fail, which areas struggle, and which parcels needed a second trip.
summary: A data tool for a delivery operation. It records every delivery attempt, tracks redeliveries, and turns the records into success rates by area, failure-reason breakdowns and trend charts — available both as a desktop app and as a fast keyboard-driven terminal program.
order: 3
type: Client Commission
year: 2026
status: Delivered
role: Sole Developer
platform: Windows desktop · Terminal
stack: [Python, Tkinter, Matplotlib, CSV, PyInstaller, Automated tests]
logo: /projects/delivery-badge.svg
logoBg: '#14110d'
accent: '#dbb95e'
demo: delivery
stats:
  - { value: '12', label: Features }
  - { value: '4', label: Charts }
  - { value: '79', label: Automated tests }
  - { value: '2', label: Interfaces }
features:
  - { title: Attempt-level records, text: 'Every delivery attempt is its own record. Adding a redelivery reuses the Delivery ID and fills in the area and next attempt number automatically.' }
  - { title: Rules that keep data honest, text: 'A successful attempt cannot have a failure reason, a failed one must have one, and a delivery that already succeeded cannot get more attempts.' }
  - { title: Failure analysis, text: 'Counts every failure reason and surfaces the most common one, so the team knows what to fix first.' }
  - { title: Area performance, text: 'Success rate for each area, with the weakest area marked.' }
  - { title: Redelivery tracking, text: 'How many attempts each delivery needed, and the full history of every attempt.' }
  - { title: Two interfaces, one engine, text: 'A windowed app for daily use and a menu-driven terminal version for speed — both run on the same core and always give the same numbers.' }
architecture:
  - { name: Core engine, tech: Python, text: 'Validation rules, redelivery logic and every calculation live in one module that both interfaces share.' }
  - { name: Desktop app, tech: Tkinter, text: 'Records, Redelivery Tracking, Analysis and Charts tabs, with inline validation next to each field that needs fixing.' }
  - { name: Terminal app, tech: Python console, text: 'Twelve numbered menu options covering every feature, for keyboard-only use.' }
  - { name: Charts, tech: Matplotlib, text: 'Failures by reason, success rate by area, redelivery trends and a delivery-status pie.' }
  - { name: Quality, tech: Automated tests, text: '79 tests cover the rules and calculations, so a change in one interface can never quietly break the other.' }
---

## The problem

Failed deliveries cost money twice — the wasted trip and the redelivery. The operation knew it had a problem but not where: which areas, which reasons, how many second attempts.

## What I built

A tool that treats every attempt as data. Once records go in, the answers come out on their own: the success rate, the most common failure reason, the weakest area, and the trend over time. I built both a desktop version and a terminal version on one shared engine, so the numbers always agree.

## What I learned

When two interfaces share one engine, tests are what make that promise true. Writing 79 of them changed how I design: rules first, interface second.
