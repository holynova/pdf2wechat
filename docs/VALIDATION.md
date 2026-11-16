# Rebuild validation — 2026-11-16

- TypeScript and production builds passed for all three projects.
- 10 offline tests passed: PDF group / canvas limits (3), video timestamp bounds (3), recognition and backup validation (4).
- Browser: Chromium via ego-browser, desktop and 390 × 844 mobile viewport. No document horizontal overflow in any of the three projects.
- PDF: uploaded a valid four-page mixed-orientation PDF; deselected page 2, reordered page 4, downloaded a 1080 × 3862 JPG. Horizontal + trim + PNG produced 2716 × 1137 and 952 × 490 images, verified ZIP contains both PNG files.
- Movie: decoded bundled six-second MP4 into 48 frames; frame 21 sought to 2.5625 s. Exported real PNGs: contact sheet 2400 × 4740, color strip 2400 × 1200.
- Bookshelf: loaded demo data, manually added a book in a new shelf, reloaded and confirmed 7 books / 2 shelves persisted. Exported JSON and imported the same archive: zero new records, old records retained. API key not present in backup.
- Existing BookshelfDatabase schema/name retained. No migration clears user data.
- Real external vision-model inference was not exercised: no user API credentials were used. The app validates responses and exposes actual request errors / cancellation; demo recognition is explicitly labeled as preset content.
- Remote-video CORS and codec support depend on the source/browser; only the bundled H.264 MP4 was exercised end to end.
- Large document / full-length movie performance was not benchmarked. Resource bounds and cancellation are implemented, with layout/timestamp guard tests.
