import axios from 'axios';
import type { Resume } from '../types/resume';

const API_BASE_URL = 'http://localhost:3000/api';

export interface OptimizationResult {
  originalText: string;
  optimizedText: string;
  improvements: string[];
  keywords: string[];
  model: string;
  processingTime: string;
}

/**
 * Optimizes a CV against a job description using AI
 */
export const optimizeCV = async (file: File, jobDescription: string): Promise<OptimizationResult> => {
  const formData = new FormData();
  formData.append('cv', file);
  formData.append('jobDescription', jobDescription);

  const response = await axios.post(`${API_BASE_URL}/cv/optimize`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (!response.data.success) {
    throw new Error(response.data.error || 'Optimization failed');
  }

  return {
    originalText: response.data.data.originalText,
    optimizedText: response.data.data.optimizedText,
    improvements: response.data.data.improvements,
    keywords: response.data.data.keywords,
    model: response.data.data.model,
    processingTime: response.data.data.processingTime,
  };
};

/**
 * Fetches a CV by its ID
 */
export const getCVById = async (id: string): Promise<Resume> => {
  const response = await axios.get(`${API_BASE_URL}/cv-sync/${id}`);

  if (!response.data.success) {
    throw new Error(response.data.error || 'CV not found');
  }

  return response.data.data;
};

/**
 * Fetches all CVs
 */
export const getAllCVs = async (): Promise<Resume[]> => {
  const response = await axios.get(`${API_BASE_URL}/cv-sync`);

  if (!response.data.success) {
    throw new Error(response.data.error || 'Failed to fetch CVs');
  }

  return response.data.data;
};

/**
 * Creates a new CV
 */
export const createCV = async (cv: Resume): Promise<Resume> => {
  const response = await axios.post(`${API_BASE_URL}/cv-sync/create`, cv);

  if (!response.data.success) {
    throw new Error(response.data.error || 'Failed to create CV');
  }

  return response.data.data;
};

/**
 * Updates an existing CV
 */
export const updateCV = async (id: string, cv: Resume): Promise<Resume> => {
  const response = await axios.put(`${API_BASE_URL}/cv-sync/${id}`, cv);

  if (!response.data.success) {
    throw new Error(response.data.error || 'Failed to update CV');
  }

  return response.data.data;
};

/**
 * Deletes a CV by its ID
 */
export const deleteCV = async (id: string): Promise<void> => {
  const response = await axios.delete(`${API_BASE_URL}/cv-sync/${id}`);

  if (!response.data.success) {
    throw new Error(response.data.error || 'Failed to delete CV');
  }
};
