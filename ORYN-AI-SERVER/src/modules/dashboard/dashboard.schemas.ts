import { Schema } from '../../shared/utils/validator';

export interface DashboardCommandDto {
  query: string;
  context?: string;
}

export const dashboardCommandSchema = Schema.object<DashboardCommandDto>({
  query: Schema.string({ min: 1, max: 1000 }) as any,
  context: Schema.string({ optional: true, max: 2000 }) as any,
});

export const goalActionParamSchema = Schema.object<{ id: string }>({
  id: Schema.string({ min: 1 }) as any,
});
