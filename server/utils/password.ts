require("dotenv").config();
import * as bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const saltRounds = 10;

async function encryptPassword(password: string): Promise<string> {
  try {
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(password, salt);
    return hash;
  } catch (error) {
    throw error;
  }
}

// Function to verify a password
async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    const match = await bcrypt.compare(plainPassword, hashedPassword);
    return match;
  } catch (error) {
    throw error;
  }
}

// async function SignAccessToken(id: string): Promise<string> {
//   try {
//     const match = await jwt.sign({ id }, process.env.ACCESS_TOKEN || "", {
//       expiresIn: "5m",
//     });
//     console.log("match : ", match);
//     return match;
//   } catch (error) {
//     throw error;
//   }
// }

// async function SignRefreshToken(id: string): Promise<string> {
//   try {
//     const match = await jwt.sign({ id }, process.env.ACCESS_TOKEN || "", {
//       expiresIn: "3d",
//     });
//     return match;
//   } catch (error) {
//     throw error;
//   }
// }

function SignAccessToken(id: string) {
    try {
      const match = jwt.sign({ id }, process.env.ACCESS_TOKEN || "", {
        expiresIn: "5m",
      });
    //   console.log("match : ", match);
      return match;
    } catch (error) {
      throw error;
    }
  }
  
  function SignRefreshToken(id: string) {
    try {
      const match = jwt.sign({ id }, process.env.ACCESS_TOKEN || "", {
        expiresIn: "3d",
      });
      return match;
    } catch (error) {
      throw error;
    }
  }

module.exports = {
  encryptPassword,
  verifyPassword,
  SignAccessToken,
  SignRefreshToken,
};
