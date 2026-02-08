import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { and, eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { boardConnections } from '../db/schema/board-connections.js';
import { config } from '../config.js';
import { conflict, notFound } from '../utils/errors.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const key = config.BOARD_CREDENTIALS_KEY;
  if (!key) throw new Error('BOARD_CREDENTIALS_KEY not configured');
  return Buffer.from(key, 'hex');
}

export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  // Format: iv:authTag:encrypted (all hex)
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decrypt(ciphertext: string): string {
  const key = getEncryptionKey();
  const [ivHex, authTagHex, encryptedHex] = ciphertext.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  return decipher.update(encrypted) + decipher.final('utf8');
}

export async function create(
  userId: string,
  boardType: string,
  username: string,
  password: string,
  boardUserId?: string,
) {
  // Check for existing connection
  const existing = await getByUserAndBoard(userId, boardType);
  if (existing) throw conflict(`Already connected to ${boardType}`);

  const [connection] = await db.insert(boardConnections)
    .values({
      userId,
      boardType,
      username,
      encryptedPassword: encrypt(password),
      boardUserId: boardUserId ?? null,
    })
    .returning();
  return sanitize(connection);
}

export async function list(userId: string) {
  const rows = await db.select().from(boardConnections)
    .where(eq(boardConnections.userId, userId))
    .orderBy(boardConnections.createdAt);
  return rows.map(sanitize);
}

export async function getById(userId: string, id: string) {
  const [connection] = await db.select().from(boardConnections)
    .where(and(eq(boardConnections.id, id), eq(boardConnections.userId, userId)))
    .limit(1);
  if (!connection) throw notFound('Board connection');
  return connection;
}

export async function getByUserAndBoard(userId: string, boardType: string) {
  const [connection] = await db.select().from(boardConnections)
    .where(and(eq(boardConnections.userId, userId), eq(boardConnections.boardType, boardType)))
    .limit(1);
  return connection ?? null;
}

export async function remove(userId: string, id: string) {
  const [connection] = await db.delete(boardConnections)
    .where(and(eq(boardConnections.id, id), eq(boardConnections.userId, userId)))
    .returning({ id: boardConnections.id });
  if (!connection) throw notFound('Board connection');
}

export async function updateLastSync(id: string) {
  await db.update(boardConnections)
    .set({ lastSyncAt: new Date(), updatedAt: new Date() })
    .where(eq(boardConnections.id, id));
}

export function getDecryptedPassword(connection: typeof boardConnections.$inferSelect): string {
  return decrypt(connection.encryptedPassword);
}

/** Strip sensitive fields before returning to client */
function sanitize(row: typeof boardConnections.$inferSelect) {
  const { encryptedPassword, ...rest } = row;
  return rest;
}
