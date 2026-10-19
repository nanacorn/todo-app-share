CREATE TABLE workspace (id INTEGER PRIMARY KEY CHECK (id = 1), revision INTEGER NOT NULL DEFAULT 0, payload TEXT);
INSERT INTO workspace (id, revision, payload) VALUES (1, 0, NULL);
CREATE TABLE media (id TEXT PRIMARY KEY, object_key TEXT NOT NULL UNIQUE, content_type TEXT NOT NULL, created_at INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'active');
