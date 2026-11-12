import { PrismaClient, Role, AccountStatus, TransactionStatus, TransactionCategory } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed for Bankitis Online Banking System...');

  // Clear existing records in reverse dependency order
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.beneficiary.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.user.deleteMany({});

  const saltRounds = 10;
  const defaultPasswordHash = await bcrypt.hash('Password@123', saltRounds);

  // 1. Create Users (Teammates + Admin)
  const userMaaz = await prisma.user.create({
    data: {
      fullName: 'Mohammed Maaz',
      email: 'maaz@bank.com',
      phoneNumber: '+919876500001',
      passwordHash: defaultPasswordHash,
      role: Role.CUSTOMER,
    },
  });

  const userDevika = await prisma.user.create({
    data: {
      fullName: 'Devika',
      email: 'devika@bank.com',
      phoneNumber: '+919876500002',
      passwordHash: defaultPasswordHash,
      role: Role.CUSTOMER,
    },
  });

  const userVivek = await prisma.user.create({
    data: {
      fullName: 'Vivek',
      email: 'vivek@bank.com',
      phoneNumber: '+919876500003',
      passwordHash: defaultPasswordHash,
      role: Role.CUSTOMER,
    },
  });

  const userApoorva = await prisma.user.create({
    data: {
      fullName: 'Apoorva',
      email: 'apoorva@bank.com',
      phoneNumber: '+919876500004',
      passwordHash: defaultPasswordHash,
      role: Role.CUSTOMER,
    },
  });

  const userImthebest = await prisma.user.create({
    data: {
      fullName: 'imthebest',
      email: 'imthebest@bank.com',
      phoneNumber: '+919876500005',
      passwordHash: defaultPasswordHash,
      role: Role.CUSTOMER,
    },
  });

  const userAdmin = await prisma.user.create({
    data: {
      fullName: 'System Administrator',
      email: 'admin@bank.com',
      phoneNumber: '+919999900000',
      passwordHash: defaultPasswordHash,
      role: Role.ADMIN,
    },
  });

  console.log('✅ Created 5 teammate customer accounts and 1 system administrator');

  // 2. Create Bank Accounts & UPI IDs
  const pinHash123456 = await bcrypt.hash('123456', saltRounds);
  const pinHashAdmin = await bcrypt.hash('999999', saltRounds);

  const accountMaaz = await prisma.account.create({
    data: {
      accountNumber: 'ACC1000849201',
      upiId: 'maaz@bank',
      upiPinHash: pinHash123456,
      balance: 75000.00,
      status: AccountStatus.ACTIVE,
      userId: userMaaz.id,
    },
  });

  const accountDevika = await prisma.account.create({
    data: {
      accountNumber: 'ACC1000849202',
      upiId: 'devika@bank',
      upiPinHash: pinHash123456,
      balance: 52000.00,
      status: AccountStatus.ACTIVE,
      userId: userDevika.id,
    },
  });

  const accountVivek = await prisma.account.create({
    data: {
      accountNumber: 'ACC1000849203',
      upiId: 'vivek@bank',
      upiPinHash: pinHash123456,
      balance: 38900.00,
      status: AccountStatus.ACTIVE,
      userId: userVivek.id,
    },
  });

  const accountApoorva = await prisma.account.create({
    data: {
      accountNumber: 'ACC1000849204',
      upiId: 'apoorva@bank',
      upiPinHash: pinHash123456,
      balance: 64500.00,
      status: AccountStatus.ACTIVE,
      userId: userApoorva.id,
    },
  });

  const accountImthebest = await prisma.account.create({
    data: {
      accountNumber: 'ACC1000849205',
      upiId: 'imthebest@bank',
      upiPinHash: pinHash123456,
      balance: 100000.00,
      status: AccountStatus.ACTIVE,
      userId: userImthebest.id,
    },
  });

  const accountAdmin = await prisma.account.create({
    data: {
      accountNumber: 'ACC0000000001',
      upiId: 'admin@bank',
      upiPinHash: pinHashAdmin,
      balance: 10000000.00,
      status: AccountStatus.ACTIVE,
      userId: userAdmin.id,
    },
  });

  console.log('✅ Created 6 active bank accounts with UPI handles and PINs');

  // 3. Create Beneficiaries
  await prisma.beneficiary.createMany({
    data: [
      {
        ownerId: userMaaz.id,
        beneficiaryUpi: 'devika@bank',
        beneficiaryName: 'Devika',
        nickname: 'Devika',
      },
      {
        ownerId: userMaaz.id,
        beneficiaryUpi: 'vivek@bank',
        beneficiaryName: 'Vivek',
        nickname: 'Vivek',
      },
      {
        ownerId: userMaaz.id,
        beneficiaryUpi: 'apoorva@bank',
        beneficiaryName: 'Apoorva',
        nickname: 'Apoorva',
      },
      {
        ownerId: userMaaz.id,
        beneficiaryUpi: 'imthebest@bank',
        beneficiaryName: 'imthebest',
        nickname: 'imthebest',
      },
      {
        ownerId: userDevika.id,
        beneficiaryUpi: 'maaz@bank',
        beneficiaryName: 'Mohammed Maaz',
        nickname: 'Mohammed Maaz',
      },
    ],
  });

  console.log('✅ Created demo beneficiaries');

  // 4. Create Historical Transactions
  const txn1 = await prisma.transaction.create({
    data: {
      referenceNumber: 'TXN-20261108-984210',
      idempotencyKey: 'seed-idempotency-1',
      amount: 2500.00,
      fee: 0.00,
      status: TransactionStatus.COMPLETED,
      category: TransactionCategory.SERVICES,
      note: 'Project consultation fee',
      senderAccountId: accountDevika.id,
      receiverAccountId: accountMaaz.id,
      senderBalanceAfter: 52000.00,
      receiverBalanceAfter: 75000.00,
      createdAt: new Date('2026-11-08T10:15:00Z'),
    },
  });

  const txn2 = await prisma.transaction.create({
    data: {
      referenceNumber: 'TXN-20261109-129845',
      idempotencyKey: 'seed-idempotency-2',
      amount: 5000.00,
      fee: 0.00,
      status: TransactionStatus.COMPLETED,
      category: TransactionCategory.BILLS,
      note: 'Server split',
      senderAccountId: accountImthebest.id,
      receiverAccountId: accountMaaz.id,
      senderBalanceAfter: 100000.00,
      receiverBalanceAfter: 72500.00,
      createdAt: new Date('2026-11-09T20:30:00Z'),
    },
  });

  console.log('✅ Created historical transactions');

  // 5. Create In-App Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: userMaaz.id,
        title: 'Payment Received',
        message: '₹2,500 credited to your account from Devika (devika@bank). Ref: TXN-20261108-984210',
        type: 'CREDIT',
        isRead: false,
        createdAt: new Date('2026-11-08T10:15:05Z'),
      },
      {
        userId: userMaaz.id,
        title: 'Payment Received',
        message: '₹5,000 credited to your account from imthebest (imthebest@bank). Ref: TXN-20261109-129845',
        type: 'CREDIT',
        isRead: true,
        createdAt: new Date('2026-11-09T20:30:05Z'),
      },
    ],
  });

  // 6. Create Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        userId: userMaaz.id,
        action: 'USER_LOGIN',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        details: { status: 'SUCCESS' },
      },
      {
        userId: userMaaz.id,
        action: 'TRANSFER_EXECUTED',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        details: {
          referenceNumber: txn1.referenceNumber,
          amount: 2500,
          recipientUpi: 'maaz@bank',
        },
      },
    ],
  });

  console.log('✅ Created notifications and audit logs');
  console.log('\n🎉 Database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
