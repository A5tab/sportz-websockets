import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  uuid
} from 'drizzle-orm/pg-core';

export const matchStatus = pgEnum('match_status', ['scheduled', 'live', 'finished']);
export const role = pgEnum('role', ['admin', 'user']);

const timestamps = {
  updatedAt: timestamp('updated_at').defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
};

export const matches = pgTable('matches', {
  id: serial('id').primaryKey(),
  sport: text('sport').notNull(),
  homeTeam: text('home_team').notNull(),
  awayTeam: text('away_team').notNull(),
  status: matchStatus('status').notNull(),
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }),
  homeScore: integer('home_score').notNull().default(0),
  awayScore: integer('away_score').notNull().default(0),
  ...timestamps 
});

export const commentary = pgTable('commentary', {
  id: serial('id').primaryKey(),
  matchId: integer('match_id')
    .notNull()
    .references(() => matches.id, { onDelete: 'cascade' }),
  minute: integer('minute'),
  sequence: integer('sequence'),
  period: text('period'),
  eventType: text('event_type'),
  actor: text('actor'),
  team: text('team'),
  message: text('message'),
  metadata: jsonb('metadata'),
  tags: text('tags').array(),
  ...timestamps
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  role: role('role').notNull().default('user'),
  avatar: text('avatar'),
  bio: text("bio").default("Hello, I am new here!"),
  ...timestamps,
});

export const session = pgTable('session', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  familyId: uuid('family_id').notNull().defaultRandom(),
  refreshToken: text('refresh_token').notNull(),
  isUsed: boolean('is_used').default(false), 
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address", { length: 45 }),
  expiresAt: timestamp("expires_at").notNull(),
  ...timestamps
});