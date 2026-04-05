import { Router } from 'express';
import { generatePDF } from './printer.controller';

const router = Router();

router.post('/:id/pdf', generatePDF);

export default router;