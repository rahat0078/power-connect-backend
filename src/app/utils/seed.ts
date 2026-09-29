import bcrypt from "bcryptjs";
import config from "../config";
import { prisma } from "../lib/prisma";
import { Role } from "../../generated/prisma/enums";

export const seedAdmin = async () => {
  try {
    const isSeedAdminExist = await prisma.user.findUnique({
      where: {
        email: config.seed_admin_email,
      },
    });

    if (isSeedAdminExist) {
      console.log("seed Admin Already Exists! ✅");
      return;
    }

    const name = config.seed_admin_name;
    const email = config.seed_admin_email;
    const password = config.seed_admin_password;

    if (!name || !email || !password) {
      throw new Error(
        "seed Admin Name, Email, Password Missing In Env File!!!",
      );
    }

    const hashedPassword = await bcrypt.hash(
      password,
      Number(config.bcrypt_salt_rounds),
    );

    const seedAdmin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: Role.ADMIN,
        emailVerified: true,
      },
    });

    console.log("seed Admin Created Successfully! ✅");
    console.log("Admin Email:", seedAdmin.email);
  } catch (error) {
    console.log("Error Seeding seed Admin ❌", error);
  }
};
