export * from '../shared/types/common';
export * from '../modules/chat/chat.types';
export * from '../modules/dashboard/dashboard.types';
export * from '../modules/email/email.types';
export * from '../modules/analysis/analysis.types';
export * from '../modules/inference/inference.types';

// Backward compatibility aliases
export type ChatRequestBody = import('../modules/chat/chat.types').ChatRequestDto;
export type DashboardCommandBody = import('../modules/dashboard/dashboard.schemas').DashboardCommandDto;
export type EmailRequestBody = import('../modules/email/email.types').EmailRequestDto;
