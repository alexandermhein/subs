# Notion Database Structure: Software Subscriptions

## Overview
The Notion database serves as the single source of truth for all software subscription data managed by the Raycast extension. Each row represents a unique subscription and includes properties to track billing, status, and costs.

## Database Fields
- **Subscription (Title):** The name of the software or service.
- **Priority:** Select (High, Low) — Indicates the importance of the subscription.
- **Billing cycle:** Select (Monthly, Annually) — Specifies the billing frequency.
- **Status:** Select (Active, Trial, Inactive) — Tracks the current state of the subscription.
- **Price:** Number ($) — The cost per billing cycle.
- **Annual cost:** Formula — Automatically calculates the yearly cost based on the billing cycle and price.
    - If billing cycle is "Annually": Annual cost = Price
    - If billing cycle is "Monthly": Annual cost = Price × 12
- **Start date:** Date — The date the subscription begins. Entered via a date picker in Raycast and stored as a date in Notion.

## Example Entry
| Subscription | Priority | Billing cycle | Status  | Price | Annual cost | Start date       |
|--------------|---------|--------------|---------|-------|-------------|------------------|
| Adobe CC     | High    | Monthly      | Active  | $20   | $240        | 2025-05-10       |

## Implementation Notes
- The formula for annual cost ensures all subscriptions are normalized to a yearly expense for better financial planning.
- Select fields enforce data consistency and make filtering easier in both Notion and Raycast.