import type { Redis } from '@upstash/redis'

// In-memory stand-in for the parts of @upstash/redis the counter uses.
// Test-only: imported by *.test.ts files, never by app code.

interface Entry {
  value: string
  expiresAt: number | null
}

interface SetOptions {
  nx?: boolean
  ex?: number
}

/** Mimics Upstash's automatic deserialisation: numeric strings → numbers. */
function deserialize(value: string | undefined): string | number | null {
  if (value === undefined) return null
  const n = Number(value)
  return value.trim() !== '' && Number.isFinite(n) ? n : value
}

export class FakeRedis {
  private readonly entries = new Map<string, Entry>()
  readonly commands: string[] = []
  failure: Error | null = null
  clock: () => number = () => Date.now()

  private guard(command: string): void {
    this.commands.push(command)
    if (this.failure) throw this.failure
  }

  private read(key: string): string | undefined {
    const entry = this.entries.get(key)
    if (!entry) return undefined
    if (entry.expiresAt !== null && entry.expiresAt <= this.clock()) {
      this.entries.delete(key)
      return undefined
    }
    return entry.value
  }

  private write(key: string, value: string, ttlSeconds?: number): void {
    const expiresAt = ttlSeconds ? this.clock() + ttlSeconds * 1000 : null
    this.entries.set(key, { value, expiresAt })
  }

  setSync(key: string, value: unknown, options: SetOptions = {}): 'OK' | null {
    if (options.nx && this.read(key) !== undefined) return null
    this.write(key, String(value), options.ex)
    return 'OK'
  }

  incrSync(key: string): number {
    const next = Number(this.read(key) ?? 0) + 1
    const ttl = this.ttl(key)
    this.write(key, String(next), ttl > 0 ? ttl : undefined)
    return next
  }

  expireSync(key: string, seconds: number): 0 | 1 {
    const value = this.read(key)
    if (value === undefined) return 0
    this.write(key, value, seconds)
    return 1
  }

  getSync(key: string): string | number | null {
    return deserialize(this.read(key))
  }

  /** Seconds to live, -1 without expiry, -2 when missing (like Redis TTL). */
  ttl(key: string): number {
    if (this.read(key) === undefined) return -2
    const { expiresAt } = this.entries.get(key) as Entry
    return expiresAt === null ? -1 : Math.ceil((expiresAt - this.clock()) / 1000)
  }

  keys(): string[] {
    return [...this.entries.keys()].filter((key) => this.read(key) !== undefined)
  }

  async set(key: string, value: unknown, options?: SetOptions): Promise<'OK' | null> {
    this.guard('set')
    return this.setSync(key, value, options)
  }

  async get(key: string): Promise<string | number | null> {
    this.guard('get')
    return this.getSync(key)
  }

  pipeline(): FakePipeline {
    return new FakePipeline(this, (command) => this.guard(command))
  }

  /** Typed as the real client for code under test. */
  asRedis(): Redis {
    return this as unknown as Redis
  }
}

/** Immutable command queue: every chained call returns a new pipeline. */
export class FakePipeline {
  constructor(
    private readonly redis: FakeRedis,
    private readonly guard: (command: string) => void,
    private readonly ops: ReadonlyArray<() => unknown> = [],
  ) {}

  private with(op: () => unknown): FakePipeline {
    return new FakePipeline(this.redis, this.guard, [...this.ops, op])
  }

  incr(key: string): FakePipeline {
    return this.with(() => this.redis.incrSync(key))
  }

  expire(key: string, seconds: number): FakePipeline {
    return this.with(() => this.redis.expireSync(key, seconds))
  }

  set(key: string, value: unknown, options?: SetOptions): FakePipeline {
    return this.with(() => this.redis.setSync(key, value, options))
  }

  get(key: string): FakePipeline {
    return this.with(() => this.redis.getSync(key))
  }

  mget(...keys: string[]): FakePipeline {
    return this.with(() => keys.map((key) => this.redis.getSync(key)))
  }

  async exec(): Promise<unknown[]> {
    this.guard('exec')
    return this.ops.map((op) => op())
  }
}
