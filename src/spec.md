# Specification

## Summary
**Goal:** Add a bottom-right helper bot widget (“Tingi”) to the main memories experience that can answer questions using Google Custom Search and return short funny summaries.

**Planned changes:**
- Add a floating bottom-right Tingi launcher icon that appears only after the password gate and after the welcome page is dismissed.
- Implement an open/close Tingi panel/dialog with accessible title, close action, and warm theme-consistent styling.
- Add a simple chat-like UI (question input + send), with loading/disabled states, error handling, and mobile/desktop-safe layout.
- Integrate Google Custom Search JSON API calls from the frontend and add in-widget fields to configure/save API key and cx in browser local storage.
- Display a short funny, template-based summary derived from Google results (and optionally a compact list of top results: title + link).
- Add and use a generated static icon image asset for the Tingi launcher button with appropriate alt/aria labeling.

**User-visible outcome:** After entering the site and dismissing the welcome page, visitors can open the Tingi helper in the bottom-right corner, configure Google search credentials if needed, ask a question, and receive a short funny summary based on Google search results.
