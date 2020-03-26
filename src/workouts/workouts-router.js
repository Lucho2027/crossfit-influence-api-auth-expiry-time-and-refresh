const express = require("express")
const WorkoutsService = require("./workouts-service")
const { requireAuth } = require("../middleware/jwt-auth")
const path = require("path")

const workoutsRouter = express.Router()
const jsonBodyParser = express.json()

workoutsRouter
	.route("/")
	.get((req, res, next) => {
		WorkoutsService.getAllWorkouts(req.app.get("db"))
			.then(workouts => {
				res.json(workouts.map(WorkoutsService.serializeWorkout))
			})
			.catch(next)
	})
	.post(requireAuth, jsonBodyParser, (req, res, next) => {
		const { title, content } = req.body
		const newWorkout = { title, content }

		for (const [key, value] of Object.entries(newWorkout))
			if (value == null)
				return res.status(400).json({
					error: `Missing '${key}' in request body`
				})

		newWorkout.author_id = req.user.id

		WorkoutsService.insertWorkout(req.app.get("db"), newWorkout)
			.then(workout => {
				res
					.status(201)
					.location(path.posix.join(req.originalUrl, `/${workout.id}`))
					.json(WorkoutsService.serializeWorkout(workout))
			})
			.catch(next)
	})

workoutsRouter
	.route("/:workout_id")
	.all(requireAuth)
	.all(checkWorkoutExists)
	.get((req, res) => {
		res.json(WorkoutsService.serializeWorkout(res.workout))
	})
	.delete((req, res) => {
		WorkoutsService.deleteWorkout(
			req.app.get("db"),
			req.params.workout_id
		).then(data => res.send("Ok"))
	})

workoutsRouter
	.route("/:workout_id/comments/")
	.all(requireAuth)
	.all(checkWorkoutExists)
	.get((req, res, next) => {
		WorkoutsService.getCommentsForWorkout(
			req.app.get("db"),
			req.params.workout_id
		)
			.then(comments => {
				res.json(comments.map(WorkoutsService.serializeWorkoutComment))
			})
			.catch(next)
	})

/* async/await syntax for promises */
async function checkWorkoutExists(req, res, next) {
	try {
		const workout = await WorkoutsService.getById(
			req.app.get("db"),
			req.params.workout_id
		)

		if (!workout)
			return res.status(404).json({
				error: `Workout doesn't exist`
			})

		res.workout = workout
		next()
	} catch (error) {
		next(error)
	}
}

module.exports = workoutsRouter
