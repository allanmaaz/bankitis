import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'banking-system-team9-secure-token-secret-2026-xyz-random-123456'
);

const SESSION_COOKIE_NAME = 'bank_session_token';

export interface UserSession {
  userId: string;
  email: string;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function hashUpiPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, 10);
}

export async function verifyUpiPin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}

export async function createSessionToken(payload: UserSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as string,
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await verifySessionToken(token);
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      accounts: {
        where: { status: 'ACTIVE' },
        take: 1,
      },
    },
  });

  if (!user || user.accounts.length === 0) return null;

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    account: user.accounts[0],
  };
}

export async function loginWithEmail(email: string, passwordPlain: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    include: {
      accounts: true,
    },
  });

  if (!user) {
    return { success: false, error: 'Invalid email or password' };
  }

  const isValidPassword = await verifyPassword(passwordPlain, user.passwordHash);
  if (!isValidPassword) {
    return { success: false, error: 'Invalid email or password' };
  }

  const token = await createSessionToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  await setSessionCookie(token);

  // Log audit
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: 'USER_LOGIN',
      details: { email: user.email, method: 'CREDENTIALS' },
    },
  });

  return { success: true, user };
}

export async function registerNewUser(data: {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  upiPin: string;
}) {
  const normalizedEmail = data.email.toLowerCase().trim();
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: normalizedEmail }, { phoneNumber: data.phoneNumber.trim() }],
    },
  });

  if (existingUser) {
    return { success: false, error: 'A user with this email or mobile number already exists' };
  }

  // Derive handle from username or email prefix
  const usernamePrefix = normalizedEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
  const upiIdCandidate = `${usernamePrefix}@bank`;

  // Check if UPI ID taken
  const existingAccount = await prisma.account.findUnique({
    where: { upiId: upiIdCandidate },
  });

  const finalUpiId = existingAccount
    ? `${usernamePrefix}${Math.floor(100 + Math.random() * 900)}@bank`
    : upiIdCandidate;

  const passwordHash = await hashPassword(data.password);
  const upiPinHash = await hashUpiPin(data.upiPin);
  const accountNumber = `ACC${Date.now().toString().slice(-8)}${Math.floor(10 + Math.random() * 90)}`;

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        fullName: data.fullName.trim(),
        email: normalizedEmail,
        phoneNumber: data.phoneNumber.trim(),
        passwordHash,
      },
    });

    const account = await tx.account.create({
      data: {
        accountNumber,
        upiId: finalUpiId,
        upiPinHash,
        balance: 50000.00, // ₹50,000 opening demo balance as specified in PRD
        userId: user.id,
      },
    });

    await tx.notification.create({
      data: {
        userId: user.id,
        title: 'Welcome to Team-9 Bank!',
        message: `Your account ${accountNumber} has been activated with UPI ID ${finalUpiId} and an initial deposit of ₹50,000.00.`,
        type: 'SYSTEM',
      },
    });

    await tx.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_REGISTERED',
        details: { accountNumber, upiId: finalUpiId },
      },
    });

    return { user, account };
  });

  const token = await createSessionToken({
    userId: result.user.id,
    email: result.user.email,
    role: result.user.role,
  });

  await setSessionCookie(token);

  return { success: true, user: result.user, account: result.account };
}

export async function logoutUser() {
  await clearSessionCookie();
}

