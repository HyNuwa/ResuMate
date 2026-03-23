import { create } from 'zustand';

export interface TemplateOption {
  id: string;
  name: string;
  thumbnail?: string;
}

export interface TemplateState {
  selectedTemplateId: string;
  templates: TemplateOption[];
  setTemplate: (id: string) => void;
  addTemplate: (template: TemplateOption) => void;
}

export const useTemplateStore = create<TemplateState>()((set) => ({
  selectedTemplateId: 'classic',
  templates: [
    { id: 'classic',    name: 'Classic'    },
    { id: 'harvard',   name: 'Harvard'    },
    { id: 'modern',    name: 'Modern'     },
    { id: 'minimal',   name: 'Minimal'    },
    { id: 'executive', name: 'Executive'  },
  ],

  setTemplate: (id) => set({ selectedTemplateId: id }),
  addTemplate: (template) =>
    set((s) => ({ templates: [...s.templates, template] })),
}));
