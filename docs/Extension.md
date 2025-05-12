# Raycast Extension: Software Subscriptions Manager

## Overview
This project is a Raycast extension designed to help users quickly add, view, and manage their software subscriptions. The extension integrates directly with a Notion database, providing a seamless workflow for tracking recurring expenses and subscription details without leaving the Raycast interface.

## Key Features
- **Add Subscription:** Instantly add new software subscriptions to Notion from Raycast.
- **View Subscriptions:** Display a list of all current subscriptions, including details like price, billing cycle, and status.
- **Edit/Update:** Modify existing subscription entries (e.g., change price, status, or billing cycle).
- **Filter & Search:** Quickly filter subscriptions by status (Active, Trial, Inactive), billing cycle, or priority.
- **Next Billing Date:** Highlight subscriptions with upcoming billing dates.

## User Flow
1. **Open Raycast** and trigger the extension.
2. **Choose an action:** Add or View subscriptions. Both available via Raycast commands.
3. **Interact with Notion:** The extension communicates with the Notion API to fetch or update subscription data.
4. **Confirmation:** Users receive instant feedback on successful actions or errors.

## Technical Implementation
- **Raycast API:** Used to build the UI, handle commands, and manage user input.
- **Notion API:** Handles all data storage, retrieval, and updates for subscription information.
- **Authentication:** Securely store and use Notion integration tokens via Raycast’s environment variables.
- **Error Handling:** All API interactions are wrapped in error handling logic to provide clear user feedback.
- **Performance:** Data is cached where possible to minimize API calls and improve responsiveness.

## Future Enhancements
- **Notifications:** Remind users of upcoming renewals or billing dates.
- **Analytics:** Summarize monthly/yearly spending and trends.