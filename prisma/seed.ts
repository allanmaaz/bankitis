import { PrismaClient, TransactionCategory, TransactionStatus, Role, AccountStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed for Team-9 Banking Management System...');

  // Clean existing tables in proper order
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.beneficiary.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  const saltRounds = 10;
  const defaultPasswordHash = await bcrypt.hash('Password@123', saltRounds);

  // 1. Create Users
  const userMaaz = await prisma.user.create({
    data: {
      fullName: 'Maaz Khan',
      email: 'maaz@bank.com',
      phoneNumber: '+919876543210',
      passwordHash: defaultPasswordHash,
      role: Role.CUSTOMER,
    },
  });

  const userPriya = await prisma.user.create({
    data: {
      fullName: 'Priya Sharma',
      email: 'priya@bank.com',
      phoneNumber: '+919876543211',
      passwordHash: defaultPasswordHash,
      role: Role.CUSTOMER,
    },
  });

  const userRahul = await prisma.user.create({
    data: {
      fullName: 'Rahul Verma',
      email: 'rahul@bank.com',
      phoneNumber: '+919876543212',
      passwordHash: defaultPasswordHash,
      role: Role.CUSTOMER,
    },
  });

  const userAnanya = await prisma.user.create({
    data: {
      fullName: 'Ananya Iyer',
      email: 'ananya@bank.com',
      phoneNumber: '+919876543213',
      passwordHash: defaultPasswordHash,
      role: Role.CUSTOMER,
    },
  });

  const userAdmin = await prisma.user.create({
    data: {
      fullName: 'System Administrator',
      email: 'admin@bank.com',
      phoneNumber: '+919876543200',
      passwordHash: defaultPasswordHash,
      role: Role.ADMIN,
    },
  });

  console.log('✅ Created 4 demo customers and 1 system administrator');

  // 2. Create Bank Accounts & UPI IDs
  // Maaz: PIN 123456
  const pinHashMaaz = await bcrypt.hash('123456', saltRounds);
  const accountMaaz = await prisma.account.create({
    data: {
      accountNumber: 'ACC1000849201',
      upiId: 'maaz@bank',
      upiPinHash: pinHashMaaz,
      balance: 75450.00,
      status: AccountStatus.ACTIVE,
      userId: userMaaz.id,
    },
  });

  // Priya: PIN 654321
  const pinHashPriya = await bcrypt.hash('654321', saltRounds);
  const accountPriya = await prisma.account.create({
    data: {
      accountNumber: 'ACC1000849202',
      upiId: 'priya@bank',
      upiPinHash: pinHashPriya,
      balance: 52100.00,
      status: AccountStatus.ACTIVE,
      userId: userPriya.id,
    },
  });

  // Rahul: PIN 112233
  const pinHashRahul = await bcrypt.hash('112233', saltRounds);
  const accountRahul = await prisma.account.create({
    data: {
      accountNumber: 'ACC1000849203',
      upiId: 'rahul@bank',
      upiPinHash: pinHashRahul,
      balance: 38900.00,
      status: AccountStatus.ACTIVE,
      userId: userRahul.id,
    },
  });

  // Ananya: PIN 998877
  const pinHashAnanya = await bcrypt.hash('998877', saltRounds);
  const accountAnanya = await prisma.account.create({
    data: {
      accountNumber: 'ACC1000849204',
      upiId: 'ananya@bank',
      upiPinHash: pinHashAnanya,
      balance: 112500.00,
      status: AccountStatus.ACTIVE,
      userId: userAnanya.id,
    },
  });

  // Admin Account: PIN 999999
  const pinHashAdmin = await bcrypt.hash('999999', saltRounds);
  const accountAdmin = await prisma.account.create({
    data: {
      accountNumber: 'ACC0000000001',
      upiId: 'admin@bank',
      upiPinHash: pinHashAdmin,
      balance: 10000000.00, // ₹1,00,00,000 Central Bank Liquidity
      status: AccountStatus.ACTIVE,
      userId: userAdmin.id,
    },
  });

  console.log('✅ Created 5 active bank accounts with UPI handles and PINs');

  // 3. Create Beneficiaries
  await prisma.beneficiary.createMany({
    data: [
      {
        ownerId: userMaaz.id,
        beneficiaryUpi: 'priya@bank',
        beneficiaryName: 'Priya Sharma',
        nickname: 'Priya (Project Lead)',
      },
      {
        ownerId: userMaaz.id,
        beneficiaryUpi: 'rahul@bank',
        beneficiaryName: 'Rahul Verma',
        nickname: 'Rahul (Flatmate)',
      },
      {
        ownerId: userPriya.id,
        beneficiaryUpi: 'maaz@bank',
        beneficiaryName: 'Maaz Khan',
        nickname: 'Maaz',
      },
      {
        ownerId: userPriya.id,
        beneficiaryUpi: 'ananya@bank',
        beneficiaryName: 'Ananya Iyer',
        nickname: 'Ananya (Design)',
      },
    ],
  });

  console.log('✅ Created demo beneficiaries');

  // 4. Create Historical Transactions
  const txn1 = await prisma.transaction.create({
    data: {
      referenceNumber: 'TXN-20261108-984210',
      idempotencyKey: 'seed-idempotency-1',
      amount: 4500.00,
      fee: 0.00,
      status: TransactionStatus.COMPLETED,
      category: TransactionCategory.RENT,
      note: 'November apartment maintenance share',
      senderAccountId: accountMaaz.id,
      receiverAccountId: accountRahul.id,
      senderBalanceAfter: 75450.00,
      receiverBalanceAfter: 38900.00,
      createdAt: new Date('2026-11-08T10:15:00Z'),
    },
  });

  const txn2 = await prisma.transaction.create({
    data: {
      referenceNumber: 'TXN-20261109-129845',
      idempotencyKey: 'seed-idempotency-2',
      amount: 1250.00,
      fee: 0.00,
      status: TransactionStatus.COMPLETED,
      category: TransactionCategory.DINING,
      note: 'Team dinner bill split',
      senderAccountId: accountPriya.id,
      receiverAccountId: accountMaaz.id,
      senderBalanceAfter: 52100.00,
      receiverBalanceAfter: 79950.00,
      createdAt: new Date('2026-11-09T20:30:00Z'),
    },
  });

  const txn3 = await prisma.transaction.create({
    data: {
      referenceNumber: 'TXN-20261110-449120',
      idempotencyKey: 'seed-idempotency-3',
      amount: 850.00,
      fee: 0.00,
      status: TransactionStatus.COMPLETED,
      category: TransactionCategory.UTILITIES,
      note: 'Broadband Wi-Fi bill reimbursement',
      senderAccountId: accountMaaz.id,
      receiverAccountId: accountPriya.id,
      senderBalanceAfter: 75450.00,
      receiverBalanceAfter: 52950.00,
      createdAt: new Date('2026-11-10T14:45:00Z'),
    },
  });

  const txn4 = await prisma.transaction.create({
    data: {
      referenceNumber: 'TXN-20261111-789211',
      idempotencyKey: 'seed-idempotency-4',
      amount: 15000.00,
      fee: 0.00,
      status: TransactionStatus.COMPLETED,
      category: TransactionCategory.TRANSFER,
      note: 'Freelance development milestone',
      senderAccountId: accountAnanya.id,
      receiverAccountId: accountMaaz.id,
      senderBalanceAfter: 112500.00,
      receiverBalanceAfter: 75450.00,
      createdAt: new Date('2026-11-11T16:00:00Z'),
    },
  });

  console.log('✅ Created historical transactions');

  // 5. Create In-App Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: userMaaz.id,
        title: 'Money Received',
        message: '₹15,000 credited to your account from Ananya Iyer (ananya@bank). Ref: TXN-20261111-789211',
        type: 'CREDIT',
        isRead: false,
        createdAt: new Date('2026-11-11T16:00:05Z'),
      },
      {
        userId: userMaaz.id,
        title: 'Money Sent Successfully',
        message: '₹850 debited for payment to Priya Sharma (priya@bank). Ref: TXN-20261110-449120',
        type: 'DEBIT',
        isRead: true,
        createdAt: new Date('2026-11-10T14:45:05Z'),
      },
      {
        userId: userMaaz.id,
        title: 'Security Alert: Login Detected',
        message: 'Your banking account was accessed from a verified session on macOS.',
        type: 'SECURITY',
        isRead: true,
        createdAt: new Date('2026-11-09T09:00:00Z'),
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
          amount: 4500,
          recipientUpi: 'rahul@bank',
        },
      },
    ],
  });

  console.log('✅ Created notifications and audit logs');
  console.log('\n🎉 Database seeding finished successfully!');
  console.log('---------------------------------------------------------');
  console.log('Demo Credentials:');
  console.log('1. Email: maaz@bank.com    | Password: Password@123 | UPI: maaz@bank   | PIN: 123456 (Customer)');
  console.log('2. Email: priya@bank.com   | Password: Password@123 | UPI: priya@bank  | PIN: 654321 (Customer)');
  console.log('3. Email: rahul@bank.com   | Password: Password@123 | UPI: rahul@bank  | PIN: 112233 (Customer)');
  console.log('4. Email: ananya@bank.com  | Password: Password@123 | UPI: ananya@bank | PIN: 998877 (Customer)');
  console.log('5. Email: admin@bank.com   | Password: Password@123 | UPI: admin@bank  | PIN: 999999 (SYSTEM ADMIN)');
  console.log('---------------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

