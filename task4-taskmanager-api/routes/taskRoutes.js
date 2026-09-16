const express = require('express');
const router = express.Router();
const c = require('../controllers/taskController');

router.get('/', c.getAllTasks);
router.get('/:id', c.getTaskById);
router.post('/', c.createTask);
router.delete('/:id', c.deleteTask);

module.exports = router;