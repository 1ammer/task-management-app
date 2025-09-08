import express, { Router } from 'express';
import { 
  getProfile, 
  updateProfile, 
  changePassword
} from '../controllers/profileController';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validation';
import { updateProfileSchema, changePasswordSchema } from '../validations/profile.validation';

const router: Router = express.Router();

// All profile routes require authentication
router.use(authenticate);

// GET /api/profile - Get user profile
router.get('/', getProfile);

// PUT /api/profile - Update user profile
router.put('/', validate(updateProfileSchema), updateProfile);

// POST /api/profile/change-password - Change password
router.post('/change-password', validate(changePasswordSchema), changePassword);

export default router;
