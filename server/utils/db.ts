require("dotenv").config();
import oracledb, { OUT_FORMAT_OBJECT, OUT_FORMAT_ARRAY } from "oracledb";

// database oracle
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_STRING,
};

function connectDB() {
  return new Promise((resolve, reject) => {
    oracledb.outFormat = OUT_FORMAT_OBJECT;
    oracledb.getConnection(dbConfig, (err, connection) => {
      if (err) {
        reject(err);
      } else {
        resolve(connection);
      }
    });
  });
}

export default connectDB;
