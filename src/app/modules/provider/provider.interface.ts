export interface ICreateProviderProfilePayload {
  businessName: string;
  phone: string;
  address: string;
}

export interface IUpdateProviderProfilePayload {
  businessName?: string;
  phone?: string;
  address?: string;
}