const users = require('../models/User');

exports.getAllUsers = (req, res) => res.status(200).json({ success: true, data: users });
exports.getUserById = (req, res) => res.status(200).json({ success: true, message: `Placeholder: get user ${req.params.id}` });
exports.createUser = (req, res) => res.status(201).json({ success: true, message: 'Placeholder: user created', received: req.body });
exports.deleteUser = (req, res) => res.status(200).json({ success: true, message: `Placeholder: delete user ${req.params.id}` });