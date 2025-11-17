/**
 * ไฟล์: projectRoutes.ts
 *
 * คำอธิบาย:
 * Routes สำหรับ Projects endpoints
 * - POST /projects - สร้าง project ใหม่
 * - GET /projects - ดึงรายการ projects
 * - GET /projects/:id - ดึง project detail
 * - PATCH /projects/:id - แก้ไข project
 * - DELETE /projects/:id - ลบ project
 * - PATCH /projects/:id/archive - Archive/Unarchive project
 *
 * Author: Backend Team
 * Created: 2024-11-17
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  createProjectController,
  getProjectsController,
  getProjectByIdController,
  updateProjectController,
  deleteProjectController,
  toggleArchiveProjectController,
} from '../controllers/projectController';

/**
 * สร้าง router instance
 */
const router = Router();

/**
 * POST /api/v1/projects
 * สร้าง project ใหม่ (requires authentication)
 */
router.post('/', authenticate, createProjectController);

/**
 * GET /api/v1/projects
 * ดึงรายการ projects (requires authentication)
 */
router.get('/', authenticate, getProjectsController);

/**
 * GET /api/v1/projects/:id
 * ดึง project detail (requires authentication)
 */
router.get('/:id', authenticate, getProjectByIdController);

/**
 * PATCH /api/v1/projects/:id
 * แก้ไข project (requires authentication)
 */
router.patch('/:id', authenticate, updateProjectController);

/**
 * DELETE /api/v1/projects/:id
 * ลบ project (requires authentication)
 */
router.delete('/:id', authenticate, deleteProjectController);

/**
 * PATCH /api/v1/projects/:id/archive
 * Archive/Unarchive project (requires authentication)
 */
router.patch('/:id/archive', authenticate, toggleArchiveProjectController);

/**
 * Export router
 */
export default router;
