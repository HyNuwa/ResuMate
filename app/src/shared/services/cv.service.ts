import axios from 'axios';
import type { ResumeData } from '@resumate/schema';

const API_BASE_URL = 'http://localhost:3000/api';

export interface CVDocument {
  id: string;
  slug: string;
  title: string;
  data: ResumeData;
  visibility: string;
  viewCount: number;
  locale: string;
  createdAt: string;
  updatedAt: string;
}

export interface OptimizationResult {
  originalText: string;
  optimizedText: string;
  improvements: string[];
  keywords: string[];
  model: string;
  processingTime: string;
}

const resumeApi = axios.create({ baseURL: `${API_BASE_URL}/resumes` });

export const getAllCVs = async (): Promise<CVDocument[]> => {
  const res = await resumeApi.get<{ success: boolean; data: CVDocument[] }>('/');
  return res.data.data;
};

export const getCVById = async (id: string): Promise<CVDocument> => {
  const res = await resumeApi.get<{ success: boolean; data: CVDocument }>(`/${id}`);
  return res.data.data;
};

export const createCV = async (data: ResumeData): Promise<CVDocument> => {
  const res = await resumeApi.post<{ success: boolean; data: CVDocument }>('/', {
    title: data.basics.name || 'Untitled CV',
    data,
    locale: 'en',
  });
  return res.data.data;
};

export const updateCV = async (id: string, data: ResumeData): Promise<CVDocument> => {
  const res = await resumeApi.put<{ success: boolean; data: CVDocument }>(`/${id}`, {
    title: data.basics.name || 'Untitled CV',
    data,
  });
  return res.data.data;
};

export const deleteCV = async (id: string): Promise<void> => {
  await resumeApi.delete(`/${id}`);
};

export const printResumePDF = async (id: string): Promise<Blob> => {
  const response = await axios.post(`${API_BASE_URL}/printer/${id}/pdf`, {}, {
    responseType: 'blob',
  });
  return response.data;
};

export const optimizeCV = async (file: File, jobDescription: string): Promise<OptimizationResult> => {
  const formData = new FormData();
  formData.append('cv', file);
  formData.append('jobDescription', jobDescription);

  const response = await axios.post(`${API_BASE_URL}/cv/optimize`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
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
