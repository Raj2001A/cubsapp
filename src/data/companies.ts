// Company data structure
export interface Company {
  id: string;
  name: string;
  location: string;
}

// List of companies
export const companies: Company[] = [
  {
    id: '1',
    name: 'CUBS TECH CONTRACTING',
    location: 'SHARJAH, UAE'
  },
  {
    id: '2',
    name: 'GOLDENCUBS GENERAL CONTRACTING LLC',
    location: 'ABUDHABI, UAE'
  },
  {
    id: '3',
    name: 'AL ASHBAL ELECTROMECHANICAL CONTRACTING LLC',
    location: 'AJMAN, UAE'
  },
  {
    id: '4',
    name: 'FLUID ENGINEERING SERVICES LLC',
    location: 'ABUDHABI, UAE'
  },
  {
    id: '5',
    name: 'ASHBAL AL KHALEEJ CONCRETE CARPENTER CONT',
    location: 'SHARJAH, UAE'
  },
  {
    id: '6',
    name: 'RUKIN AL ASHBAL SANITARY CONT',
    location: 'SHARJAH, UAE'
  },
  {
    id: '7',
    name: 'CUBS CONTRACTING AND SERVICES W.L.L',
    location: 'QATAR'
  },
  {
    id: '8',
    name: 'AL MACEN TRADING & CONTRACTING W.L.L.',
    location: 'QATAR'
  },
  {
    id: '9',
    name: 'AL HANA TOURS',
    location: 'SHARJAH, UAE'
  },
  {
    id: '10',
    name: 'TEMPORARY WORKER',
    location: ''
  }
];

// Get full company name with location
export const getFullCompanyName = (companyId: string): string => {
  const company = companies.find(c => c.id === companyId);
  if (!company) return '';
  
  if (company.location) {
    return `${company.name}, ${company.location}`;
  }
  
  return company.name;
};

// Get company by ID
export const getCompanyById = (companyId: string): Company | undefined => {
  return companies.find(c => c.id === companyId);
};

// export default companies; // Removed default export to avoid import conflicts
