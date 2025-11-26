import { D1Service } from './d1-service';

export default class AlbumTagService extends D1Service<any> {
    constructor(db: D1Database) {
        super(db, 'album_tags');
    }

    override async getAll(): Promise<any[]> {
        const { results } = await this.db.prepare('SELECT * FROM album_tags ORDER BY tag ASC').all();
        return results || [];
    }

    override async create(items: any): Promise<any> {
        const tags = Array.isArray(items) ? items : [items];
        if (tags.length === 0) return;

        const stmt = this.db.prepare(
            'INSERT OR IGNORE INTO album_tags (tag, createdAt, createdBy) VALUES (?, ?, ?)',
        );
        const batch = tags.map((item: any) =>
            stmt.bind(item.tag, new Date().toISOString(), item.createdBy || 'system'),
        );
        await this.db.batch(batch);
    }

    override async delete(tag: string): Promise<any> {
        // Delete from map first (cascading delete logic)
        await this.db.prepare('DELETE FROM album_tags_map WHERE tag = ?').bind(tag).run();
        // Delete from tags table
        await this.db.prepare('DELETE FROM album_tags WHERE tag = ?').bind(tag).run();
    }
}
