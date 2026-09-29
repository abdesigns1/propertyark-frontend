# Backend email notification requirements

Email delivery must be triggered by trusted backend events, not by the browser.
The frontend already exposes verification, password reset, notification-channel,
and vendor email-preference controls. The backend should add the following
transactional events.

## New account welcome

After a USER or VENDOR registration is successfully persisted:

- create an in-app notification for the new account;
- queue a welcome email to the verified account email address;
- send each welcome notification once by using the new user ID as the
  idempotency key;
- do not include passwords, verification codes, or authentication tokens in
  the welcome message.

Suggested event: `USER_REGISTERED`

## Point usage

After a point-backed purchase transaction commits successfully:

- create an in-app notification for the vendor;
- queue a transactional email containing the item or service purchased,
  points deducted, remaining balance, transaction reference, and timestamp;
- emit nothing when the transaction fails or rolls back;
- use the point-transaction ID as the idempotency key so retries cannot send
  duplicate receipts.

Suggested event: `POINTS_DEBITED`

## Admin operational notifications

Create an unread admin notification when:

- a KYC document is submitted (`KYC_SUBMITTED`), linking to `/admin/kyc`;
- a property enters the approval queue (`PROPERTY_SUBMITTED`), linking to
  `/admin/properties`;
- a support request or unread support message arrives (`SUPPORT_MESSAGE`),
  linking to `/admin/support`.

Each record should include `type`, `title`, `message`, `priority`, `isRead`,
`createdAt`, `actionUrl`, and `actionLabel`. It should be returned by
`GET /notifications/my` and counted by `GET /notifications/admin/stats`.
