export const schema = `
DROP TABLE IF EXISTS albums;
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

DROP TABLE IF EXISTS album_tags;
CREATE TABLE album_tags (
  tag TEXT PRIMARY KEY,
  createdAt TEXT NOT NULL,
  createdBy TEXT NOT NULL
) STRICT;

DROP TABLE IF EXISTS album_tags_map;
CREATE TABLE album_tags_map (
    albumId TEXT NOT NULL,
    tag TEXT NOT NULL,
    FOREIGN KEY(albumId) REFERENCES albums(id),
    FOREIGN KEY(tag) REFERENCES album_tags(tag),
    PRIMARY KEY (albumId, tag)
);

DROP TABLE IF EXISTS travel_records;
CREATE TABLE travel_records (
  id TEXT PRIMARY KEY,
  travelDate TEXT NOT NULL,
  departure TEXT NOT NULL CHECK (json_valid(departure)),
  destination TEXT NOT NULL CHECK (json_valid(destination)),
  transportType TEXT NOT NULL,
  flightNumber TEXT,
  distance INTEGER NOT NULL,
  createdAt TEXT NOT NULL,
  createdBy TEXT NOT NULL
);

DROP TABLE IF EXISTS user_permissions;
CREATE TABLE user_permissions (
  uid TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  displayName TEXT NOT NULL,
  role TEXT NOT NULL
);
`;
