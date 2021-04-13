import mongoose from "mongoose";
const { MONGO_URI } = process.env;

export default function createMongooseConnnection() {
  mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    autoIndex: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });
  const { connection } = mongoose;

  connection.on("error", console.error.bind(console, "connection error:"));
  connection.once("open", function () {
    console.log("database connection established successfully");
  });

  return connection;
}
