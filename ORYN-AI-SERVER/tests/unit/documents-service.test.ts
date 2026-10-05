import { describe, it } from 'node:test';
import assert from 'node:assert';
import { DocumentsService } from '../../src/modules/documents/documents.service';
import { NotFoundError } from '../../src/shared/errors/app-error';

describe('DocumentsService Enterprise Ingestion Suite', () => {
  const documentsService = new DocumentsService();
  const testOrgId = 'org_oryn_global_001';

  it('should create and retrieve a dynamic document in the repository', async () => {
    const testDocName = `Operational_Audit_${Date.now()}.pdf`;
    const created = await documentsService.addDocument({
      name: testDocName,
      type: 'PDF',
      size: '2.4 MB',
      tags: ['Audit', 'Financial'],
      aiSummary: 'Autonomous neural extraction of operational quarterly balance sheets.',
      mimeType: 'application/pdf',
      fileSize: 2450000,
      orgId: testOrgId,
    });

    assert.ok(created);
    assert.ok(created.id);
    assert.strictEqual(created.name, testDocName);
    assert.strictEqual(created.type, 'PDF');
    assert.ok(created.tags.includes('Audit'));
    assert.ok(created.tags.includes('PDF'));

    const list = await documentsService.getDocuments(testOrgId);
    assert.ok(Array.isArray(list));
    const found = list.find((d) => d.id === created.id);
    assert.ok(found, 'Created document should be returned in getDocuments()');
    assert.strictEqual(found?.name, testDocName);

    // Clean up
    await documentsService.deleteDocument(created.id, testOrgId);
    const postDeleteList = await documentsService.getDocuments(testOrgId);
    assert.strictEqual(
      postDeleteList.some((d) => d.id === created.id),
      false,
      'Deleted document must not remain in repository'
    );
  });

  it('should support search query and tag filtering', async () => {
    const docA = await documentsService.addDocument({
      name: `Security_Protocol_${Date.now()}.docx`,
      type: 'DOCX',
      size: '412 KB',
      tags: ['Security', 'Infra'],
      aiSummary: 'Zero-trust infrastructure policy briefing.',
      orgId: testOrgId,
    });

    const docB = await documentsService.addDocument({
      name: `Q4_Revenue_Projection_${Date.now()}.csv`,
      type: 'CSV',
      size: '1.1 MB',
      tags: ['Revenue', 'Projections'],
      aiSummary: 'ARR forecasting baseline.',
      orgId: testOrgId,
    });

    // Tag filter
    const securityDocs = await documentsService.getDocuments(testOrgId, undefined, 'Security');
    assert.ok(securityDocs.some((d) => d.id === docA.id));
    assert.strictEqual(securityDocs.some((d) => d.id === docB.id), false);

    // Search filter
    const searchDocs = await documentsService.getDocuments(testOrgId, 'Revenue_Projection');
    assert.ok(searchDocs.some((d) => d.id === docB.id));
    assert.strictEqual(searchDocs.some((d) => d.id === docA.id), false);

    // Cleanup
    await documentsService.deleteDocument(docA.id, testOrgId);
    await documentsService.deleteDocument(docB.id, testOrgId);
  });

  it('should throw NotFoundError when deleting non-existent document', async () => {
    await assert.rejects(
      async () => {
        await documentsService.deleteDocument('non_existent_doc_id_9999', testOrgId);
      },
      (err: any) => {
        return err instanceof NotFoundError;
      }
    );
  });
});
