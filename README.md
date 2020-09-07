# Team "in debt" Final Project

## Brief Note
This is a group project I worked on for CS 484 Secure Web App Development. Unfortunately, we were unable to get it to the point that we had hoped to because COVID-19 significantly disrupted our development.

## Project Description

Our project is a slightly morbid survey app.

Users sign up to answer questions along the lines of, "How much would someone have to pay you to convince you to do _x_?"
Each question is backed up by some statistic along the lines of, "_z_ percent of attempts at _x_ ends in death."

From this, after the user answers a question, we can report back how much monetary value each user places on their own life and information about other people's responses to that question. Users can also retrieve information about their own answers.

## Authors

| Member | Web dev level | Specialization |
| --- | --- | --- |
Adam | web programming novice | |
Uzair | web programming novice | |
Jessica | took it 202, made a handful of <1000 line web development mini-projects | I'd like to make the page responsive & a PWA. |

## Full To-do list:
* working session management 
* calculate "cost of life" related to simple survey answers (ie, overall) 
* 404 error page 
* calculate "cost of life" related to life expectancy (ie, per year) 
* answers/results pages include pretty data visualizations (d3.js)
* store history to updated answers
* pass 100% of all tests



## Deliverables for checkpoint 2

* working registration  
* working session management 
* static versions of all pages (logged out, question, answer, question list, answer list)  
* calculate "cost of life" related to simple survey answers (ie, overall) 
* implement some form of CRUD data manipulation 
* store the data in a backing store outside of the web app code itself (e.g. mongodb) 


## Deliverables for checkpoint 4

* pass 80% of all tests 
* 404 error page 
* passwords are not stored in plaintext 
* calculate "cost of life" related to life expectancy (ie, per year) 
* answers/results pages include pretty data visualizations 

## Deliverables for Checkpoint 5 (Final) (Updated)

* Pass 100% of all updated tests
* store history to updated answers
* answers/results pages include pretty data visualizations (d3.js)

## Tests in test.js for Checkpoint 5

* `questions list`
* `answers-list`
* `question`
* `next`
* `answer`


## Installation

* Install Docker Toolbox on Windows <https://docs.docker.com/toolbox/toolbox_install_windows/>

* Install Docker Toolbox on Mac <https://docs.docker.com/toolbox/toolbox_install_mac/>

## Testing
* Run `npm install` before starting the application.
* Run `npm test` to run the tests.

## Run server locally
In docker shell, run `docker-compose up`

## Run server on Google Cloud
1. Create a Compute Engine VM instance
2. Connect to this instance using SSH
3. Run `sudo -s` to go to root
4. Install Docker to the VM using the cmd `sudo curl -sSL https://get.docker.com/ | sh`
5. Install git to the VM using the cmd `sudo apt-get install git`
6. Clone this repository
7. Navigate to this repository
8. Login to docker.pkg.github.com
9. Run `docker pull docker.pkg.github.com/ckanich-classrooms/final-project-in-debt/webapp:0.10`
10. Run docker run --rm \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v "$PWD:$PWD" \
    -w="$PWD" \
    docker/compose:1.24.0 up
11. Access website from external IP of Compute Engine (as of right now the s in https needs to be removed)
