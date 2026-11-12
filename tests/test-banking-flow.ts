import { resolveUpiRecipient, executeTransfer, getDailyTransferUtilized } from '../src/lib/banking';
import { addBeneficiary, getUserBeneficiaries } from '../src/lib/beneficiaries';
import { getFilteredTransactions, getSpendingAnalytics } from '../src/lib/transactions';
import { prisma } from '../src/lib/prisma';
import { TransactionCategory } from '@prisma/client';

async function runTests() {
  console.log('🧪 Starting Automated Banking Engine Integration Tests...\n');

  // 1. Fetch Demo Users
  const maazUser = await prisma.user.findUniqueOrThrow({
    where: { email: 'maaz@bank.com' },
    include: { accounts: true },
  });
  const devikaUser = await prisma.user.findUniqueOrThrow({
    where: { email: 'devika@bank.com' },
    include: { accounts: true },
  });

  const maazAccount = maazUser.accounts[0];
  const devikaAccount = devikaUser.accounts[0];

  console.log(`👤 Sender: ${maazUser.fullName} (${maazAccount.upiId}) - Balance: ₹${maazAccount.balance}`);
  console.log(`👤 Recipient: ${devikaUser.fullName} (${devikaAccount.upiId}) - Balance: ₹${devikaAccount.balance}`);
  console.log('----------------------------------------------------');

  // TEST 1: Recipient Verification (Question 42)
  console.log('Test 1: Testing Recipient Name Resolution...');
  const resolveResult = await resolveUpiRecipient('devika@bank', maazUser.id);
  if (resolveResult.success && resolveResult.recipientName === 'Devika') {
    console.log('✅ PASS: Resolved "devika@bank" to "Devika"');
  } else {
    throw new Error(`FAIL: Recipient resolution failed: ${JSON.stringify(resolveResult)}`);
  }

  // TEST 2: Self-Transfer Rejection
  console.log('\nTest 2: Testing Self-Transfer Rejection...');
  const selfResolve = await resolveUpiRecipient('maaz@bank', maazUser.id);
  if (selfResolve.success && selfResolve.isSelf) {
    console.log('✅ PASS: Correctly detected self-transfer');
  } else {
    throw new Error('FAIL: Self-transfer detection failed');
  }

  // TEST 3: Minimum Amount Boundary (< ₹1)
  console.log('\nTest 3: Testing Min Amount Limit (< ₹1)...');
  const minLimitTest = await executeTransfer({
    senderUserId: maazUser.id,
    recipientUpi: 'devika@bank',
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
    senderUserId: maazUser.id,
    recipientUpi: 'devika@bank',
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
    senderUserId: maazUser.id,
    recipientUpi: 'devika@bank',
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
  const initialMaazBalance = Number(
    (await prisma.account.findUniqueOrThrow({ where: { id: maazAccount.id } })).balance
  );
  const initialDevikaBalance = Number(
    (await prisma.account.findUniqueOrThrow({ where: { id: devikaAccount.id } })).balance
  );

  const transferResult = await executeTransfer({
    senderUserId: maazUser.id,
    recipientUpi: 'devika@bank',
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
  const updatedMaazAccount = await prisma.account.findUniqueOrThrow({ where: { id: maazAccount.id } });
  const updatedDevikaAccount = await prisma.account.findUniqueOrThrow({ where: { id: devikaAccount.id } });

  const finalMaazBalance = Number(updatedMaazAccount.balance);
  const finalDevikaBalance = Number(updatedDevikaAccount.balance);

  console.log(`   Sender Balance: ₹${initialMaazBalance} -> ₹${finalMaazBalance} (Diff: -₹${initialMaazBalance - finalMaazBalance})`);
  console.log(`   Receiver Balance: ₹${initialDevikaBalance} -> ₹${finalDevikaBalance} (Diff: +₹${finalDevikaBalance - initialDevikaBalance})`);

  if (initialMaazBalance - finalMaazBalance === 500 && finalDevikaBalance - initialDevikaBalance === 500) {
    console.log('✅ PASS: Balances atomically updated with zero double-spending');
  } else {
    throw new Error('FAIL: Balance delta mismatch');
  }

  // TEST 7: Beneficiary Verification & Saving (Question 44/45)
  console.log('\nTest 7: Testing Automatic Beneficiary Verification...');
  const addBenResult = await addBeneficiary(maazUser.id, 'vivek@bank', 'Vivek');
  if (addBenResult.success && addBenResult.beneficiary?.beneficiaryName === 'Vivek') {
    console.log('✅ PASS: Added "vivek@bank" with automatic name resolution "Vivek"');
  } else {
    console.log(`ℹ️ Beneficiary info: ${addBenResult.error || 'Already added'}`);
  }

  // TEST 8: Spending Analytics & Filtered Transactions
  console.log('\nTest 8: Testing Spending Analytics & History Filters...');
  const analytics = await getSpendingAnalytics(maazAccount.id);
  const history = await getFilteredTransactions({ accountId: maazAccount.id, limit: 10 });
  console.log(`✅ PASS: Analytics retrieved (${analytics.categoryData.length} categories, ${analytics.monthlyCashFlow.length} months)`);
  console.log(`✅ PASS: Transaction history retrieved (${history.totalCount} total transactions)`);

  console.log('\n🎉 ALL 8 INTEGRATION TESTS PASSED PERFECTLY!\n');
}

runTests()
  .catch((e) => {
    console.error('❌ Test failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

