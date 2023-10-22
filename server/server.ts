import { app } from "./app";
import connectDB from "./utils/db";
require("dotenv").config();

import { findOne } from "./models/dbutils.model";

app.listen(process.env.PORT, () => {
  console.log(`Server is connected with port ${process.env.PORT}`);
  connectDB();
  // findOne({params : {table:"muser", fields: "*", filters: {email:"ideedi.programmer@gmail.com"}}})
  

});
