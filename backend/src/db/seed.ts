// src/db/seed.ts
// Development seed — populates DB with realistic student finance data.

import { prisma } from '../config/database';
import bcrypt from 'bcryptjs';
import { TransactionType, TransactionCategory } from '@prisma/client';
import { subDays } from 'date-fns';

async function seed() {
  console.log('🌱 Seeding database...');

  // Clean up
  await prisma.transaction.deleteMany();
  await prisma.savingsGoal.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.insight.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // Create demo user
  const passwordHash = await bcrypt.hash('Demo@1234', 12);
  const user = await prisma.user.create({
    data: {
      email: 'demo@pocketpilot.app',
      name: 'Alex Kumar',
      passwordHash,
      monthlyBudget: 15000,
      onboardingDone: true,
    },
  });

  console.log(`✅ User created: ${user.email}`);

  // Generate 3 months of realistic transactions
  const transactions = [
    // Current month
    { name: 'Swiggy', cat: TransactionCategory.FOOD,          amt: 349,   daysAgo: 1 },
    { name: 'Netflix', cat: TransactionCategory.SUBSCRIPTIONS, amt: 649,  daysAgo: 2 },
    { name: 'Amazon',  cat: TransactionCategory.SHOPPING,      amt: 2199, daysAgo: 3 },
    { name: 'Uber',    cat: TransactionCategory.TRANSPORT,     amt: 185,  daysAgo: 3 },
    { name: 'Zomato',  cat: TransactionCategory.FOOD,          amt: 412,  daysAgo: 4 },
    { name: 'Spotify', cat: TransactionCategory.SUBSCRIPTIONS, amt: 119,  daysAgo: 5 },
    { name: 'Blinkit', cat: TransactionCategory.SHOPPING,      amt: 876,  daysAgo: 6 },
    { name: 'Swiggy',  cat: TransactionCategory.FOOD,          amt: 289,  daysAgo: 7 },
    { name: 'Ola',     cat: TransactionCategory.TRANSPORT,     amt: 220,  daysAgo: 8 },
    { name: 'Steam',   cat: TransactionCategory.GAMING,        amt: 999,  daysAgo: 9 },
    { name: 'Salary',  cat: TransactionCategory.SALARY,        amt: 18000, daysAgo: 15, credit: true },
    { name: 'Swiggy',  cat: TransactionCategory.FOOD,          amt: 520,  daysAgo: 16 },
    { name: 'Airtel',  cat: TransactionCategory.BILLS,         amt: 399,  daysAgo: 18 },
    { name: 'Myntra',  cat: TransactionCategory.SHOPPING,      amt: 1499, daysAgo: 20 },
    { name: 'Freelance', cat: TransactionCategory.FREELANCE,   amt: 5000, daysAgo: 22, credit: true },
    // Last month
    { name: 'Zomato',  cat: TransactionCategory.FOOD,          amt: 380,  daysAgo: 35 },
    { name: 'Netflix', cat: TransactionCategory.SUBSCRIPTIONS, amt: 649,  daysAgo: 32 },
    { name: 'Amazon',  cat: TransactionCategory.SHOPPING,      amt: 3400, daysAgo: 40 },
    { name: 'Salary',  cat: TransactionCategory.SALARY,        amt: 18000, daysAgo: 45, credit: true },
    { name: 'Udemy',   cat: TransactionCategory.EDUCATION,     amt: 499,  daysAgo: 48 },
    { name: 'Uber',    cat: TransactionCategory.TRANSPORT,     amt: 310,  daysAgo: 50 },
    { name: 'Spotify', cat: TransactionCategory.SUBSCRIPTIONS, amt: 119,  daysAgo: 35 },
    // Two months ago
    { name: 'Swiggy',  cat: TransactionCategory.FOOD,          amt: 890,  daysAgo: 62 },
    { name: 'Netflix', cat: TransactionCategory.SUBSCRIPTIONS, amt: 649,  daysAgo: 62 },
    { name: 'Salary',  cat: TransactionCategory.SALARY,        amt: 18000, daysAgo: 75, credit: true },
    { name: 'IndiGo',  cat: TransactionCategory.TRAVEL,        amt: 4500, daysAgo: 70 },
    { name: 'Spotify', cat: TransactionCategory.SUBSCRIPTIONS, amt: 119,  daysAgo: 62 },
  ];

  await prisma.transaction.createMany({
    data: transactions.map((t) => ({
      userId: user.id,
      amount: t.amt,
      type: t.credit ? TransactionType.CREDIT : TransactionType.DEBIT,
      category: t.cat,
      merchantName: t.name,
      merchantRaw: t.name.toUpperCase(),
      date: subDays(new Date(), t.daysAgo),
      currency: 'INR',
      isCategorizedAI: false,
      confidence: 0.95,
    })),
  });

  console.log(`✅ ${transactions.length} transactions seeded`);

  // Savings goals
  await prisma.savingsGoal.createMany({
    data: [
      {
        userId: user.id,
        name: 'PS5 Pro',
        emoji: '🎮',
        targetAmount: 55000,
        currentAmount: 32000,
        targetDate: new Date('2025-12-25'),
        autoSaveAmount: 3000,
      },
      {
        userId: user.id,
        name: 'Europe Trip',
        emoji: '✈️',
        targetAmount: 150000,
        currentAmount: 45000,
        targetDate: new Date('2026-06-01'),
        autoSaveAmount: 8000,
      },
    ],
  });

  console.log('✅ Savings goals seeded');

  // Detected subscriptions
  await prisma.subscription.createMany({
    data: [
      { userId: user.id, name: 'Netflix',  merchantName: 'Netflix',  amount: 649,  intervalDays: 30, isActive: true },
      { userId: user.id, name: 'Spotify',  merchantName: 'Spotify',  amount: 119,  intervalDays: 30, isActive: true },
      { userId: user.id, name: 'GitHub',   merchantName: 'GitHub',   amount: 700,  intervalDays: 30, isActive: true },
    ],
  });

  console.log('✅ Subscriptions seeded');
  console.log('\n🎉 Seed complete! Login with:');
  console.log('   Email:    demo@pocketpilot.app');
  console.log('   Password: Demo@1234');
}

seed()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
