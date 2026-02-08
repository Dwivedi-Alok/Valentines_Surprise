import express from "express";
import {
    createTodo,
    getTodos,
    updateTodo,
    deleteTodo,
} from "../services/todo.service.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protectRoute);

router.post("/", async (req, res) => {
    try {
        const todo = await createTodo({ ...req.body, userId: req.user._id });
        res.status(201).json(todo);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

router.get("/", async (req, res) => {
    try {
        const todos = await getTodos(req.user._id);
        res.json(todos);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.put("/:id", async (req, res) => {
    try {
        const todo = await updateTodo(req.params.id, req.user._id, req.body);
        res.json(todo);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const result = await deleteTodo(req.params.id, req.user._id);
        res.json(result);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

export default router;
