import { Schema } from '../../shared/utils/validator';
import { AnalysisRequestDto } from './analysis.types';

export const analysisRequestSchema = Schema.object<AnalysisRequestDto>({
  prompt: Schema.string({ optional: true, max: 2000 }) as any,
  model: Schema.string({ optional: true }) as any,
  language: Schema.string({ optional: true }) as any,
});
