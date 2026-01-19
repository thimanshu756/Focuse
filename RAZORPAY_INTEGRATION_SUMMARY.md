# Razorpay Subscription Integration - Executive Summary

**Date:** January 2026  
**Plans:** Monthly ₹95 | Yearly ₹600  
**Goal:** Production-grade subscription system

---

## 📊 What We Need to Build

### 1. Database Changes (6 New Models)

**Update Existing:**

- `User`: Change `stripeCustomerId` → `razorpayCustomerId`, add relations

**Add New Models:**

- `Subscription` - Track user subscriptions (status, billing cycle, renewal)
- `Payment` - Every payment transaction (success/failed/refunded)
- `WebhookEvent` - Store all Razorpay webhooks (for idempotency)
- `SubscriptionAuditLog` - Audit trail for compliance
- `PlanConfiguration` - Dynamic plan management

**Add 7 New Enums:**

- `SubscriptionPlanType` (MONTHLY, YEARLY)
- `PaymentStatus` (PENDING, CAPTURED, FAILED, REFUNDED)
- `PaymentMethod` (CARD, UPI, NETBANKING, WALLET)
- `WebhookStatus` (PENDING, PROCESSING, PROCESSED, FAILED)
- `RazorpayEventType` (15+ webhook event types)
- `SubscriptionAction` (CREATED, ACTIVATED, CANCELLED, etc.)
- `SubscriptionActor` (USER, SYSTEM, ADMIN, WEBHOOK)

---

## 🏗️ Architecture Overview

```
User Upgrades → API → Create Razorpay Subscription → Open Checkout Modal
                ↓
        User Pays with Razorpay
                ↓
Payment Success → Verify Signature → Activate Subscription
                ↓
        Webhook Arrives (async)
                ↓
Process Webhook → Record Payment → Send Email

User API Request → Validate Subscription → Check Expiry → Allow/Deny
                ↓
        If Expired → Downgrade to FREE (on-the-fly)
```

---

## 🔒 Critical Security Requirements

1. **Webhook Signature Verification** (HMAC SHA-256) - MUST verify every webhook
2. **Payment Signature Verification** - Verify user payment before activation
3. **Idempotency** - Store webhook event IDs to prevent duplicate processing
4. **Rate Limiting** - 10 req/min per user, 1000 req/min for webhooks
5. **Data Encryption** - Encrypt Razorpay customer IDs at rest
6. **PCI-DSS Compliance** - Never store full card numbers (only last 4 digits)

---

## 🛣️ API Endpoints (8 Total)

### User Endpoints

1. `GET /api/v1/subscription/plans` - List available plans
2. `POST /api/v1/subscription/create` - Create subscription
3. `POST /api/v1/subscription/verify` - Verify payment after Razorpay
4. `GET /api/v1/subscription/current` - Get user's subscription
5. `POST /api/v1/subscription/cancel` - Cancel subscription
6. `POST /api/v1/subscription/resume` - Resume cancelled subscription
7. `POST /api/v1/subscription/update-payment-method` - Update card

### System Endpoint

8. `POST /api/v1/webhooks/razorpay` - Razorpay webhook handler (NO AUTH)

---

## ⚡ Critical Webhook Events to Handle

1. **subscription.activated** → Activate user PRO
2. **subscription.charged** → Record payment, extend period, send receipt
3. **subscription.cancelled** → Mark cancelled, set expiry date
4. **payment.failed** → Increment retry count, notify user
5. **refund.processed** → Mark refund, downgrade if full refund

---

## 🎯 8 Edge Cases We MUST Handle

1. **Duplicate Payments** → Check for existing active subscription before creating
2. **Webhook Replay Attack** → Store event IDs, reject duplicates
3. **Race Condition (User + Webhook)** → Use database transactions with optimistic locking
4. **Out-of-Order Webhooks** → Validate state transitions, reject old timestamps
5. **Failed Razorpay API** → Compensating transactions, cleanup orphaned records
6. **Partial Refunds** → Calculate prorated amount based on usage
7. **User Cancels then Resubscribes** → Reactivate existing subscription if not expired
8. **Expired Subscriptions** → Validate subscription expiry in user APIs, downgrade on-the-fly

---

## 📝 Core Services to Build

### 1. `subscription.service.ts`

- `createSubscription()` - Create in DB + Razorpay
- `verifyPayment()` - Verify signature and activate
- `cancelSubscription()` - Cancel with period end or immediate
- `resumeSubscription()` - Reactivate cancelled sub
- `syncWithRazorpay()` - Sync status from Razorpay
- `validateSubscription()` - Check if user has active PRO (for API validation)
- `checkAndUpdateExpired()` - Check expiry and downgrade if needed
- `getUserSubscriptionTier()` - Get current tier (FREE/PRO)

### 2. `payment.service.ts`

- `recordPayment()` - Store payment transaction
- `verifySignature()` - HMAC verification
- `processRefund()` - Handle refunds

### 3. `webhook.service.ts`

- `verifyWebhookSignature()` - Security check
- `processWebhook()` - Route to correct handler
- `handleSubscriptionActivated()` - Activate PRO
- `handleSubscriptionCharged()` - Record renewal
- `handlePaymentFailed()` - Handle failures
- Retry logic with exponential backoff

---

## ✅ Subscription Validation in User APIs

**Strategy:** Validate subscription status on-demand in user-facing APIs instead of background jobs.

### Middleware/Service: `subscription.middleware.ts` or `subscription.service.ts`

**Key Functions:**

