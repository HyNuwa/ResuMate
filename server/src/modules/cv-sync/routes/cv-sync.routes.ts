import express from 'express';
import { 
  getAllCVs, 
  getCVById, 
  createCV, 
  updateCV, 
  deleteCV 
} from '../services/cv-sync.service';

const router = express.Router();

// GET all CVs (main endpoint)
router.get('/', getAllCVs);

// GET all CVs (alias for compatibility)
router.get('/all', getAllCVs);

// GET single CV by ID
router.get('/:id', getCVById);

// POST create new CV
router.post('/create', createCV);

// PUT update CV
router.put('/:id', updateCV);

// DELETE CV
router.delete('/:id', deleteCV);

export default router;
