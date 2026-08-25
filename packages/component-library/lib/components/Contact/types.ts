import type { BaseSectionProps } from '../../types';

export interface ContactInfoData {
  email?: string;
  phone?: string;
  address?: string;
  businessHours?: string;
}

export interface ContactProps {
  badge?: string;
  title: string;
  description?: string;
  submitButtonLabel: string;
  successMessage?: string;
  showPhoneField: boolean;
  contactInfo?: ContactInfoData;
}

export type ContactComponentProps = BaseSectionProps<ContactProps>;
