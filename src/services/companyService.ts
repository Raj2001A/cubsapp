import { api } from './api';
import { Company } from '../types/company';
import { getOrFetchData } from '../utils/cacheUtils';

// Cache keys
const CACHE_KEYS = {
  ALL_COMPANIES: 'companies:all',
  COMPANY_BY_ID: (id: string) => `companies:${id}`
};

// Cache durations
const CACHE_DURATIONS = {
  COMPANIES: 15 * 60 * 1000, // 15 minutes
};

// Service for company operations
export const companyService = {
  // Get all companies with caching
  getAll: async (): Promise<Company[]> => {
    try {
      return await getOrFetchData(
        CACHE_KEYS.ALL_COMPANIES,
        async () => {
          const response = await api.companies.getAll();
          return response.data;
        },
        CACHE_DURATIONS.COMPANIES
      );
    } catch (error) {
      console.error('Error fetching companies:', error);
      throw error;
    }
  },

  // Get company by ID with caching
  getById: async (id: string): Promise<Company> => {
    try {
      return await getOrFetchData(
        CACHE_KEYS.COMPANY_BY_ID(id),
        async () => {
          const response = await api.companies.getById(id);
          return response.data;
        },
        CACHE_DURATIONS.COMPANIES
      );
    } catch (error) {
      console.error(`Error fetching company ${id}:`, error);
      throw error;
    }
  },

  // Create a new company
  create: async (company: Omit<Company, 'id'>): Promise<Company> => {
    try {
      const response = await api.companies.create(company);
      return response.data;
    } catch (error) {
      console.error('Error creating company:', error);
      throw error;
    }
  },

  // Update a company
  update: async (id: string, company: Partial<Company>): Promise<Company> => {
    try {
      const response = await api.companies.update(id, company);
      return response.data;
    } catch (error) {
      console.error(`Error updating company ${id}:`, error);
      throw error;
    }
  },

  // Delete a company
  delete: async (id: string): Promise<boolean> => {
    try {
      await api.companies.delete(id);
      return true;
    } catch (error) {
      console.error(`Error deleting company ${id}:`, error);
      throw error;
    }
  }
};
