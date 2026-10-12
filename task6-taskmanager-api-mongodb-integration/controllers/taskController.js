const Task = require('../models/Task');

exports.getAllTasks = async (req, res) => {
  const tasks = await Task.find();

  res.status(200).json({
    success: true,
    data: tasks
  });
};

exports.getTaskById = async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  res.status(200).json({
    success: true,
    data: task
  });
};

exports.createTask = async (req, res) => {
  const task = await Task.create(req.body);

  res.status(201).json({
    success: true,
    data: task
  });
};

exports.updateTask = async (req, res) => {
  const task = await Task.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  res.status(200).json({
    success: true,
    data: task
  });
};

exports.deleteTask = async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully',
    data: task
  });
};