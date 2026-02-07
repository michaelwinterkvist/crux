import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users } from '../db/schema/users.js';
import { conflict, unauthorized } from '../utils/errors.js';

const SALT_ROUNDS = 12;

export async function register(email: string, name: string, password: string) {
  // Check if email exists
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) throw conflict('Email already registered');

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const [user] = await db.insert(users).values({
    email,
    name,
    passwordHash,
  }).returning({
    id: users.id,
    email: users.email,
    name: users.name,
    preferences: users.preferences,
    createdAt: users.createdAt,
  });

  return user;
}

export async function login(email: string, password: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) throw unauthorized('Invalid email or password');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw unauthorized('Invalid email or password');

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    preferences: user.preferences,
    createdAt: user.createdAt,
  };
}

export async function getUserById(id: string) {
  const [user] = await db.select({
    id: users.id,
    email: users.email,
    name: users.name,
    preferences: users.preferences,
    createdAt: users.createdAt,
    updatedAt: users.updatedAt,
  }).from(users).where(eq(users.id, id)).limit(1);
  return user ?? null;
}
