import { resolveUpiRecipient, executeTransfer, getDailyTransferUtilized } from '../src/lib/banking';
import { addBeneficiary, getUserBeneficiaries } from '../src/lib/beneficiaries';
import { getFilteredTransactions, getSpendingAnalytics } from '../src/lib/transactions';
import { prisma } from '../src/lib/prisma';
import { TransactionCategory } from '@prisma/client';

async function runTests() {
  console.log('🧪 Starting Automated Banking Engine Integration Tests...\n');

  // 1. Fetch Demo Users
  const senderUser = await prisma.user.findUniqueOrThrow({
    where: { email: 'user@bank.com' },
    include: { accounts: true },
  });
  const recipientUser = await prisma.user.findUniqueOrThrow({
    where: { email: 'recipient@bank.com' },
    include: { accounts: true },
  });

  const senderAccount = senderUser.accounts[0];
  const recipientAccount = recipientUser.accounts[0];

  console.log(`👤 Sender: ${senderUser.fullName} (${senderAccount.upiId}) - Balance: ₹${senderAccount.balance}`);
  console.log(`👤 Recipient: ${recipientUser.fullName} (${recipientAccount.upiId}) - Balance: ₹${recipientAccount.balance}`);
  console.log('----------------------------------------------------');

  // TEST 1: Recipient Verification (Question 42)
  console.log('Test 1: Testing Recipient Name Resolution...');
  const resolveResult = await resolveUpiRecipient('recipient@bank', senderUser.id);
  if (resolveResult.success && resolveResult.recipientName === 'Recipient Account') {
    console.log('✅ PASS: Resolved "recipient@bank" to "Recipient Account"');
  } else {
    throw new Error(`FAIL: Recipient resolution failed: ${JSON.stringify(resolveResult)}`);
  }

  // TEST 2: Self-Transfer Rejection
  console.log('\nTest 2: Testing Self-Transfer Rejection...');
  const selfResolve = await resolveUpiRecipient('user@bank', senderUser.id);
  if (selfResolve.success && selfResolve.isSelf) {
    console.log('✅ PASS: Correctly detected self-transfer');
  } else {
    throw new Error('FAIL: Self-transfer detection failed');
  }

  // TEST 3: Minimum Amount Boundary (< ₹1)
  console.log('\nTest 3: Testing Min Amount Limit (< ₹1)...');
  const minLimitTest = await executeTransfer({
    senderUserId: senderUser.id,
    recipientUpi: 'recipient@bank',
    amount: 0.5,
    upiPin: '123456',
  });
  if (!minLimitTest.success && minLimitTest.error?.includes('at least ₹1.00')) {
    console.log('✅ PASS: Rejected transfer below ₹1');
  } else {
    throw new Error(`FAIL: Minimum limit validation failed: ${minLimitTest.error}`);
  }

  // TEST 4: Maximum Per-Transaction Limit (> ₹1,00,000)
  console.log('\nTest 4: Testing Max Amount Limit (> ₹1,00,000)...');
  const maxLimitTest = await executeTransfer({
    senderUserId: senderUser.id,
    recipientUpi: 'recipient@bank',
    amount: 150000,
    upiPin: '123456',
  });
  if (!maxLimitTest.success && maxLimitTest.error?.includes('₹1,00,000.00')) {
    console.log('✅ PASS: Rejected transfer exceeding per-txn limit');
  } else {
    throw new Error(`FAIL: Max limit validation failed: ${maxLimitTest.error}`);
  }

  // TEST 5: Incorrect 6-Digit PIN
  console.log('\nTest 5: Testing Incorrect 6-Digit PIN...');
  const badPinTest = await executeTransfer({
    senderUserId: senderUser.id,
    recipientUpi: 'recipient@bank',
    amount: 500,
    upiPin: '000000',
  });
  if (!badPinTest.success && badPinTest.error?.includes('Incorrect UPI PIN')) {
    console.log('✅ PASS: Rejected invalid UPI PIN');
  } else {
    throw new Error(`FAIL: Incorrect PIN test failed: ${badPinTest.error}`);
  }

  // TEST 6: Valid Atomic Funds Transfer with Row-Level Lock
  console.log('\nTest 6: Executing Atomic Transfer of ₹500 with Row-Level Lock...');
  const initialSenderBalance = Number(
    (await prisma.account.findUniqueOrThrow({ where: { id: senderAccount.id } })).balance
  );
  const initialRecipientBalance = Number(
    (await prisma.account.findUniqueOrThrow({ where: { id: recipientAccount.id } })).balance
  );

  const transferResult = await executeTransfer({
    senderUserId: senderUser.id,
    recipientUpi: 'recipient@bank',
    amount: 500.00,
    upiPin: '123456',
    category: TransactionCategory.DINING,
    note: 'Automated test dinner share',
  });

  if (!transferResult.success || !transferResult.referenceNumber) {
    throw new Error(`FAIL: Transfer execution failed: ${transferResult.error}`);
  }

  console.log(`✅ PASS: Transfer executed! Ref: ${transferResult.referenceNumber}`);

  // Verify DB balances
  const updatedSenderAccount = await prisma.account.findUniqueOrThrow({ where: { id: senderAccount.id } });
  const updatedRecipientAccount = await prisma.account.findUniqueOrThrow({ where: { id: recipientAccount.id } });

  const finalSenderBalance = Number(updatedSenderAccount.balance);
  const finalRecipientBalance = Number(updatedRecipientAccount.balance);

  console.log(`   Sender Balance: ₹${initialSenderBalance} -> ₹${finalSenderBalance} (Diff: -₹${initialSenderBalance - finalSenderBalance})`);
  console.log(`   Receiver Balance: ₹${initialRecipientBalance} -> ₹${finalRecipientBalance} (Diff: +₹${finalRecipientBalance - initialRecipientBalance})`);

  if (initialSenderBalance - finalSenderBalance === 500 && finalRecipientBalance - initialRecipientBalance === 500) {
    console.log('✅ PASS: Balances atomically updated with zero double-spending');
  } else {
    throw new Error('FAIL: Balance delta mismatch');
  }

  console.log('\n🎉 All test suites passed!');
}

runTests()
  .catch((e) => {
    console.error('❌ Test failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
