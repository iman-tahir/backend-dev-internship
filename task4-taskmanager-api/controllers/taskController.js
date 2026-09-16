const tasks = require('../models/Task');

exports.getAllTasks = (req, res) => res.status(200).json({ success: true, data: tasks });
exports.getTaskById = (req, res) => res.status(200).json({ success: true, message: `Placeholder: get task ${req.params.id}` });
exports.createTask = (req, res) => res.status(201).json({ success: true, message: 'Placeholder: task created', received: req.body });
exports.deleteTask = (req, res) => res.status(200).json({ success: true, message: `Placeholder: delete task ${req.params.id}` });