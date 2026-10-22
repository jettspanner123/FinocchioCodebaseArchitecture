# Finocchio

Finocchio is a budget-tracking app with AI-assisted features. This document is the project's domain glossary: the vocabulary used consistently across product discussion, the codebase, and user-facing copy. It intentionally contains no technology, library, or infrastructure detail — see `ARCHITECTURE.md` for that.

## Language

### Money & Transactions

**Transaction**:
A single record of money spent, manually entered by a user, belonging to exactly one Category.
_Avoid_: Expense, entry, record

**Category**:
A user-defined label for grouping Transactions (e.g., "Groceries", "Travel"). Every Category is either Personal or Shared.
_Avoid_: Tag, bucket

**Personal Category**:
A Category visible and editable only by the single user who created it.
_Avoid_: Private category

**Currency**:
The single currency (Indian Rupee) a user's account operates in, fixed at signup. Finocchio does not convert between currencies.

### Budgeting

**Budget Cap**:
A spending limit a user sets on a Category over a period (default: monthly).
_Avoid_: Limit, allowance

**Budget Alert**:
A notification triggered when spending against a Budget Cap crosses a threshold (80% and 100% of the cap).
_Avoid_: Warning, overspend notice

**Recurring Transaction**:
A Transaction template that automatically generates a new Transaction instance on a repeating schedule (e.g., a monthly subscription).
_Avoid_: Scheduled transaction, subscription (subscription is one example of a Recurring Transaction, not a synonym for it)

**Personal Budget Attribution**:
A per-user setting controlling whether that user's share of a Shared Category's Transactions counts toward their own Budget Cap.

### Shared Spending

**Shared Category**:
A Category with more than one Member, where any Member can log a Transaction against it and the cost is divided among Members via a Split.
_Avoid_: Group category, household (Finocchio has no separate "household" concept — a Shared Category is the only sharing unit)

**Member**:
A Finocchio account holder who has been added to a Shared Category and can log Transactions against it and participate in Splits.
_Avoid_: Participant, collaborator

**Split**:
How a Shared Category Transaction's cost is divided among its Members. A Split has one of four modes: **Equal** (divided evenly among all Members), **Subset** (divided evenly among a chosen subset of Members), **Percentage** (each Member assigned a percentage of the total), or **Exact** (each Member assigned a fixed amount).
_Avoid_: Divide, share (ambiguous with Shared Category)

**Balance**:
The running amount one Member owes another within a Shared Category, derived from that Member's unsettled Splits.
_Avoid_: Debt, owed amount

**Settlement**:
The act of marking a Balance between two Members as paid. A Settlement is a ledger notation only — Finocchio does not move real money.
_Avoid_: Payment, payout, transfer

### Offline Behavior

**Offline Queue**:
The set of a user's actions taken while their device has no connection, shown to the user as pending until the device reconnects and the actions complete.
_Avoid_: Pending actions, sync queue

### AI Features

**Auto-Categorization**:
An AI feature that suggests a Category for a newly entered Transaction.

**Receipt Scan**:
An AI feature that extracts a Transaction's details (amount, merchant, date) from a photo of a paper receipt.
_Avoid_: Receipt OCR (OCR is one implementation technique, not the product-level name)

**Spending Insight**:
An AI-generated observation about a user's spending pattern, including anomaly detection (e.g., "you spent 40% more on dining this month").
_Avoid_: Alert (Alert is reserved for Budget Alert)

**Forecast**:
An AI-generated prediction of a user's future balance or spending trajectory.

**Conversational Assistant**:
The in-app AI chat feature a user can ask questions of, or direct to perform an Assistant Action.
_Avoid_: Chatbot, AI chat

**Assistant Action**:
A data-modifying operation (e.g., creating a Transaction, marking a Settlement) that the Conversational Assistant proposes on the user's behalf. An Assistant Action never takes effect on its own — it always requires the user to approve a Confirmation Card first.
_Avoid_: AI action, command

**Confirmation Card**:
The in-chat prompt the Conversational Assistant shows to obtain a user's explicit approval before an Assistant Action takes effect.
_Avoid_: Confirmation dialog, approval popup
