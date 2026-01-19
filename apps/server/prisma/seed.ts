import { PrismaClient, SubscriptionTier, SubscriptionPlanType } from '@prisma/client';
import { config } from 'dotenv';

// Load environment variables
config();

const prisma = new PrismaClient();

// Type for metadata JSON field
type PlanMetadata = {
  monthlyEquivalent?: number;
  savingsVsYearly?: number;
  savingsAmount?: number;
};

async function main() {
  console.log('🌱 Starting seed...');

  // PRO Monthly Plan - ₹95/month
  const monthlyFeatures = [
    'Unlimited AI requests',
    'Advanced analytics & insights',
    'Export to CSV/PDF',
    'Up to 5 devices',
    'Priority support',
    'Weekly AI insights',
    'Task breakdown & scheduling',
    'Focus time optimization',
  ];

  const monthlyMetadata: PlanMetadata = {
    monthlyEquivalent: 1140, // ₹95 * 12 = ₹1140/year
    savingsVsYearly: 0,
  };

  const monthlyPlan = await prisma.planConfiguration.upsert({
    where: { planId: 'pro_monthly' },
    update: {
      // Update existing plan if it exists
      name: 'Pro Monthly',
      description: 'Unlock unlimited AI requests, advanced analytics, and premium features',
      tier: SubscriptionTier.PRO,
      billingPeriod: SubscriptionPlanType.MONTHLY,
      amount: 9500, // ₹95 in paise
      currency: 'INR',
      features: monthlyFeatures as any,
      aiRequestsLimit: null, // null = unlimited
      maxDevices: 5,
      exportEnabled: true,
      prioritySupport: true,
      isActive: true,
      displayOrder: 1,
      isPopular: false,
      savingsPercentage: null,
      trialDays: 0,
      razorpayPlanId: process.env.RAZORPAY_PLAN_MONTHLY || '', // Will be set from env
      metadata: monthlyMetadata as any,
    },
    create: {
      planId: 'pro_monthly',
      name: 'Pro Monthly',
      description: 'Unlock unlimited AI requests, advanced analytics, and premium features',
      tier: SubscriptionTier.PRO,
      billingPeriod: SubscriptionPlanType.MONTHLY,
      amount: 9500, // ₹95 in paise
      currency: 'INR',
      features: monthlyFeatures as any,
      aiRequestsLimit: null, // null = unlimited
      maxDevices: 5,
      exportEnabled: true,
      prioritySupport: true,
      isActive: true,
      displayOrder: 1,
      isPopular: false,
      savingsPercentage: null,
      trialDays: 0,
      razorpayPlanId: process.env.RAZORPAY_PLAN_MONTHLY || '', // Will be set from env
      metadata: monthlyMetadata as any,
    },
  });

  console.log('✅ Monthly plan seeded:', monthlyPlan.name);

  // PRO Yearly Plan - ₹600/year
  const yearlyFeatures = [
    'Unlimited AI requests',
    'Advanced analytics & insights',
    'Export to CSV/PDF',
    'Up to 5 devices',
    'Priority support',
    'Weekly AI insights',
    'Task breakdown & scheduling',
    'Focus time optimization',
    'Best value - Save 47%',
  ];

  const yearlyMetadata: PlanMetadata = {
    monthlyEquivalent: 50, // ₹600 / 12 = ₹50/month
    savingsVsYearly: 540, // ₹1140 - ₹600 = ₹540 saved
    savingsAmount: 54000, // ₹540 in paise
  };

  const yearlyPlan = await prisma.planConfiguration.upsert({
    where: { planId: 'pro_yearly' },
    update: {
      // Update existing plan if it exists
      name: 'Pro Yearly',
      description: 'All Pro features with maximum savings - 47% off monthly plan!',
      tier: SubscriptionTier.PRO,
      billingPeriod: SubscriptionPlanType.YEARLY,
      amount: 60000, // ₹600 in paise
      currency: 'INR',
      features: yearlyFeatures as any,
      aiRequestsLimit: null, // null = unlimited
      maxDevices: 5,
      exportEnabled: true,
      prioritySupport: true,
      isActive: true,
      displayOrder: 0, // Show first (most popular)
      isPopular: true,
      savingsPercentage: 47.37, // (1140 - 600) / 1140 * 100 = 47.37%
      trialDays: 0,
      razorpayPlanId: process.env.RAZORPAY_PLAN_YEARLY || '', // Will be set from env
      metadata: yearlyMetadata as any,
    },
    create: {
      planId: 'pro_yearly',
      name: 'Pro Yearly',
      description: 'All Pro features with maximum savings - 47% off monthly plan!',
      tier: SubscriptionTier.PRO,
      billingPeriod: SubscriptionPlanType.YEARLY,
      amount: 60000, // ₹600 in paise
      currency: 'INR',
      features: yearlyFeatures as any,
      aiRequestsLimit: null, // null = unlimited
      maxDevices: 5,
      exportEnabled: true,
      prioritySupport: true,
      isActive: true,
      displayOrder: 0, // Show first (most popular)
      isPopular: true,
      savingsPercentage: 47.37, // (1140 - 600) / 1140 * 100 = 47.37%
      trialDays: 0,
      razorpayPlanId: process.env.RAZORPAY_PLAN_YEARLY || '', // Will be set from env
      metadata: yearlyMetadata as any,
    },
  });

  console.log('✅ Yearly plan seeded:', yearlyPlan.name);

  console.log('\n📊 Seeded Plans Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📅 Monthly Plan: ${monthlyPlan.name}`);
  console.log(`   Price: ₹${monthlyPlan.amount / 100}/month`);
  console.log(`   Razorpay Plan ID: ${monthlyPlan.razorpayPlanId || '⚠️  Not set (set RAZORPAY_PLAN_MONTHLY in .env)'}`);
  console.log('');
  console.log(`📅 Yearly Plan: ${yearlyPlan.name}`);
  console.log(`   Price: ₹${yearlyPlan.amount / 100}/year`);
  const yearlyMetadataObj = yearlyPlan.metadata as PlanMetadata;
  console.log(`   Savings: ${yearlyPlan.savingsPercentage}% (₹${yearlyMetadataObj.savingsVsYearly || 0} saved)`);
  console.log(`   Razorpay Plan ID: ${yearlyPlan.razorpayPlanId || '⚠️  Not set (set RAZORPAY_PLAN_YEARLY in .env)'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n✨ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
