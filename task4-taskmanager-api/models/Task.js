// Placeholder model — stands in for a real Mongoose/Sequelize model.
// Shape documents what a Task looks like; storage is in-memory for the skeleton.
const tasks = [
  { id: 1, title: 'Set up project', status: 'done', userId: 1 },
  { id: 2, title: 'Build routes', status: 'pending', userId: 1 },
];
module.exports = tasks;