- `validateSubscription()` - Check if user has active PRO subscription
- `checkAndUpdateExpired()` - Check expiry date, downgrade if expired
- `getUserSubscriptionTier()` - Return current tier (FREE/PRO)

### Where to Validate:

**In User APIs (validate on each request):**

- `GET /api/v1/tasks` - Check PRO for advanced features
- `POST /api/v1/ai/*` - Check PRO for unlimited AI requests
- `GET /api/v1/insights` - Check PRO for advanced insights
- `GET /api/v1/sessions` - Check PRO for export features
- Any API that requires PRO features

**Validation Logic:**

```typescript
async function validateSubscription(userId: string): Promise<boolean> {
  const user = await getUserWithSubscription(userId);

  // Check if subscription exists and is active
  if (user.subscriptionTier === 'PRO' && user.subscriptionStatus === 'ACTIVE') {
    const subscription = await getActiveSubscription(userId);

    // Check if expired
    if (subscription && subscription.currentPeriodEnd < new Date()) {
      // Downgrade on-the-fly
      await downgradeToFree(userId);
      return false;
    }

    return true;
  }

  return false;
}
```

**Benefits:**

- ✅ No background jobs needed
- ✅ Real-time validation
- ✅ Automatic downgrade when expired
- ✅ Simpler architecture

---

## 📅 Implementation Plan (6 Weeks)

### Week 1: Foundation

- Update Prisma schema (6 models + 7 enums)
- Run migrations
- Setup Razorpay account (test + prod)
- Create plans in Razorpay dashboard
- Add environment variables

### Week 2: Core Backend

- Build 3 core services (subscription, payment, webhook)
- Create 8 API endpoints
- Add subscription validation middleware/service
- Add request validation
- Implement signature verification
- Write unit tests

### Week 3: Webhook System & Validation

- Build webhook handler with idempotency
- Implement 5 event handlers
- Add retry logic with exponential backoff
- Test with Razorpay webhook simulator
- Integrate subscription validation in user APIs
- Add PRO feature checks in existing endpoints

### Week 4: Frontend

- Build pricing page with plans
- Integrate Razorpay Checkout SDK
- Build subscription dashboard
- Show/hide PRO features
- Create email templates (5 types)

### Week 5: Testing & Monitoring

- Write integration tests
- End-to-end testing
- Load testing
- Setup error tracking (Sentry)
- Setup logging (Winston)
- Create admin dashboard

### Week 6: Launch

- Deploy to staging
- Test with Razorpay test mode
- Security audit
- Deploy to production
- Monitor for 48 hours
- Announce to users

---

## 💰 Pricing & Features

### FREE Plan

- 5 AI requests/month
- Basic focus timer
- Basic analytics
- 1 device

### PRO Plan - Monthly (₹95/month)

- Unlimited AI requests
- Advanced analytics & insights
- Export to CSV/PDF
- 5 devices
- Priority support

### PRO Plan - Yearly (₹600/year)

- All monthly features
- **Save ₹540 (47% off!)**
- Most popular choice

---

## 🚨 Risk Mitigation

### Risk 1: Webhook Loss

**Solution:** Retry logic with exponential backoff + manual sync API

### Risk 2: Payment Disputes

**Solution:** Complete audit trail + clear transaction records + T&C

### Risk 3: Security Breach

**Solution:** Signature verification + rate limiting + encryption

### Risk 4: Razorpay Downtime

**Solution:** Graceful errors + retry after recovery + user notification

### Risk 5: Expired Subscriptions Not Detected

**Solution:** On-demand validation in user APIs + automatic downgrade on expiry check

---

## 🔑 Environment Variables Needed

```env
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=secret_xxxxx
RAZORPAY_WEBHOOK_SECRET=webhook_secret_xxxxx
RAZORPAY_PLAN_MONTHLY=plan_monthly_xxxxx
RAZORPAY_PLAN_YEARLY=plan_yearly_xxxxx
ENCRYPTION_KEY=32_char_key
PAYMENT_TIMEOUT_SECONDS=600
ENABLE_SUBSCRIPTIONS=true
```

---

## 📦 New Dependencies

```json
{
  "razorpay": "^2.9.2", // Razorpay Node SDK
  "winston": "^3.11.0", // Logging
  "date-fns": "^2.30.0" // Date utilities
}
```

---

## ✅ Success Criteria

### Technical

- Webhook processing: 99.9% success rate
- Payment verification: < 2 seconds
- API uptime: 99.95%
- Failed payment retry: 70% success

### Business

- Conversion rate: > 5%
- Churn rate: < 10% per month
- Track MRR (Monthly Recurring Revenue)
- Track ARPU (Average Revenue Per User)

---

## 🎯 Key Decisions Needed

1. **Trial Period?** Currently disabled. Enable 7-day trial?
2. **Refund Policy?** Prorated refunds for cancellations?
3. **Grace Period?** How many days after payment failure before downgrade?
4. **Email Service?** Which email provider (SendGrid/Postmark)?
5. **Admin Dashboard?** Build custom or use Retool/AdminJS?
6. **Validation Strategy?** Middleware vs service function in each API?

---

## 📞 Next Steps

1. **Review this summary** and discuss any concerns
2. **Make key decisions** (see above)
3. **Approve to proceed** to execution mode
4. **Setup Razorpay account** (test + production)
5. **Start Week 1** implementation

---

**Estimated Effort:** 6 weeks (1-2 developers)  
**Complexity:** Medium-High  
**Risk Level:** Medium (with proper testing)

**Questions? Let's discuss before moving to execution mode!**
