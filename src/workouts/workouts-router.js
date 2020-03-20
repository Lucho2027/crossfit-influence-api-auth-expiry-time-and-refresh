const express = require("express");
const WorkoutsService = require("./workouts-service");
const { requireAuth } = require("../middleware/jwt-auth");

const workoutsRouter = express.Router();

workoutsRouter.route("/").get((req, res, next) => {
  WorkoutsService.getAllWorkouts(req.app.get("db"))
    .then(workouts => {
      res.json(workouts.map(WorkoutsService.serializeWorkout));
    })
    .catch(next);
});

workoutsRouter
  .route("/:workout_id")
  .all(requireAuth)
  .all(checkWorkoutExists)
  .get((req, res) => {
    res.json(WorkoutsService.serializeWorkout(res.workout));
  });

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
        res.json(comments.map(WorkoutsService.serializeWorkoutComment));
      })
      .catch(next);
  });

/* async/await syntax for promises */
async function checkWorkoutExists(req, res, next) {
  try {
    const workout = await WorkoutsService.getById(
      req.app.get("db"),
      req.params.workout_id
    );

    if (!workout)
      return res.status(404).json({
        error: `Workout doesn't exist`
      });

    res.workout = workout;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = workoutsRouter;
