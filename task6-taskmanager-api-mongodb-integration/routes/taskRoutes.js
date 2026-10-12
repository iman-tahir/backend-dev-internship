const express = require('express');

const router = express.Router();

const c = require('../controllers/taskController');

router.get('/', c.getAllTasks);

router.get('/:id', c.getTaskById);

router.post('/', c.createTask);

router.put('/:id', c.updateTask);

router.delete('/:id', c.deleteTask);

module.exports = router;