const knex = require("knex")
const app = require("../src/app")
const helpers = require("./test-helpers")

describe("Workouts Endpoints", function() {
	let db

	const {
		testUsers,
		testWorkouts,
		testComments
	} = helpers.makeWorkoutsFixtures()

	before("make knex instance", () => {
		db = knex({
			client: "pg",
			connection: process.env.TEST_DB_URL
		})
		app.set("db", db)
	})

	after("disconnect from db", () => db.destroy())

	before("cleanup", () => helpers.cleanTables(db))

	afterEach("cleanup", () => helpers.cleanTables(db))

	describe(`GET /api/workouts`, () => {
		context(`Given no workouts`, () => {
			it(`responds with 200 and an empty list`, () => {
				return supertest(app)
					.get("/api/workouts")
					.expect(200, [])
			})
		})

		context("Given there are workouts in the database", () => {
			beforeEach("insert workouts", () =>
				helpers.seedWorkoutsTables(db, testUsers, testWorkouts, testComments)
			)

			it("responds with 200 and all of the workouts", () => {
				const expectedWorkouts = testWorkouts.map(workout =>
					helpers.makeExpectedWorkout(testUsers, workout, testComments)
				)
				return supertest(app)
					.get("/api/workouts")
					.expect(200, expectedWorkouts)
			})
		})

		context(`Given an XSS attack workout`, () => {
			const testUser = helpers.makeUsersArray()[1]
			const {
				maliciousWorkout,
				expectedWorkout
			} = helpers.makeMaliciousWorkout(testUser)

			beforeEach("insert malicious workout", () => {
				return helpers.seedMaliciousWorkout(db, testUser, maliciousWorkout)
			})

			it("removes XSS attack content", () => {
				return supertest(app)
					.get(`/api/workouts`)
					.expect(200)
					.expect(res => {
						expect(res.body[0].title).to.eql(expectedWorkout.title)
						expect(res.body[0].content).to.eql(expectedWorkout.content)
					})
			})
		})
	})

	describe(`GET /api/workouts/:workout_id`, () => {
		context(`Given no workouts`, () => {
			beforeEach(() => helpers.seedUsers(db, testUsers))

			it(`responds with 404`, () => {
				const workoutId = 123456
				return supertest(app)
					.get(`/api/workouts/${workoutId}`)
					.set("Authorization", helpers.makeAuthHeader(testUsers[0]))
					.expect(404, { error: `Workout doesn't exist` })
			})
		})

		context("Given there are workouts in the database", () => {
			beforeEach("insert workouts", () =>
				helpers.seedWorkoutsTables(db, testUsers, testWorkouts, testComments)
			)

			it("responds with 200 and the specified workout", () => {
				const workoutId = 2
				const expectedWorkout = helpers.makeExpectedWorkout(
					testUsers,
					testWorkouts[workoutId - 1],
					testComments
				)

				return supertest(app)
					.get(`/api/workouts/${workoutId}`)
					.set("Authorization", helpers.makeAuthHeader(testUsers[0]))
					.expect(200, expectedWorkout)
			})
		})

		context(`Given an XSS attack workout`, () => {
			const testUser = helpers.makeUsersArray()[1]
			const {
				maliciousWorkout,
				expectedWorkout
			} = helpers.makeMaliciousWorkout(testUser)

			beforeEach("insert malicious workout", () => {
				return helpers.seedMaliciousWorkout(db, testUser, maliciousWorkout)
			})

			it("removes XSS attack content", () => {
				return supertest(app)
					.get(`/api/workouts/${maliciousWorkout.id}`)
					.set("Authorization", helpers.makeAuthHeader(testUser))
					.expect(200)
					.expect(res => {
						expect(res.body.title).to.eql(expectedWorkout.title)
						expect(res.body.content).to.eql(expectedWorkout.content)
					})
			})
		})
	})

	describe(`GET /api/workouts/:workout_id/comments`, () => {
		context(`Given no workouts`, () => {
			beforeEach(() => helpers.seedUsers(db, testUsers))

			it(`responds with 404`, () => {
				const workoutId = 123456
				return supertest(app)
					.get(`/api/workouts/${workoutId}/comments`)
					.set("Authorization", helpers.makeAuthHeader(testUsers[0]))
					.expect(404, { error: `Workout doesn't exist` })
			})
		})
	})
})
