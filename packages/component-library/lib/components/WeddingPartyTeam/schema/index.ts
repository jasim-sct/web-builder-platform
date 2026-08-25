
import { weddingpartyteamActionsSchema } from './actions';
import { weddingpartyteamPropsSchema } from './props';
import { weddingpartyteamStyleSchema } from './style';
import type { SectionSchema } from '../../../schema/types';

export const weddingpartyteamSchema: SectionSchema = {
  props: weddingpartyteamPropsSchema,
  style: weddingpartyteamStyleSchema,
  actions: weddingpartyteamActionsSchema,
};

export * from './props';
export * from './style';
export * from './actions';
