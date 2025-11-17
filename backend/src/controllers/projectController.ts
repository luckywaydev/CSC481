/**
 * ไฟล์: projectController.ts
 *
 * คำอธิบาย:
 * Controller สำหรับจัดการ Projects endpoints
 * - POST /projects - สร้าง project ใหม่
 * - GET /projects - ดึงรายการ projects
 * - GET /projects/:id - ดึง project detail
 * - PATCH /projects/:id - แก้ไข project
 * - DELETE /projects/:id - ลบ project
 *
 * Author: Backend Team
 * Created: 2024-11-17
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  toggleArchiveProject,
} from '../services/projectService';

/**
 * POST /api/v1/projects
 * สร้าง project ใหม่
 */
export async function createProjectController(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
      return;
    }

    const { name, description } = req.body;

    // Validate input
    if (!name) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Project name is required',
        },
      });
      return;
    }

    // Create project
    const project = await createProject(req.user.userId, {
      name,
      description,
    });

    res.status(201).json({
      message: 'Project created successfully',
      data: {
        project,
      },
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create project',
      },
    });
  }
}

/**
 * GET /api/v1/projects
 * ดึงรายการ projects
 */
export async function getProjectsController(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
      return;
    }

    // Get query parameters
    const search = req.query.search as string | undefined;
    const isArchived = req.query.isArchived === 'true';
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;

    // Get projects
    const projects = await getProjects(req.user.userId, {
      search,
      isArchived,
      limit,
      offset,
    });

    res.json({
      message: 'Projects retrieved successfully',
      data: {
        projects,
        count: projects.length,
      },
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get projects',
      },
    });
  }
}

/**
 * GET /api/v1/projects/:id
 * ดึง project detail
 */
export async function getProjectByIdController(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
      return;
    }

    const { id } = req.params;

    // Get project
    const project = await getProjectById(id, req.user.userId);

    if (!project) {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Project not found',
        },
      });
      return;
    }

    // แปลง BigInt เป็น Number ใน audioFiles
    const projectWithFiles = project as any;
    const projectResponse = {
      ...projectWithFiles,
      audioFiles: projectWithFiles.audioFiles?.map((file: any) => ({
        ...file,
        fileSizeBytes: Number(file.fileSizeBytes),
        durationSeconds: file.durationSeconds ? Number(file.durationSeconds) : null,
      })),
    };

    res.json({
      message: 'Project retrieved successfully',
      data: {
        project: projectResponse,
      },
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get project',
      },
    });
  }
}

/**
 * PATCH /api/v1/projects/:id
 * แก้ไข project
 */
export async function updateProjectController(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
      return;
    }

    const { id } = req.params;
    const { name, description } = req.body;

    // Update project
    const project = await updateProject(id, req.user.userId, {
      name,
      description,
    });

    res.json({
      message: 'Project updated successfully',
      data: {
        project,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Project not found') {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Project not found',
        },
      });
      return;
    }

    console.error('Update project error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update project',
      },
    });
  }
}

/**
 * DELETE /api/v1/projects/:id
 * ลบ project
 */
export async function deleteProjectController(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
      return;
    }

    const { id } = req.params;

    // Delete project
    await deleteProject(id, req.user.userId);

    res.json({
      message: 'Project deleted successfully',
      data: {
        success: true,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Project not found') {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Project not found',
        },
      });
      return;
    }

    console.error('Delete project error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete project',
      },
    });
  }
}

/**
 * PATCH /api/v1/projects/:id/archive
 * Archive/Unarchive project
 */
export async function toggleArchiveProjectController(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
      return;
    }

    const { id } = req.params;
    const { isArchived } = req.body;

    if (typeof isArchived !== 'boolean') {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'isArchived must be a boolean',
        },
      });
      return;
    }

    // Toggle archive
    const project = await toggleArchiveProject(id, req.user.userId, isArchived);

    res.json({
      message: `Project ${isArchived ? 'archived' : 'unarchived'} successfully`,
      data: {
        project,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Project not found') {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Project not found',
        },
      });
      return;
    }

    console.error('Toggle archive project error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to toggle archive project',
      },
    });
  }
}
