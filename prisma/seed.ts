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

  // 1. Create Users
  const userCustomer = await prisma.user.create({
    data: {
      fullName: 'Customer Account',
      email: 'user@bank.com',
      phoneNumber: '+919000000001',
      passwordHash: defaultPasswordHash,
      role: Role.CUSTOMER,
    },
  });

  const userRecipient = await prisma.user.create({
    data: {
      fullName: 'Recipient Account',
      email: 'recipient@bank.com',
      phoneNumber: '+919000000002',
      passwordHash: defaultPasswordHash,
      role: Role.CUSTOMER,
    },
  });

  const userAdmin = await prisma.user.create({
    data: {
      fullName: 'Administrator',
      email: 'admin@bank.com',
      phoneNumber: '+919999900000',
      passwordHash: defaultPasswordHash,
      role: Role.ADMIN,
    },
  });

  console.log('✅ Created demo customer accounts and administrator');

  // 2. Create Bank Accounts & UPI IDs
  const pinHash123456 = await bcrypt.hash('123456', saltRounds);
  const pinHashAdmin = await bcrypt.hash('999999', saltRounds);

  const accountCustomer = await prisma.account.create({
    data: {
      accountNumber: 'ACC1000849201',
      upiId: 'user@bank',
      upiPinHash: pinHash123456,
      balance: 75000.00,
      status: AccountStatus.ACTIVE,
      userId: userCustomer.id,
    },
  });

  const accountRecipient = await prisma.account.create({
    data: {
      accountNumber: 'ACC1000849202',
      upiId: 'recipient@bank',
      upiPinHash: pinHash123456,
      balance: 50000.00,
      status: AccountStatus.ACTIVE,
      userId: userRecipient.id,
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

  console.log('✅ Created active bank accounts with UPI handles and PINs');

  // 3. Create Beneficiaries
  await prisma.beneficiary.createMany({
    data: [
      {
        ownerId: userCustomer.id,
        beneficiaryUpi: 'recipient@bank',
        beneficiaryName: 'Recipient Account',
        nickname: 'Recipient',
      },
      {
        ownerId: userRecipient.id,
        beneficiaryUpi: 'user@bank',
        beneficiaryName: 'Customer Account',
        nickname: 'Customer',
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
      note: 'Services settlement',
      senderAccountId: accountRecipient.id,
      receiverAccountId: accountCustomer.id,
      senderBalanceAfter: 50000.00,
      receiverBalanceAfter: 75000.00,
      createdAt: new Date('2026-11-08T10:15:00Z'),
    },
  });

  // 5. Create In-App Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: userCustomer.id,
        title: 'Payment Received',
        message: '₹2,500 credited to your account from recipient@bank. Ref: TXN-20261108-984210',
        type: 'CREDIT',
        isRead: false,
        createdAt: new Date('2026-11-08T10:15:05Z'),
      },
    ],
  });

  // 6. Create Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        userId: userCustomer.id,
        action: 'USER_LOGIN',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        details: { status: 'SUCCESS' },
      },
      {
        userId: userCustomer.id,
        action: 'TRANSFER_EXECUTED',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        details: {
          referenceNumber: txn1.referenceNumber,
          amount: 2500,
          recipientUpi: 'user@bank',
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
