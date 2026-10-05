import { prisma } from '../../infrastructure/database/prisma';
import { defaultDatastore, Datastore, DocumentRecord } from '../../infrastructure/storage/datastore';
import { Logger } from '../../infrastructure/logging/logger';
import { NotFoundError } from '../../shared/errors/app-error';

const logger = new Logger('DocumentsService');

export class DocumentsService {
  private defaultOrgId = 'org_oryn_global_001';

  constructor(private datastore: Datastore = defaultDatastore) {}

  async getDocuments(orgId = this.defaultOrgId): Promise<DocumentRecord[]> {
    try {
      const records = await prisma.document.findMany({
        where: { orgId },
        orderBy: { createdAt: 'desc' },
      });

      return records.map((doc) => {
        const ext = doc.mimeType?.split('/')[1]?.toUpperCase() || 'FILE';
        const sizeStr = doc.fileSize > 1024 * 1024
          ? `${(doc.fileSize / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(doc.fileSize / 1024)} KB`;

        return {
          id: doc.id,
          name: doc.name,
          type: ext,
          size: sizeStr,
          date: doc.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          tags: doc.tags || [],
          aiSummary: doc.aiSummary,
        };
      });
    } catch (err: any) {
      logger.warn('Falling back to datastore for documents', { error: err.message });
      return this.datastore.getDocuments();
    }
  }

  async addDocument(data: {
    name: string;
    type: string;
    size: string;
    tags: string[];
    aiSummary: string;
    mimeType?: string;
    fileSize?: number;
    orgId?: string;
  }): Promise<DocumentRecord> {
    const orgId = data.orgId || this.defaultOrgId;
    const sizeBytes = data.fileSize || 1024 * 50;

    try {
      const created = await prisma.document.create({
        data: {
          orgId,
          name: data.name,
          fileUrl: `/uploads/${encodeURIComponent(data.name)}`,
          mimeType: data.mimeType || `application/${data.type.toLowerCase()}`,
          fileSize: sizeBytes,
          tags: data.tags,
          aiSummary: data.aiSummary,
        },
      });

      const docRecord: DocumentRecord = {
        id: created.id,
        name: created.name,
        type: data.type,
        size: data.size,
        date: created.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        tags: created.tags,
        aiSummary: created.aiSummary,
      };

      // Keep local datastore synced
      this.datastore.addDocument(docRecord);
      return docRecord;
    } catch (err: any) {
      logger.warn('Failed to insert document into PostgreSQL, saving to datastore', { error: err.message });
      return this.datastore.addDocument({
        name: data.name,
        type: data.type,
        size: data.size,
        tags: data.tags,
        aiSummary: data.aiSummary,
      });
    }
  }

  async deleteDocument(id: string, orgId = this.defaultOrgId): Promise<boolean> {
    try {
      const res = await prisma.document.deleteMany({
        where: { id, orgId },
      });
      this.datastore.deleteDocument(id);
      if (res.count === 0 && !this.datastore.getDocument(id)) {
        throw new NotFoundError(`Document '${id}' not found`);
      }
      return true;
    } catch (err: any) {
      if (err instanceof NotFoundError) throw err;
      const deleted = this.datastore.deleteDocument(id);
      if (!deleted) throw new NotFoundError(`Document '${id}' not found`);
      return true;
    }
  }
}

export const defaultDocumentsService = new DocumentsService();
