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

  private async ensureOrganization(orgId: string): Promise<void> {
    try {
      const exists = await prisma.organization.findUnique({ where: { id: orgId } });
      if (!exists) {
        await prisma.organization.create({
          data: {
            id: orgId,
            name: 'ORYN Global AI',
            industry: 'Artificial Intelligence',
            location: 'San Francisco, CA',
            foundedDate: new Date('2024-01-01'),
          },
        });
      }
    } catch (e: any) {
      logger.debug('Organization existence check or creation notice', { error: e.message });
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

    const extFromMime = data.mimeType ? data.mimeType.split('/').pop()?.toUpperCase() : '';
    const cleanType = (data.type || extFromMime || 'DOC').toUpperCase().replace(/[^A-Z0-9]/g, '');
    const cleanTags = Array.from(new Set(
      (data.tags || []).map(t => t.trim()).filter(Boolean)
    ));
    if (!cleanTags.includes(cleanType)) {
      cleanTags.push(cleanType);
    }

    try {
      await this.ensureOrganization(orgId);

      const created = await prisma.document.create({
        data: {
          orgId,
          name: data.name.trim(),
          fileUrl: `/uploads/${encodeURIComponent(data.name.trim())}`,
          mimeType: data.mimeType || `application/${cleanType.toLowerCase()}`,
          fileSize: sizeBytes,
          tags: cleanTags,
          aiSummary: data.aiSummary?.trim() || 'Document ingested and indexed for neural processing.',
        },
      });

      const docRecord: DocumentRecord = {
        id: created.id,
        name: created.name,
        type: cleanType,
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
        name: data.name.trim(),
        type: cleanType,
        size: data.size,
        tags: cleanTags,
        aiSummary: data.aiSummary?.trim() || 'Document indexed.',
      });
    }
  }

  async deleteDocument(id: string, orgId = this.defaultOrgId): Promise<boolean> {
    let deletedInPg = false;
    try {
      const res = await prisma.document.deleteMany({
        where: { id, orgId },
      });
      deletedInPg = res.count > 0;
    } catch (err: any) {
      logger.warn('Error deleting document from PostgreSQL', { error: err.message });
    }

    const deletedInDatastore = this.datastore.deleteDocument(id);

    if (!deletedInPg && !deletedInDatastore) {
      throw new NotFoundError(`Document '${id}' not found`);
    }

    return true;
  }
}

export const defaultDocumentsService = new DocumentsService();
