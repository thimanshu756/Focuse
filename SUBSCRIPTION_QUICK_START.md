# Subscription System - Quick Start Guide

## 🚀 Setup (5 Minutes)

### 1. Install Dependencies (if not already installed)

```bash
cd apps/web
npm install framer-motion lucide-react react-hot-toast date-fns
```

### 2. Backend Setup

```bash
cd apps/server

# Add environment variables to .env
echo "RAZORPAY_KEY_ID=your_key_id" >> .env
echo "RAZORPAY_KEY_SECRET=your_key_secret" >> .env
echo "RAZORPAY_WEBHOOK_SECRET=your_webhook_secret" >> .env
echo "RAZORPAY_PLAN_MONTHLY=plan_xxxxx" >> .env
echo "RAZORPAY_PLAN_YEARLY=plan_xxxxx" >> .env

# Run database migration
npx prisma migrate dev --name add_subscription_models

# Seed plans
npx prisma db seed

# Start server
npm run dev
```

### 3. Frontend Setup

```bash
cd apps/web

# Add environment variable to .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8080/api" >> .env.local

# Start dev server
npm run dev
```

### 4. Razorpay Dashboard Setup

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Switch to **Test Mode**
3. Create two subscription plans:
   - **Pro Monthly**: ₹95/month
   - **Pro Yearly**: ₹600/year
4. Copy Plan IDs to `.env`
5. Setup webhook:
   - URL: `https://your-domain.com/api/v1/webhooks/razorpay`
   - Events: `subscription.*`, `payment.*`, `refund.*`
   - Copy webhook secret to `.env`

## 🎯 Test the Integration

### 1. View Pricing Page

Visit: `http://localhost:3000/pricing`

### 2. Test Payment (Test Mode)

Use Razorpay test cards:

- **Success**: `4111 1111 1111 1111`
- **Failure**: `4000 0000 0000 0002`
- CVV: Any 3 digits
- Expiry: Any future date

### 3. Check Subscription

After successful payment, visit dashboard or profile to see subscription status.

## 📂 Where to Add Components

### Profile/Settings Page

Add subscription manager:

```tsx
// In your profile/settings page
import { SubscriptionManager } from '@/components/subscription';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Other settings */}

      <section>
        <h2 className="text-xl font-semibold mb-4">Subscription</h2>
        <SubscriptionManager />
      </section>
    </div>
  );
}
```

### Dashboard - Add Upgrade CTA

Show upgrade button for free users:

```tsx
import { useSubscription } from '@/hooks/useSubscription';
import { ProBadge } from '@/components/subscription';

export default function Dashboard() {
  const { isPro } = useSubscription();

  return (
    <div>
      <header className="flex items-center justify-between">
        <h1>Dashboard {isPro && <ProBadge />}</h1>
        {!isPro && (
          <Link href="/pricing">
            <button className="bg-[#D7F50A] px-4 py-2 rounded-full">
              Upgrade to PRO
            </button>
          </Link>
        )}
      </header>
      {/* Rest of dashboard */}
    </div>
  );
}
```

### Feature Gating Example

Protect AI features:

```tsx
import { useState } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { UpgradePrompt } from '@/components/subscription';

export default function AIFeature() {
  const { isPro } = useSubscription();
  const [showUpgrade, setShowUpgrade] = useState(false);

  const handleAIRequest = () => {
    if (!isPro) {
      setShowUpgrade(true);
      return;
    }
    // Make AI request
  };

  return (
    <>
      <button onClick={handleAIRequest}>Generate AI Insights</button>

      <UpgradePrompt
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        feature="unlimited AI requests"
      />
    </>
  );
}
```

## 🧪 Testing Checklist

- [ ] Navigate to `/pricing` - page loads correctly
- [ ] Click "Subscribe Now" - Razorpay checkout opens
- [ ] Complete test payment - redirects to dashboard
- [ ] Check profile/settings - shows active subscription
- [ ] Test cancel subscription - works correctly
- [ ] Test resume subscription - works correctly
- [ ] Test webhook delivery - check backend logs
- [ ] Test mobile responsive - all pages work

## 🎨 Customization

### Change Colors

Edit `tailwind.config.ts`:

```js
colors: {
  primary: {
    accent: '#D7F50A', // Your brand color
    soft: '#E9FF6A',
  },
}
```

### Change Pricing

Update in Razorpay dashboard, then re-run:

```bash
npx prisma db seed
```

### Add Features to Plans

Edit `apps/server/prisma/seed.ts`:

```typescript
features: [
  'Unlimited AI requests',
  'Your new feature',
  // ... more features
],
```

## 📞 Support

If you encounter issues:

1. Check browser console for errors
2. Check backend logs
3. Verify Razorpay dashboard for webhook delivery
4. Check database for subscription records
5. Ensure all environment variables are set

## 🎉 You're Ready!

Your subscription system is live! Users can now:

- Subscribe to PRO plans
- Manage their subscriptions
- Access premium features

Navigate to `/pricing` to see it in action! 🚀
