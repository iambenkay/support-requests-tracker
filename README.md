
# Fictional support request tracker
## SETUP
### Install MongoDB database locally
Visit [MongoDB](https://www.mongodb.com/try/download/community) to install a community version of the database.

### Clone this repository
clone this repository from Github to your computer

### Setup your environment
```sh
cp .env.example .env
```
then fill out the values  in the `.env` file or use this sample
```sh
MONGO_URI=mongodb://localhost/fliqpay
PORT=9003
JWT_SECRET=92966897e6f614513c827d3e7fe434
```
### Update the scripts
Update the script `scripts/flush_db.js` to point to your database name as used in the env variable `MONGO_URI`
### Install dependencies
```sh
npm i
```
### Run the app in watch mode
```sh
npm run watch
```
### Seed the database
```sh
node scripts/seed.js <PORT OF SERVER>
```
### Run tests
Kill the server you started above and run tests.
```sh
npm test
```

## DESIGN
This service is used to efficiently track tickets created by customers. Support agents are expected to reply to these tickets when the customer is satisfied, it is resolved by the customer. Since it was not specified explicitly, I am assuming that support agents are not authorized to resolve tickets. I am also assuming that customers have no reason to want to view other customers' support tickets or reply to them. They only have access to their own.

### ROLES
There are three roles in this service:
1. ADMIN
2. SUPPORT_AGENT
3. CUSTOMER

Customers can create and view their tickets. they can reply to their tickets if and only if a support agent has replied at least once.

Support agents can reply to tickets and can generate reports in CSV for tickets resolved within the last month. The report will contain the following fields:
- ticketId
- subject
- body
- status
- resolvedAt
- createdAt

I did not implement any admin specific functionality because I think it is beyond the scope of the exercise. However while reviewing the source you will definitely notice how trivial it is to implement.

### ENTITIES
There are only 3 entities in this service:
1. Reply
2. User
3. Ticket

A `Ticket` is related to a `User` through a foreign key named `author` (ObjectId). This is used to depict what user created the ticket. Only Customers can create tickets.  

A `Reply` is related to a `Ticket` through a foreign key named `ticketId` (ObjectId). This is used to depict what ticket this reply was added to.  

Tickets have a hex encoded `ObjectId` from MongoDB and also a uniquely stored `ticketId` (integer) which is more memorable and is hence used to retrieve ticket information.

## CODE ARCHITECTURE
### GENERAL
It's a controller based architecture that uses custom decorators to define metadata on each controller method and register them to the express global router. 
- `@Authorized` decorator ensures that users are authorized to access the controller they decorate.
- `@{http method}` decorators define the route and http method a controller is meant to handle. e.g: `@POST("/login")`. It is responsible for handling errors thrown by controllers and also relaying their output to the response object.
- `@Paginated` decorator processes the query params and pulls out params that represent paging configurations and makes that available to the controller.

### FILE STRUCTURE
#### `src/@decorators/` 
contains decorators that define the behavior of controller methods they decorate. Reason for using the decorator pattern is that they eliminate the need to explicitly configure the routes which would normally require an additional directory to store route configurations like below:
```ts
/* filename: src/controllers/users.ts */

class UserController {
    async getUsers(req, res){
        // controller logic goes here
    }
}

/* filename: src/routes/users.ts */

import UserController from "src/controllers/users";

const userController = new UserController();

router.get("/users", userController.getUsers)
```
decorators are clearly cleaner, easier to understand and constitute lesser code:
```js
class UserController {
    @GET("users")
    async getUsers({}: ControllerData){
        // controller logic goes here
    }
}
```
#### `src/@types/` 
contains type definitions for the entire project.
#### `src/config/` 
contains project based configurations. Things like database configs, security configs, etc. go in here.
#### `src/controllers/` 
contains controllers that execute business logic.
#### `src/models/` 
contains mongoose model definitions
#### `src/tests/` 
contains tests. Jest and supertest were used to write tests.
#### `src/utils/` 
contains utilities that are used project wide.
#### `src/index.ts` 
serves as the entry point of the application.
#### `src/loader.ts` 
helps initialize controller decorators.
#### `src/server.ts` 
responsible for server based configurations.

### DEPENDENCIES
All dependencies used in this project are freely available at npmjs.com  
They are located under the dependencies section in `package.json`

## REST API REFERENCE
NB: The header `Content-Type` should be `application/json` unless specified otherwise.
### LOGIN
```
POST /api/v1/login

{
    "username": "kayode",
    "pin": "0000"
}

Response
{
    "error": false,
    "message": "User was created successfully",
    "data": {
        "_id": "6074ce017949c4317ee9e2bc",
        "username": "benjamin",
        "role": "SUPPORT_AGENT",
        "createdAt": "2021-04-12T22:47:29.673Z",
        "updatedAt": "2021-04-12T22:47:29.673Z",
        "__v": 0
    },
    "token": "<token>"
}
```
### CREATE TICKET
```
POST /api/v1/tickets
Authorization: Bearer

{
    "subject": "Issue related to logging in",
    "body": "I have been unable to login for the past two weeks. It keeps returning the error 'username does not exist'. Please fix this"
}

Response
{
    "error": false,
    "message": "Ticket was created successfully",
    "data": {
        "status": "UNATTENDED",
        "_id": "6074fa67a59f1b34511af28d",
        "subject": "Issue related to logging in",
        "body": "I have been unable to login for the past two weeks. It keeps returning the error 'username does not exist'. Please fix this",
        "ticketId": 5,
        "author": "6074ce017949c4317ee9e2bd",
        "createdAt": "2021-04-13T01:56:55.986Z",
        "updatedAt": "2021-04-13T01:56:55.986Z",
        "__v": 0
    }
}
```
### GET TICKETS
```
GET /api/v1/tickets
Authorization: Bearer

Response
{
    "error": false,
    "message": "Tickets retrieved successfully",
    "data": [
        {
            "status": "RESOLVED",
            "_id": "6074fa5ca59f1b34511af289",
            "subject": "Issue related to logging in",
            "body": "I have been unable to login for the past two weeks. It keeps returning the error 'username does not exist'. Please fix this",
            "ticketId": 1,
            "author": "6074ce017949c4317ee9e2bd",
            "createdAt": "2021-04-13T01:56:44.234Z",
            "updatedAt": "2021-04-13T02:00:15.952Z",
            "__v": 0,
            "resolvedAt": "2021-04-13T02:00:15.949Z"
        },
        {
            "status": "UNATTENDED",
            "_id": "6074fa62a59f1b34511af28a",
            "subject": "Issue related to logging in",
            "body": "I have been unable to login for the past two weeks. It keeps returning the error 'username does not exist'. Please fix this",
            "ticketId": 2,
            "author": "6074ce017949c4317ee9e2bd",
            "createdAt": "2021-04-13T01:56:50.430Z",
            "updatedAt": "2021-04-13T01:56:50.430Z",
            "__v": 0
        }
    ]
}
```
### GET TICKET BY TICKET ID
```
GET /api/v1/tickets/:ticketId
Authorization: Bearer

Response
{
    "error": false,
    "message": "Ticket retrieved successfully",
    "data": {
        "status": "RESOLVED",
        "_id": "6074fa5ca59f1b34511af289",
        "subject": "Issue related to logging in",
        "body": "I have been unable to login for the past two weeks. It keeps returning the error 'username does not exist'. Please fix this",
        "ticketId": 1,
        "author": "6074ce017949c4317ee9e2bd",
        "createdAt": "2021-04-13T01:56:44.234Z",
        "updatedAt": "2021-04-13T02:00:15.952Z",
        "__v": 0,
        "resolvedAt": "2021-04-13T02:00:15.949Z"
    }
}
```
### UPDATE TICKET BY TICKET ID
```
PUT /api/v1/tickets/:ticketId
Authorization: Bearer

{
    "status": "RESOLVED"
}

Response
{
    "error": false,
    "message": "Ticket updated successfully",
    "data": null
}
```
### GENERATE RESOLVED TICKETS REPORT
```
GET /api/v1/tickets/resolved-report
Authorization: Bearer

Response
---- CSV ENCODED STRING ----
```
### CREATE TICKET REPLY
```
POST /api/v1/tickets/:id/replies
Authorization: Bearer

{
    "body": "That actually worked. Greatttt!! Thanks Customer Service"
}

Response
{
    "error": false,
    "message": "Reply was created successfully",
    "data": {
        "_id": "6074faf873e20b3458ceb2ec",
        "body": "That actually worked. Greatttt!! Thanks Customer Service",
        "author": "6074ce017949c4317ee9e2bd",
        "ticketId": "6074fa5ca59f1b34511af289",
        "createdAt": "2021-04-13T01:59:20.044Z",
        "updatedAt": "2021-04-13T01:59:20.044Z",
        "__v": 0
    }
}
```
### GET TICKET REPLIES
```
GET /api/v1/tickets/:id/replies
Authorization: Bearer

Response
{
    "error": false,
    "message": "Replies retrieved successfully",
    "data": [
        {
            "_id": "6074fa8ba59f1b34511af28e",
            "body": "Hello! can you describe your issue more clearly?",
            "author": "6074ce017949c4317ee9e2bc",
            "ticketId": "6074fa5ca59f1b34511af289",
            "createdAt": "2021-04-13T01:57:31.027Z",
            "updatedAt": "2021-04-13T01:57:31.027Z",
            "__v": 0
        },
        {
            "_id": "6074faafa59f1b34511af28f",
            "body": "Yes! I have been stuck on the login screen for a while. It shows me a red indicator and closes the tab",
            "author": "6074ce017949c4317ee9e2bd",
            "ticketId": "6074fa5ca59f1b34511af289",
            "createdAt": "2021-04-13T01:58:07.731Z",
            "updatedAt": "2021-04-13T01:58:07.731Z",
            "__v": 0
        },
        {
            "_id": "6074fae173e20b3458ceb2eb",
            "body": "can you try logging into the vendor console?",
            "author": "6074ce017949c4317ee9e2bc",
            "ticketId": "6074fa5ca59f1b34511af289",
            "createdAt": "2021-04-13T01:58:57.688Z",
            "updatedAt": "2021-04-13T01:58:57.688Z",
            "__v": 0
        },
        {
            "_id": "6074faf873e20b3458ceb2ec",
            "body": "That actually worked. Greatttt!! Thanks Customer Service",
            "author": "6074ce017949c4317ee9e2bd",
            "ticketId": "6074fa5ca59f1b34511af289",
            "createdAt": "2021-04-13T01:59:20.044Z",
            "updatedAt": "2021-04-13T01:59:20.044Z",
            "__v": 0
        }
    ]
}
```