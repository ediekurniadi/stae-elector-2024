import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import connectDB from "../utils/db";
// const db = require("../utils/db");

// export const uuidRandom = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const sql = `SELECT RANDOM_UUID() AS UUID FROM DUAL`;
//       const connection = await connectDB();
//       const result = await connection.execute(sql, [], {});
//       // console.log("result.rows : ", result.rows);
//       const arrayObjects = result.rows;
//       // console.log("arrayObjects : ", arrayObjects);
//       // const uuidValue = arrayObjects[0].UUID;
//       // console.log(uuidValue);
//       return arrayObjects;
//     } catch (error: any) {
//       return next(new ErrorHandler(error.message, 400));
//     }
//   }
// );

// export const findOne = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     let connection;
//     let items = "";
//     let objects;
//     const params = req.params;
//     try {
//       console.log(params.filters);
//       objects = Object.entries(params.filters);

//       for (const [key, value] of objects) {
//         items += ` and ${key} = '${value}' `;
//       }

//       const sql =
//         `select ${params.fields} from ${params.table} where rownum = 1 ` +
//         items;

//       connection = await connectDB();
//       // connection = await oracledb.getConnection(dbConfig);
//       // oracledb.outFormat = OUT_FORMAT_OBJECT;

//       const result = await connection.execute(sql, [], {});
//       console.log(sql);
//       // console.log(result.rows);

//       const arrayObjects = result.rows;
//       console.log(arrayObjects);

//       const emailValue = arrayObjects[0].EMAIL;
//       console.log("emailValue");

//       return arrayObjects;
//     } catch (error: any) {
//       return next(new ErrorHandler(error.message, 400));
//     }
//   }
// );

export async function uuidRandom() {
  let connection;
  try {
    const sql = `select random_uuid() AS UUID from dual `;

    connection = await connectDB();

    const result = await connection.execute(sql, [], {});
    // console.log(sql);
    // console.log(result.rows);

    const arrayObjects = result.rows;
    return arrayObjects;
  } catch (error: any) {
    console.log("Error fetching data : ", error);
  } finally {
    try {
    } catch (error: any) {
      console.log("Error closing database connection: ", error);
    }
  }
}

export async function findOne({ params }) {
  let connection;
  let items = "";
  let objects;
  try {
    console.log(params.filters);
    objects = Object.entries(params.filters);

    for (const [key, value] of objects) {
      items += ` and ${key} = '${value}' `;
    }

    const sql =
      `select ${params.fields} from ${params.table} where rownum = 1 ` + items;

    connection = await connectDB();
    // connection = await oracledb.getConnection(dbConfig);
    // oracledb.outFormat = OUT_FORMAT_OBJECT;

    const result = await connection.execute(sql, [], {});
    console.log(sql);
    console.log(result.rows);

    const arrayObjects = result.rows;
    return arrayObjects;
  } catch (error: any) {
    console.log("Error fetching data : ", error);
  } finally {
    try {
    } catch (error: any) {
      console.log("Error closing database connection: ", error);
    }
  }
}

export async function insertRows({ params }) {
  let connection;
  let fields = "";
  let values = "";
  let i = 0;
  // let objects;
  try {
    // console.log(params.filters);
    const objects = Object.entries(params.fields);
    const totalFields = objects.length;

    for (const [key, value] of objects) {
      i = i + 1;

      // jika objec terakhir
      if (i === totalFields) {
        fields += `${key}`;
        values += `'${value}'`;
      } else {
        fields += `${key},`;
        values += `'${value}',`;
      }
    }

    const sql = `insert into ${params.table} (${fields}) values (${values}) `;
    // console.log(sql);

    connection = await connectDB();
    const result = await connection.execute(sql, [], { autoCommit: true });
    // console.log("Rows inserted: " + result.rowsAffected); // 1
    // console.log("ROWID of new row: " + result.lastRowid);
    // console.log(result.rows);

    // const arrayObjects = result.rows;
    // return arrayObjects;
  } catch (error: any) {
    console.log("Error fetching data : ", error);
  } finally {
    try {
    } catch (error: any) {
      console.log("Error closing database connection: ", error);
    }
  }
}

module.exports = { uuidRandom, findOne, insertRows };
