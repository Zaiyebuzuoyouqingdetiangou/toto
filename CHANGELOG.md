# Changelog

## 0.34.0-beta.2 — Public Beta

- Removed the bundled Quick Reply menu asset, download button, related UI text, and the unused legacy point-order rule file from the public package.
- “User directive priority” now means only a RabbitMirror requirement manually written in the latest user message.
- Reworded the matched-directive Prompt fragment without increasing normal per-generation injection; the matched fragment is shorter than beta.1.
- Kept Maintenance Rabbit v1.59 hidden-clone verification and the warm-light token meter unchanged.

## 0.34.0-beta.1 — Public Beta

- Maintenance Rabbit upgraded to v1.59.
- Full-chain labeled-checkbox verification moved from the live RabbitMirror to an isolated hidden clone.
- The diagnostic no longer calls `.click()` or dispatches `click`, `input`, or `change` events for its automatic probe.
- Added explicit diagnostic evidence that the live control was not touched and the sandbox was destroyed.
- Token meter changed to a fixed warm-light high-contrast panel.
- Added public README and limited personal-use license.
- Prompt text, output-lock order, mother-library budget, and Feedback Cat v1.4 remain unchanged.

## 0.33.87-test.1

- Added live labeled checkbox/radio verification and WebView checked-state rollback correction.
