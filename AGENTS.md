# Travel Handbook Generator — AI working rules

These rules apply to every AI or automation that edits this repository.

1. Treat `data/trip.yaml` as the single source of trip content. Do not hard-code itinerary content into HTML, CSS, or JavaScript.
2. Before changing the site, extract all submitted text and screenshots into a confirmation table: confirmed, missing, conflicting, or private.
3. Ask the user to resolve every missing, conflicting, ambiguous, or tentative item before setting `review.status` to `approved`.
4. Never copy original booking screenshots into the public site unless the user explicitly approves a redacted public version.
5. Never publish passport data, full legal names, phone numbers, email addresses, membership numbers, booking references, confirmation codes, ticket codes, PINs, QR codes, barcodes, payment information, or credentials.
6. Do not infer uncertain dates, times, terminals, stations, reservation status, or place identity. Ask.
7. Run `npm run build` after every content or layout change. Do not deploy if validation or privacy checks fail.
8. Preserve responsive behavior, print styles, countdown/NEXT behavior, map links, and accessible labels.
9. Use fictional data in this public template. A user's real trip belongs in their own repository.
10. Publishing requires the user's explicit approval after they review the generated result.
