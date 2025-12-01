"use server";

import prisma from "@/lib/db/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { Role } from "@prisma/client";

const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.nativeEnum(Role),
});

export async function registerUser(formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as Role;

    const parsed = registerSchema.safeParse({ name, email, password, role });

    if (!parsed.success) {
        return { error: "Invalid data" };
    }

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return { error: "User already exists" };
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [firstName, ...lastNameParts] = name.split(" ");
        const lastName = lastNameParts.join(" ") || "";

        await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role,
                firstName,
                lastName,
            },
        });

        return { success: true };
    } catch (error) {
        console.error("Registration error:", error);
        return { error: "Registration failed" };
    }
}
