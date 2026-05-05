
import express from 'express';
import {
    createProject,
    getProjects,
    getProject,
    updateProject,
    deleteProject,
    getProjectStats
} from '../controllers/projectController.js';
import {
    createTask,
    updateTask,
    moveTask,
    deleteTask,
    convertTicketToTask
} from '../controllers/projectTaskController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Project Routes
router.route('/')
    .post(protect, authorize('admin', 'manager'), createProject)
    .get(protect, getProjects);

router.route('/:id')
    .get(protect, getProject)
    .put(protect, authorize('admin', 'manager'), updateProject)
    .delete(protect, authorize('admin'), deleteProject);

router.get('/:id/stats', protect, getProjectStats);

// Task Routes
router.post('/:projectId/tasks', protect, createTask);
router.put('/tasks/:id', protect, updateTask);
router.put('/tasks/:id/move', protect, moveTask); // Added move route
router.delete('/tasks/:id', protect, deleteTask);

// Special route for Ticket conversion (matches frontend service)
router.post('/tasks/from-ticket', protect, convertTicketToTask);

export default router;
