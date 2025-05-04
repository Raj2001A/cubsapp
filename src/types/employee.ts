export type Document = {
  id: string;
  name: string;
  url?: string;
  expired?: boolean;
  missing?: boolean;
};

export type Employee = {
  id: string;
  name: string;
  department: string;
  visaExpiryDate?: string;
  documents?: Document[];
};
