require("dotenv").config();
import { Response } from "express";
import { IUser } from "../models/user.model";
import { redis } from "./redis";
import { SignAccessToken, SignRefreshToken } from "./password";

interface ITokenOptions {
  expires: Date;
  maxAge: number;
  httpOnly: boolean;
  sameSite: "lax" | "strict" | "none" | undefined;
  secure?: boolean;
}

// parse enviroment variables to integrates with fallback values
const accessTokenExpire = parseInt(
  process.env.ACCESS_TOKEN_EXPIRE || "300",
  10
);
const refreshTokenExpire = parseInt(
  process.env.REFRESH_TOKEN_EXPIRE || "1200",
  10
);

// options for cookies
export const accessTokenOptions: ITokenOptions = {
  expires: new Date(Date.now() + accessTokenExpire * 60 * 60 * 1000),
  maxAge: accessTokenExpire * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: "none",
  secure: true,
};

export const refreshTokenOptions: ITokenOptions = {
  expires: new Date(Date.now() + refreshTokenExpire * 24 * 60 * 60 * 1000),
  maxAge: refreshTokenExpire * 24 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: "none",
  secure: true,
};

export const sendToken = (muser: IUser, statusCode: number, res: Response) => {
  // const accessToken = muser.SignAccessToken();
  // const refreshToken = muser.SignRefreshToken();

  // console.log("access token : ", muser);
  // console.log("Token ID : ", muser[0].ID);

  const id = muser[0].ID;

  const accessToken = SignAccessToken(id);
  const refreshToken = SignRefreshToken(id);

  // console.log("accessTokenId : ", accessToken);
  // console.log("refreshTOken : ", refreshToken);

  // upload session to redis
  redis.set(id, JSON.stringify(muser) as any);

  res.cookie("access_token", accessToken, accessTokenOptions);
  res.cookie("refresh_token", refreshToken, refreshTokenOptions);

  res.status(statusCode).json({
    success: true,
    muser,
    accessToken,
  });
};
