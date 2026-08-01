const express = require('express');
const router = express.Router();
const workspaceController = require('../controllers/workspaceController');
const { authenticateUser, requireAdmin } = require('../middleware/authMiddleware');

router.get('/', workspaceController.getWorkspaces);
router.get('/:id/availability', workspaceController.getAvailability);
router.get('/:id', workspaceController.getWorkspaceById);
router.post('/', authenticateUser, requireAdmin, workspaceController.createWorkspace);
router.put('/:id', authenticateUser, requireAdmin, workspaceController.updateWorkspace);
router.delete('/:id', authenticateUser, requireAdmin, workspaceController.deleteWorkspace);

module.exports = router;
