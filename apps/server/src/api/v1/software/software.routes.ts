import { Router } from 'express';
import {
  createSoftwareAsset,
  getSoftwareAssets,
  updateSoftwareAsset,
  deleteSoftwareAsset,
} from './software.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = Router();

// All routes will be protected by the `protect` middleware
router.use(protect);

router.route('/').post(createSoftwareAsset).get(getSoftwareAssets);
router.route('/:id').put(updateSoftwareAsset).delete(deleteSoftwareAsset);

export default router;
