const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

function makeUsersArray() {
	return [
		{
			id: 1,
			user_name: "test-user-1",
			full_name: "Test user 1",
			nickname: "TU1",
			password: "password",
			date_created: new Date("2029-01-22T16:28:32.615Z")
		},
		{
			id: 2,
			user_name: "test-user-2",
			full_name: "Test user 2",
			nickname: "TU2",
			password: "password",
			date_created: new Date("2029-01-22T16:28:32.615Z")
		},
		{
			id: 3,
			user_name: "test-user-3",
			full_name: "Test user 3",
			nickname: "TU3",
			password: "password",
			date_created: new Date("2029-01-22T16:28:32.615Z")
		},
		{
			id: 4,
			user_name: "test-user-4",
			full_name: "Test user 4",
			nickname: "TU4",
			password: "password",
			date_created: new Date("2029-01-22T16:28:32.615Z")
		}
	]
}

function makeWorkoutsArray(users) {
	return [
		{
			id: 1,
			title: "First test post!",
			author_id: users[0].id,
			date_created: new Date("2029-01-22T16:28:32.615Z"),
			content:
				"Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?"
		},
		{
			id: 2,
			title: "Second test post!",
			author_id: users[1].id,
			date_created: new Date("2029-01-22T16:28:32.615Z"),
			content:
				"Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?"
		},
		{
			id: 3,
			title: "Third test post!",
			author_id: users[2].id,
			date_created: new Date("2029-01-22T16:28:32.615Z"),
			content:
				"Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?"
		},
		{
			id: 4,
			title: "Fourth test post!",
			author_id: users[3].id,
			date_created: new Date("2029-01-22T16:28:32.615Z"),
			content:
				"Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?"
		}
	]
}

function makeCommentsArray(users, workouts) {
	return [
		{
			id: 1,
			text: "First test comment!",
			workout_id: workouts[0].id,
			user_id: users[0].id,
			date_created: new Date("2029-01-22T16:28:32.615Z")
		},
		{
			id: 2,
			text: "Second test comment!",
			workout_id: workouts[0].id,
			user_id: users[1].id,
			date_created: new Date("2029-01-22T16:28:32.615Z")
		},
		{
			id: 3,
			text: "Third test comment!",
			workout_id: workouts[0].id,
			user_id: users[2].id,
			date_created: new Date("2029-01-22T16:28:32.615Z")
		},
		{
			id: 4,
			text: "Fourth test comment!",
			workout_id: workouts[0].id,
			user_id: users[3].id,
			date_created: new Date("2029-01-22T16:28:32.615Z")
		},
		{
			id: 5,
			text: "Fifth test comment!",
			workout_id: workouts[workouts.length - 1].id,
			user_id: users[0].id,
			date_created: new Date("2029-01-22T16:28:32.615Z")
		},
		{
			id: 6,
			text: "Sixth test comment!",
			workout_id: workouts[workouts.length - 1].id,
			user_id: users[2].id,
			date_created: new Date("2029-01-22T16:28:32.615Z")
		},
		{
			id: 7,
			text: "Seventh test comment!",
			workout_id: workouts[3].id,
			user_id: users[0].id,
			date_created: new Date("2029-01-22T16:28:32.615Z")
		}
	]
}

function makeExpectedWorkout(users, workout, comments = []) {
	const author = users.find(user => user.id === workout.author_id)

	const number_of_comments = comments.filter(
		comment => comment.workout_id === workout.id
	).length

	return {
		id: workout.id,
		title: workout.title,
		content: workout.content,
		date_created: workout.date_created.toISOString(),
		number_of_comments,
		author: {
			id: author.id,
			user_name: author.user_name,
			full_name: author.full_name,
			nickname: author.nickname,
			date_created: author.date_created.toISOString(),
			date_modified: author.date_modified || null
		}
	}
}

