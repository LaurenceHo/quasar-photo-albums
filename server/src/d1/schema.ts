import { Database } from '@cloudflare/d1';

export async function initialiseSchema(db: Database) {
  const tables = ['albums', 'album_tags', 'album_tags_map', 'travel_records', 'user_permissions'];

  for (const table of tables) {
    const { results } = await db.prepare(`PRAGMA table_info(${table})`).all();
    if (!results || results.length === 0) {
      console.log(`Creating table: ${table}`);
      await createTable(db, table);
    } else {
      console.log(`Table ${table} already exists, skipping creation`);
    }
  }
}

async function createTable(db: Database, table: string) {
  const schemas = {
    albums: `
      CREATE TABLE albums (
        id TEXT PRIMARY KEY,
        year TEXT NOT NULL,
        albumName TEXT NOT NULL,
        description TEXT,
        albumCover TEXT,
        isPrivate INTEGER NOT NULL CHECK (isPrivate IN (0, 1)),
        isFeatured INTEGER CHECK (isFeatured IN (0, 1)),
        place TEXT NOT NULL CHECK (json_valid(place)),
        createdAt TEXT NOT NULL,
        createdBy TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        updatedBy TEXT NOT NULL
      ) STRICT;
    `,
    album_tags: `
      CREATE TABLE album_tags (
        tag TEXT PRIMARY KEY,
        createdAt TEXT NOT NULL,
        createdBy TEXT NOT NULL
      ) STRICT;
    `,
    album_tags_map: `
      CREATE TABLE album_tags_map (
        albumId TEXT NOT NULL,
        tag TEXT NOT NULL,
        FOREIGN KEY (albumId) REFERENCES albums(id) ON DELETE CASCADE,
        FOREIGN KEY (tag) REFERENCES album_tags(tag) ON DELETE CASCADE,
        PRIMARY KEY (albumId, tag)
      );
    `,
    travel_records: `
      CREATE TABLE travel_records (
        id TEXT PRIMARY KEY,
        travelDate TEXT NOT NULL,
        departure TEXT NOT NULL CHECK (json_valid(departure)),
        destination TEXT NOT NULL CHECK (json_valid(destination)),
        transportType TEXT NOT NULL,
        airline TEXT,
        flightNumber TEXT,
        distance INTEGER NOT NULL,
        createdAt TEXT NOT NULL,
        createdBy TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        updatedBy TEXT NOT NULL
      ) STRICT;
    `,
    user_permissions: `
      CREATE TABLE user_permissions (
        uid TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        displayName TEXT NOT NULL,
        role TEXT NOT NULL
      );

      INSERT INTO "user_permissions"
      VALUES ('test-uid-1', 'test@example.com', 'Test User', 'admin');
    `,
  };

  const sql = schemas[table as keyof typeof schemas];
  if (sql) {
    await db.exec(sql);
  } else {
    throw new Error(`No schema defined for table: ${table}`);
  }
}
