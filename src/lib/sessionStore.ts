import crypto from 'node:crypto';
import Redis from 'ioredis';

export interface ServerUserSession {
  sessionId: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    provider: 'sso' | 'github' | 'email';
    organization: string;
    ssoDomain?: string;
    targetRepo: string;
    targetBranch: string;
  };
  createdAt: string;
  expiresAt: string;
}

export class DistributedSessionStore {
  private redisClient: Redis | null = null;
  private inMemoryStore = new Map<string, { session: ServerUserSession; expiresAtMs: number }>();
  private useRedis = false;
  private defaultTTL = 86400; // 24 hours in seconds

  constructor() {
    const redisUrl = process.env.REDIS_URL;
    const redisHost = process.env.REDIS_HOST;

    if (redisUrl || redisHost) {
      try {
        if (redisUrl) {
          this.redisClient = new Redis(redisUrl, {
            lazyConnect: true,
            maxRetriesPerRequest: 2,
            retryStrategy: (times) => (times > 3 ? null : Math.min(times * 100, 1000)),
          });
        } else {
          this.redisClient = new Redis({
            host: redisHost,
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
            password: process.env.REDIS_PASSWORD || undefined,
            lazyConnect: true,
            maxRetriesPerRequest: 2,
            retryStrategy: (times) => (times > 3 ? null : Math.min(times * 100, 1000)),
          });
        }

        this.redisClient.on('connect', () => {
          console.log('[DistributedSessionStore] Connected to Redis cluster successfully.');
          this.useRedis = true;
        });

        this.redisClient.on('error', (err) => {
          console.warn('[DistributedSessionStore] Redis connection error (using memory fallback):', err.message);
          this.useRedis = false;
        });

        this.redisClient.connect().catch((err) => {
          console.warn('[DistributedSessionStore] Initial Redis connection deferred:', err.message);
        });
      } catch (err: any) {
        console.warn('[DistributedSessionStore] Redis initialization fallback:', err.message);
      }
    } else {
      console.log('[DistributedSessionStore] REDIS_URL not configured. Operating in high-performance local store mode.');
    }

    // Pre-seed demo session in memory fallback for developer convenience
    const demoSession: ServerUserSession = {
      sessionId: 'sess-demo-active',
      user: {
        id: 'usr-101',
        email: 'engineer@acmecorp.com',
        name: 'Jane Doe',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        provider: 'sso',
        organization: 'Acme Enterprise',
        targetRepo: 'autorca-suite/autorca-suite',
        targetBranch: 'main',
      },
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    };
    this.inMemoryStore.set(demoSession.sessionId, {
      session: demoSession,
      expiresAtMs: Date.now() + 86400000,
    });
  }

  public isRedisActive(): boolean {
    return this.useRedis;
  }

  public generateSessionToken(): string {
    // Cryptographically secure 256-bit token entropy
    return `sess_${crypto.randomBytes(32).toString('hex')}`;
  }

  public async getSession(sessionId: string): Promise<ServerUserSession | null> {
    if (!sessionId || typeof sessionId !== 'string') return null;

    if (this.useRedis && this.redisClient) {
      try {
        const key = `session:${sessionId}`;
        const raw = await this.redisClient.get(key);
        if (raw) {
          const session: ServerUserSession = JSON.parse(raw);
          if (new Date(session.expiresAt).getTime() > Date.now()) {
            // Touch TTL (sliding window renewal)
            await this.redisClient.expire(key, this.defaultTTL);
            return session;
          } else {
            await this.redisClient.del(key);
          }
        }
      } catch (err: any) {
        console.warn('[DistributedSessionStore] Redis read failed, falling back to memory:', err.message);
      }
    }

    const cached = this.inMemoryStore.get(sessionId);
    if (cached) {
      if (cached.expiresAtMs > Date.now()) {
        cached.expiresAtMs = Date.now() + this.defaultTTL * 1000;
        cached.session.expiresAt = new Date(cached.expiresAtMs).toISOString();
        return cached.session;
      } else {
        this.inMemoryStore.delete(sessionId);
      }
    }

    return null;
  }

  public async setSession(session: ServerUserSession, ttlSeconds = this.defaultTTL): Promise<void> {
    const key = `session:${session.sessionId}`;
    const payload = JSON.stringify(session);
    const expiresAtMs = Date.now() + ttlSeconds * 1000;
    session.expiresAt = new Date(expiresAtMs).toISOString();

    if (this.useRedis && this.redisClient) {
      try {
        await this.redisClient.setex(key, ttlSeconds, payload);
      } catch (err: any) {
        console.warn('[DistributedSessionStore] Redis set failed:', err.message);
      }
    }

    this.inMemoryStore.set(session.sessionId, { session, expiresAtMs });
  }

  public async destroySession(sessionId: string): Promise<void> {
    if (!sessionId) return;

    if (this.useRedis && this.redisClient) {
      try {
        await this.redisClient.del(`session:${sessionId}`);
      } catch (err: any) {
        console.warn('[DistributedSessionStore] Redis del failed:', err.message);
      }
    }

    this.inMemoryStore.delete(sessionId);
  }
}

export const sessionStore = new DistributedSessionStore();
