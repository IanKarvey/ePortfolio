---
title: GMD Bakery Planner
tagline: An order and production planner for GMD Bakery — home of the special Mamon de Tabla since 1986.
summary: A desktop app that replaced handwritten order slips at GMD Bakery. It records orders, tells the baker exactly how many pieces of each product to bake for any day, keeps count of stock, and turns sales into reports and charts — packaged so it runs from a USB drive with nothing to install.
order: 2
type: Client Commission
year: 2026
period: October 2026
status: Delivered
role: Sole Developer
client: GMD Bakery
platform: Windows desktop
stack: [Python, Tkinter, Matplotlib, Pillow, CSV, PyInstaller]
logo: /projects/gmd-bakery-badge.jpg
logoBg: '#ffffff'
accent: '#63ab33'
demo: bakery
stats:
  - { value: '7', label: Modules }
  - { value: '3', label: Chart types }
  - { value: '0', label: Installs needed }
  - { value: '2.3k', label: Lines of Python }
features:
  - { title: Orders in seconds, text: 'Pick a product and the price fills itself in. Press Enter to save. New products typed in are remembered, with their price, for next time.' }
  - { title: The baker's to-do list, text: 'For any date, the production plan shows how many pieces are needed, how many are already in stock, and how many are still to bake — with a printable bake sheet.' }
  - { title: Inventory that adds up, text: 'Record what was baked or wasted; stock is calculated from baking records minus completed orders, with one-click undo.' }
  - { title: Search & filter, text: 'Find any order by customer, product, status or date range — the list narrows as you type.' }
  - { title: Reports & charts, text: 'Daily sales, best day, most-ordered product, quantity per product, sales trend and sales share — always reflecting the current orders.' }
  - { title: Never loses data, text: 'Saves after every change, keeps a last-session backup, survives a file opened in Excel, and falls back to a safe folder if Windows blocks the program''s own.' }
architecture:
  - { name: Interface, tech: Tkinter · custom UI kit, text: 'Seven tabs with full keyboard support — Ctrl+1…7 to switch, Ctrl+N for a new order, a visible focus ring for every control.' }
  - { name: Planning logic, tech: Python, text: 'Turns open orders into a per-product bake list for a chosen day, netting off what is already in stock.' }
  - { name: Storage, tech: CSV files, text: 'Plain files the owner can open in Excel. Damaged rows are skipped and reported instead of crashing the program.' }
  - { name: Charts, tech: Matplotlib, text: 'Bar, line and pie charts embedded in the app, redrawn from live data.' }
  - { name: Packaging, tech: PyInstaller, text: 'Built into a portable Windows program — copy the folder, double-click, done. No Python, no internet.' }
---

## The problem

GMD Bakery took orders on paper. Working out how many of each bread to bake for tomorrow meant adding up slips by hand, which led to overproduction on some days and running short on others.

## What I built

A planner designed for the people who actually use it: big clear tabs, prices that fill themselves in, and a production plan that answers the one question the baker asks every morning — *how many do I still need to bake?* It ships as a portable program, so the bakery can run it on any Windows computer without installing anything.

## What I learned

Real users don't read manuals. Every error message says what to do next in plain words, the app recovers on its own from the things people really do (like leaving the data file open in Excel), and nothing is ever lost.
