require("dotenv").config();
import { Request, Response, NextFunction } from "express";
import { IUser } from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import { uuidRandom, findOne, insertRows } from "../models/dbutils.model";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import ejs from "ejs";
import path from "path";
import sendMail from "../utils/sendMail";
import {
  accessTokenOptions,
  refreshTokenOptions,
  sendToken,
} from "../utils/jwt";
import { redis } from "../utils/redis";
import { encryptPassword, verifyPassword } from "../utils/password";

// register user
interface IRegistrationBody {
  name: string;
  email: string;
  password: string;
}

export const registrationUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body;

      // // check email
      const isEmailExist = await findOne({
        params: {
          table: "muser",
          fields: "email,name,password",
          filters: { email: email },
        },
      });

      // console.log("isEmailExists : ", isEmailExist.length);

      if (isEmailExist.length > 0) {
        return next(new ErrorHandler("Email already exists", 404));
      }

      // cek email
      const muser: IRegistrationBody = { name, email, password };

      const activationToken = createActivationToken(muser);
      const activationCode = activationToken.activationCode;

      const data = { muser: { name: muser.name }, activationCode };
      const html = await ejs.renderFile(
        path.join(__dirname, "../mails/activation-mail.ejs"),
        data
      );

      try {
        await sendMail({
          email: muser.email,
          subject: "Activate your account",
          template: "activation-mail.ejs",
          data,
        });

        res.status(201).json({
          success: true,
          message: `Please check your email: ${muser.email} to activate your account!`,
          activationToken: activationToken.token,
        });
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

interface IActivationToken {
  token: string;
  activationCode: string;
}

export const createActivationToken = (muser: any): IActivationToken => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();

  const token = jwt.sign(
    {
      muser,
      activationCode,
    },
    process.env.ACTIVATION_SECRET as Secret,
    {
      expiresIn: "5m",
    }
  );

  return { token, activationCode };
};

// activate user
interface IActivationRequest {
  activation_token: string;
  activation_code: string;
}

export const activateUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { activation_token, activation_code } =
        req.body as IActivationRequest;

      const newUser: { muser: IUser; activationCode: string } = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET as string
      ) as { muser: IUser; activationCode: string };

      if (newUser.activationCode !== activation_code) {
        return next(new ErrorHandler("Invalid activation code", 400));
      }

      const { name, email, password } = newUser.muser;

      const existUser = await findOne({
        params: {
          table: "muser",
          fields: "email",
          filters: { email: newUser.muser.email },
        },
      });

      if (existUser.length > 0) {
        return next(new ErrorHandler("Email already exist", 400));
      }

      const uuid = await uuidRandom();
      // console.log("uuid ", uuid[0].UUID);

      const pass = await encryptPassword(newUser.muser.password);

      // console.log("pass : ", pass);

      insertRows({
        params: {
          table: "muser",
          fields: {
            id: uuid[0].UUID,
            email: newUser.muser.email,
            name: newUser.muser.name,
            password: pass,
          },
          filters: {},
        },
      });

      // const objects = Object.entries(uuid);
      // console.log(objects);
      // const uuidValue = uuid[0].UUID;
      // console.log("uuidevalue: ", uuidValue);
      // insert new user
      // const user = await userModel.create({
      //   name,
      //   email,
      //   password,
      // });

      res.status(201).json({
        success: true,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// Login user
interface ILoginRequest {
  email: string;
  password: string;
}

export const loginUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body as ILoginRequest;

      if (!email || !password) {
        return next(new ErrorHandler("Please enter email and password", 400));
      }

      // const user = await userModel.findOne({ email }).select("+password");
      const muser = await findOne({
        params: {
          table: "muser",
          fields: "*",
          filters: { email: email },
        },
      });

      if (!muser || muser.length == 0) {
        return next(new ErrorHandler("Invalid email or password", 400));
      }

      const hashedPassword = muser[0].PASSWORD;
      console.log("hashedPassword: ", hashedPassword);

      // verify password
      const isPasswordMatch = await verifyPassword(password, hashedPassword);
      if (!isPasswordMatch) {
        return next(new ErrorHandler("Invalid email or password", 400));
      }

      sendToken(muser, 200, res);

    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);


// logout user
export const logoutUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.cookie("access_token", "", { maxAge: 1 });
      res.cookie("refresh_token", "", { maxAge: 1 });
      
      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);