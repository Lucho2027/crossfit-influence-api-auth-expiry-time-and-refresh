# CrossFit Influence-API

Influence-API has been created as part of my first Full-Stack Capstone Project for Thinkful (https://thinkful.com/). It is built as RESTful API that allows CRUD transactions to the database for the Influence app.

## Prerequisites

Before you continue, ensure you have met the following requirements:

1. Clone this repository to your local machine `git clone CROSSFIT-INFLUENCE-API-URL NEW-PROJECTS/BRANCH-NAME`
   `cd` into the cloned repository
2. Make a fresh start of the git history for this project with `rm -rf .git && git init`
3. Install the node dependencies `npm install`

## Scripts

Start the application `npm start`

Start nodemon for the application `npm run dev`

Run the tests `npm test`

## Technical

The app was built using PostgreSQL, Knex, JWT Authentication, JS and Express framework.

The endpoints that currently have services set up for:

The following will return all of the workouts in the database (see summary for an example of one of the objects this request will yield):

`GET -> /api/workouts/`

The following will return the object with identified with `workout_id` (see summary for an example of the object that this request will yield if the object exists):

`GET -> /api/workouts/:workout_id`

The following will GET an object from the database identified with `workout_id` this object will list out the comments that have been created for the`workout_id` identified on the path below:

`GET -> /api/workouts/:workout_id/comments/`

The following endpoint will POST an object to the database identified with `workout_id` (see summary for an example of the object that the API will expect as input):

`POST -> /api/workouts/:workout_id`

The following will DELETE an object off the database identified with `workout_id` and the comments that have a relationship with this workout:

`DELETE -> /api/workouts/:workout_id`

Similar services have been added to be able to post comments and users to the database. In addition, an authentication service has been created.

## Summary

The API will provide and expect information as layed out bellow.

Each object represent a Workout posted with a title (string), content(string), date created ,number of comments and user that has posted the work out. Each object identified with an id, date, department and shift.

```{
   {
        "id": 3,
        "title": "Test Leg",
        "content": "100 lunges\n100000 miles",
        "date_created": "2020-03-26T13:19:04.963Z",
        "number_of_comments": 1,
        "author": {
            "id": 2,
            "user_name": "Test",
            "full_name": "Test",
            "nickname": "TestAccount",
            "date_created": "2020-03-26T02:19:58.196Z",
            "date_modified": null
        }
    }
}
```
