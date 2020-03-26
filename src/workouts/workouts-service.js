const xss = require("xss")

const WorkoutsService = {
	getAllWorkouts(db) {
		return db
			.from("influence_workouts AS wod")
			.select(
				"wod.id",
				"wod.title",
				"wod.date_created",
				"wod.content",
				db.raw(`count(DISTINCT comm) AS number_of_comments`),
				db.raw(
					`json_strip_nulls(
            json_build_object(
              'id', usr.id,
              'user_name', usr.user_name,
              'full_name', usr.full_name,
              'nickname', usr.nickname,
              'date_created', usr.date_created,
              'date_modified', usr.date_modified
            )
          ) AS "author"`
				)
			)
			.leftJoin("influence_comments AS comm", "wod.id", "comm.workout_id")
			.leftJoin("influence_users AS usr", "wod.author_id", "usr.id")
			.groupBy("wod.id", "usr.id")
	},

	getById(db, id) {
		return WorkoutsService.getAllWorkouts(db)
			.where("wod.id", id)
			.first()
	},

	getCommentsForWorkout(db, workout_id) {
		return db
			.from("influence_comments AS comm")
			.select(
				"comm.id",
				"comm.text",
				"comm.date_created",
				db.raw(
					`json_strip_nulls(
            row_to_json(
              (SELECT tmp FROM (
                SELECT
                  usr.id,
                  usr.user_name,
                  usr.full_name,
                  usr.nickname,
                  usr.date_created,
                  usr.date_modified
              ) tmp)
            )
          ) AS "user"`
				)
			)
			.where("comm.workout_id", workout_id)
			.leftJoin("influence_users AS usr", "comm.user_id", "usr.id")
			.groupBy("comm.id", "usr.id")
	},
	insertWorkout(db, newWorkout) {
		return db
			.insert(newWorkout)
			.into("influence_workouts")
			.returning("*")
			.then(([workout]) => workout)
			.then(workout => WorkoutsService.getById(db, workout.id))
	},
	deleteWorkout(db, id) {
		return db("influence_workouts")
			.where("id", id)
			.del()
	},

	serializeWorkout(workout) {
		const { author } = workout
		return {
			id: workout.id,
			style: workout.style,
			title: xss(workout.title),
			content: xss(workout.content),
			date_created: new Date(workout.date_created),
			number_of_comments: Number(workout.number_of_comments) || 0,
			author: {
				id: author.id,
				user_name: author.user_name,
				full_name: author.full_name,
				nickname: author.nickname,
				date_created: new Date(author.date_created),
				date_modified: new Date(author.date_modified) || null
			}
		}
	},

	serializeWorkoutComment(comment) {
		const { user } = comment
		return {
			id: comment.id,
			workout_id: comment.workout_id,
			text: xss(comment.text),
			date_created: new Date(comment.date_created),
			user: {
				id: user.id,
				user_name: user.user_name,
				full_name: user.full_name,
				nickname: user.nickname,
				date_created: new Date(user.date_created),
				date_modified: new Date(user.date_modified) || null
			}
		}
	}
}

module.exports = WorkoutsService
