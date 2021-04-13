
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