import { auth } from "@/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function GET() {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const patients = await prisma.patient.findMany({
            where: {
                user: {
                    isActive: true,
                },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                user: {
                    firstName: "asc",
                },
            },
        });

        console.log("Fetched patients:", patients.length); // Debug log
        return NextResponse.json(patients);
    } catch (error) {
        console.error("Error fetching patients:", error);
        return NextResponse.json({ error: "Failed to fetch patients" }, { status: 500 });
    }
}
