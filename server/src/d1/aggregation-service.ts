import { D1Service } from './d1-service';

export default class AggregationService extends D1Service<any> {
    constructor(db: D1Database) {
        super(db, 'albums'); // Base table is albums
    }

    async getAlbumsWithLocation(includePrivate: boolean): Promise<any[]> {
        let sql = `
      SELECT *
      FROM albums
      WHERE place IS NOT NULL AND place != ''
    `;

        if (!includePrivate) {
            sql += ' AND isPrivate = 0';
        }

        const { results } = await this.db.prepare(sql).all();
        return (results || []).map((item) => this.mapAlbum(item));
    }

    async getFeaturedAlbums(): Promise<any[]> {
        const sql = `
      SELECT *
      FROM albums
      WHERE isFeatured = 1
    `;
        const { results } = await this.db.prepare(sql).all();
        return (results || []).map((item) => this.mapAlbum(item));
    }

    async getCountAlbumsByYear(includePrivate: boolean): Promise<any[]> {
        let sql = `
      SELECT year, COUNT(*) as count
      FROM albums
    `;

        if (!includePrivate) {
            sql += ' WHERE isPrivate = 0';
        }

        sql += ' GROUP BY year ORDER BY year DESC';

        const { results } = await this.db.prepare(sql).all();
        return results || [];
    }

    private mapAlbum(item: any): any {
        // Convert booleans
        if (item.isPrivate !== undefined) {
            item.isPrivate = !!item.isPrivate;
        }
        if (item.isFeatured !== undefined) {
            item.isFeatured = !!item.isFeatured;
        }
        return item;
    }
}
