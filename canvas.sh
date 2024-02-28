#!/bin/bash

source ./.env
left=$( curl "https://canvas.its.virginia.edu/api/v1/courses?access_token=$CANVAS_TOKEN&per_page=100" --silent | jq '.[].id' | xargs -I {} curl "https://canvas.its.virginia.edu/api/v1/courses/{}/assignments?access_token=$CANVAS_TOKEN&include=submission&bucket=upcoming" --silent | jq '.[] | {name: .name, due_at: .due_at, course_id: .course_id, unlock: .unlock_at, submit3: .submission.submitted_at }' | jq)

right=$(curl "https://canvas.its.virginia.edu/api/v1/courses?access_token=$CANVAS_TOKEN&per_page=1000" --silent | jq '.[].id' | xargs -I {} curl "https://canvas.its.virginia.edu/api/v1/courses/{}/assignments?access_token=$CANVAS_TOKEN&include=submission&bucket=unsubmitted" --silent | jq '.[] | {name: .name, due_at: .due_at, course_id: .course_id, unlock: .unlock_at, submit3: .submission.submitted_at }' | jq)

echo $left $right | jq -s .


# curl "https://canvas.its.virginia.edu/api/v1/courses?access_token=$CANVAS_TOKEN" | jq
# curl "https://canvas.its.virginia.edu/api/v1/users/1209242/courses?access_token=$CANVAS_TOKEN&per_page=1000" --silent | jq .[].course_code
# curl "https://canvas.its.virginia.edu/api/v1/users/self?access_token=$CANVAS_TOKEN" --silent | jq
