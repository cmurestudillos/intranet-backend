const Task = require('../models/Task');

async function getTasks(req, res) {
  try {
    const filter = { uid: req.user.uid };
    if (req.query.estado !== undefined) {
      filter.estado = req.query.estado === 'true';
    }
    const tasks = await Task.find(filter).sort({ createdAt: -1 }).lean();
    // Normalizar _id a id para compatibilidad con el frontend
    const normalized = tasks.map(({ _id, ...t }) => ({ ...t, id: _id.toString() }));
    res.json({ tasks: normalized });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener tareas' });
  }
}

async function getTask(req, res) {
  try {
    const task = await Task.findOne({ _id: req.params.id, uid: req.user.uid }).lean();
    if (!task) return res.status(404).json({ message: 'Tarea no encontrada' });
    const { _id, ...rest } = task;
    res.json({ task: { ...rest, id: _id.toString() } });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener tarea' });
  }
}

async function createTask(req, res) {
  const { nombre, horas, prioridad } = req.body;
  try {
    const task = await Task.create({
      nombre,
      horas,
      prioridad,
      uid: req.user.uid,
      fecha: new Date().toLocaleDateString('es-ES'),
      estado: false,
      mesTarea: new Date().getMonth(),
    });
    res.status(201).json({ task: { ...task.toObject(), id: task._id.toString() } });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function updateTask(req, res) {
  const { nombre, horas, prioridad } = req.body;
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, uid: req.user.uid },
      { nombre, horas, prioridad },
      { new: true, runValidators: true }
    ).lean();
    if (!task) return res.status(404).json({ message: 'Tarea no encontrada' });
    const { _id, ...rest } = task;
    res.json({ task: { ...rest, id: _id.toString() } });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function toggleTaskEstado(req, res) {
  try {
    const task = await Task.findOne({ _id: req.params.id, uid: req.user.uid });
    if (!task) return res.status(404).json({ message: 'Tarea no encontrada' });
    task.estado = !task.estado;
    await task.save();
    const obj = task.toObject();
    res.json({ task: { ...obj, id: obj._id.toString() } });
  } catch (error) {
    res.status(500).json({ message: 'Error al cambiar estado' });
  }
}

async function deleteTask(req, res) {
  try {
    const result = await Task.findOneAndDelete({ _id: req.params.id, uid: req.user.uid });
    if (!result) return res.status(404).json({ message: 'Tarea no encontrada' });
    res.json({ message: 'Tarea eliminada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar tarea' });
  }
}

module.exports = { getTasks, getTask, createTask, updateTask, toggleTaskEstado, deleteTask };
