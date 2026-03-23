import { Request, Response } from 'express';
import { db } from '../../../db';
import { userCvs } from '../../../db/schema';
import { eq, desc } from 'drizzle-orm';

/**
 * GET /api/cv-sync/all
 * Get all CVs from the database
 */
export const getAllCVs = async (req: Request, res: Response): Promise<any> => {
  try {
    const cvs = await db.select().from(userCvs).orderBy(desc(userCvs.updatedAt));
        
    // Transform to match frontend format
    const formattedCvs = cvs.map(cv => cv.data);
    
    res.json({
      success: true,
      data: formattedCvs
    });
  } catch (error: any) {
    console.error('Error fetching CVs:', error);
    res.status(500).json({
      error: error.message || 'Error al obtener CVs'
    });
  }
};

/**
 * GET /api/cv-sync/:id
 * Get a single CV by ID
 */
export const getCVById = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params['id'] as string;
    
    const cv = await db.select().from(userCvs).where(eq(userCvs.id, id)).limit(1);
    
    if (cv.length === 0) {
      return res.status(404).json({
        error: 'CV no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: cv[0].data
    });
  } catch (error: any) {
    console.error('Error fetching CV:', error);
    res.status(500).json({
      error: error.message || 'Error al obtener CV'
    });
  }
};

/**
 * POST /api/cv-sync/create
 * Create a new CV
 */
export const createCV = async (req: Request, res: Response): Promise<any> => {
  try {
    const cvData = req.body;
    
    // Validate required fields
    if (!cvData.metadata || !cvData.metadata.id) {
      return res.status(400).json({
        error: 'CV metadata and ID are required'
      });
    }
    
    const newCv = await db.insert(userCvs).values({
      title: cvData.metadata?.title ?? 'Untitled CV',
      data: cvData,
      schemaVersion: '1.0.0',
    }).returning();
    
    res.status(201).json({
      success: true,
      data: newCv[0].data
    });
  } catch (error: any) {
    console.error('Error creating CV:', error);
    
    // Handle duplicate key error
    if (error.code === '23505') {
      return res.status(409).json({
        error: 'Ya existe un CV con este ID'
      });
    }
    
    res.status(500).json({
      error: error.message || 'Error al crear CV'
    });
  }
};

/**
 * PUT /api/cv-sync/:id
 * Update an existing CV (or create if doesn't exist - upsert)
 */
export const updateCV = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const cvData = req.body;
    
    // Validate required fields
    if (!cvData.metadata) {
      return res.status(400).json({
        error: 'CV metadata is required'
      });
    }
    
    // Update the timestamp
    cvData.metadata.updatedAt = new Date().toISOString();
    
    // First try to update
    const cvId = req.params['id'] as string;
    const updatedCv = await db.update(userCvs)
      .set({
        title: cvData.metadata?.title ?? 'Untitled CV',
        data: cvData,
        updatedAt: new Date()
      })
      .where(eq(userCvs.id, cvId))
      .returning();
    
    // If CV doesn't exist, create it
    if (updatedCv.length === 0) {
      console.log(`CV ${cvId} not found, creating it...`);
      
      const newCv = await db.insert(userCvs).values({
        title: cvData.metadata?.title ?? 'Untitled CV',
        data: cvData,
        schemaVersion: '1.0.0',
      }).returning();
      
      return res.status(201).json({
        success: true,
        data: newCv[0].data,
        created: true
      });
    }
    
    res.json({
      success: true,
      data: updatedCv[0].data
    });
  } catch (error: any) {
    console.error('Error updating CV:', error);
    res.status(500).json({
      error: error.message || 'Error al actualizar CV'
    });
  }
};

/**
 * DELETE /api/cv-sync/:id
 * Delete a CV
 */
export const deleteCV = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    
    const deleteId = req.params['id'] as string;
    const deletedCv = await db.delete(userCvs)
      .where(eq(userCvs.id, deleteId))
      .returning();
    
    if (deletedCv.length === 0) {
      return res.status(404).json({
        error: 'CV no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'CV eliminado correctamente'
    });
  } catch (error: any) {
    console.error('Error deleting CV:', error);
    res.status(500).json({
      error: error.message || 'Error al eliminar CV'
    });
  }
};
