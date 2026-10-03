import { describe, it } from 'node:test';
import assert from 'node:assert';
import path from 'path';
import fs from 'fs';
import { Datastore } from '../../src/infrastructure/storage/datastore';
import { EmailService } from '../../src/modules/email/email.service';

describe('Human-in-the-Loop Email Protocol', () => {
  const testDbPath = path.resolve(__dirname, '../../data/test-hil-email-db.json');

  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }

  const datastore = new Datastore(testDbPath);
  const emailService = new EmailService(datastore);

  it('should stage an email draft with awaiting_approval status and unique ID', () => {
    const draft = datastore.stageEmailDraft(
      'alex@example.com',
      'Q4 Performance Review',
      'Dear Alex, please find the attached executive review notes.'
    );

    assert.ok(draft.id);
    assert.strictEqual(draft.to, 'alex@example.com');
    assert.strictEqual(draft.subject, 'Q4 Performance Review');
    assert.strictEqual(draft.body, 'Dear Alex, please find the attached executive review notes.');
    assert.strictEqual(draft.status, 'awaiting_approval');
    assert.ok(draft.createdAt);
  });

  it('should retrieve staged email draft by ID', () => {
    const draft = datastore.stageEmailDraft(
      'sarah@techcorp.io',
      'Architecture Alignment',
      'Meeting scheduled for tomorrow at 10:00 AM UTC.'
    );

    const fetched = datastore.getEmailDraft(draft.id);
    assert.ok(fetched);
    assert.strictEqual(fetched?.id, draft.id);
    assert.strictEqual(fetched?.to, 'sarah@techcorp.io');
    assert.strictEqual(fetched?.status, 'awaiting_approval');
  });

  it('should update email record status to sent upon human confirmation', () => {
    const draft = datastore.stageEmailDraft(
      'investors@oryn.ai',
      'Monthly Investor Update',
      'Revenue grew by 24% month-over-month.'
    );

    const updated = datastore.updateEmailRecord(draft.id, {
      status: 'sent',
      messageId: '<test-msg-12345@smtp.gmail.com>',
      sentAt: new Date().toISOString()
    });

    assert.ok(updated);
    assert.strictEqual(updated?.status, 'sent');
    assert.strictEqual(updated?.messageId, '<test-msg-12345@smtp.gmail.com>');
    assert.ok(updated?.sentAt);

    const logs = datastore.getEmailLogs(10);
    const inLogs = logs.find(l => l.id === draft.id);
    assert.ok(inLogs);
    assert.strictEqual(inLogs?.status, 'sent');
  });

  it('should update email record status to failed if dispatch encounters an error', () => {
    const draft = datastore.stageEmailDraft(
      'invalid@destination.fail',
      'Test Alert',
      'Testing error handling path.'
    );

    const updated = datastore.updateEmailRecord(draft.id, {
      status: 'failed',
      error: 'SMTP dispatch failed: Connection timeout'
    });

    assert.ok(updated);
    assert.strictEqual(updated?.status, 'failed');
    assert.strictEqual(updated?.error, 'SMTP dispatch failed: Connection timeout');
  });

  it('EmailService.stageDraft should support array of recipients', () => {
    const staged = emailService.stageDraft(
      ['team@oryn.ai', 'leads@oryn.ai'],
      'All-Hands Announcement',
      'All-hands meeting starting in 15 minutes.'
    );

    assert.strictEqual(staged.to, 'team@oryn.ai, leads@oryn.ai');
    assert.strictEqual(staged.subject, 'All-Hands Announcement');
    assert.strictEqual(staged.status, 'awaiting_approval');
  });

  it('cleanup test database file', () => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });
});