function makeExpectedWorkoutComments(users, workoutId, comments) {
	const expectedComments = comments.filter(
		comment => comment.workout_id === workoutId
	)

	return expectedComments.map(comment => {
		const commentUser = users.find(user => user.id === comment.user_id)
		return {
			id: comment.id,
			text: comment.text,
			date_created: comment.date_created.toISOString(),
			user: {
				id: commentUser.id,
				user_name: commentUser.user_name,
				full_name: commentUser.full_name,
				nickname: commentUser.nickname,
				date_created: commentUser.date_created.toISOString(),
				date_modified: commentUser.date_modified || null
			}
		}
	})
}

function makeMaliciousWorkout(user) {
	const maliciousWorkout = {
		id: 911,
		date_created: new Date(),
		title: 'Naughty naughty very naughty <script>alert("xss");</script>',
		author_id: user.id,
		content: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`
	}
	const expectedWorkout = {
		...makeExpectedWorkout([user], maliciousWorkout),
		title:
			'Naughty naughty very naughty &lt;script&gt;alert("xss");&lt;/script&gt;',
		content: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
	}
	return {
		maliciousWorkout,
		expectedWorkout
	}
}

function makeWorkoutsFixtures() {
	const testUsers = makeUsersArray()
	const testWorkouts = makeWorkoutsArray(testUsers)
	const testComments = makeCommentsArray(testUsers, testWorkouts)
	return { testUsers, testWorkouts, testComments }
}

function cleanTables(db) {
	return db.transaction(trx =>
		trx
			.raw(
				`TRUNCATE
        influence_workouts,
        influence_users,
        influence_comments
      `
			)
			.then(() =>
				Promise.all([
					trx.raw(
						`ALTER SEQUENCE influence_workouts_id_seq minvalue 0 START WITH 1`
					),
					trx.raw(
						`ALTER SEQUENCE influence_users_id_seq minvalue 0 START WITH 1`
					),
					trx.raw(
						`ALTER SEQUENCE influence_comments_id_seq minvalue 0 START WITH 1`
					),
					trx.raw(`SELECT setval('influence_workouts_id_seq', 0)`),
					trx.raw(`SELECT setval('influence_users_id_seq', 0)`),
					trx.raw(`SELECT setval('influence_comments_id_seq', 0)`)
				])
			)
	)
}

function seedUsers(db, users) {
	const preppedUsers = users.map(user => ({
		...user,
		password: bcrypt.hashSync(user.password, 1)
	}))
	return db
		.into("influence_users")
		.insert(preppedUsers)
		.then(() =>
			// update the auto sequence to stay in sync
			db.raw(`SELECT setval('influence_users_id_seq', ?)`, [
				users[users.length - 1].id
			])
		)
}

function seedWorkoutsTables(db, users, workouts, comments = []) {
	// use a transaction to group the queries and auto rollback on any failure
	return db.transaction(async trx => {
		await seedUsers(trx, users)
		await trx.into("influence_workouts").insert(workouts)
		// update the auto sequence to match the forced id values
		await trx.raw(`SELECT setval('influence_workouts_id_seq', ?)`, [
			workouts[workouts.length - 1].id
		])
		// only insert comments if there are some, also update the sequence counter
		if (comments.length) {
			await trx.into("influence_comments").insert(comments)
			await trx.raw(`SELECT setval('influence_comments_id_seq', ?)`, [
				comments[comments.length - 1].id
			])
		}
	})
}

function seedMaliciousWorkout(db, user, workout) {
	return seedUsers(db, [user]).then(() =>
		db.into("influence_workouts").insert([workout])
	)
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
	const token = jwt.sign({ user_id: user.id }, secret, {
		subject: user.user_name,
		algorithm: "HS256"
	})
	return `Bearer ${token}`
}

module.exports = {
	makeUsersArray,
	makeWorkoutsArray,
	makeExpectedWorkout,
	makeExpectedWorkoutComments,
	makeMaliciousWorkout,
	makeCommentsArray,

	makeWorkoutsFixtures,
	cleanTables,
	seedWorkoutsTables,
	seedMaliciousWorkout,
	makeAuthHeader,
	seedUsers
}
