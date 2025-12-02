import { auth } from "@/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function GET() {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const doctors = await prisma.doctor.findMany({
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
                specialization: "asc",
            },
        });

        return NextResponse.json(doctors);
    } catch (error) {
        console.error("Error fetching doctors:", error);
        return NextResponse.json({ error: "Failed to fetch doctors" }, { status: 500 });
    }
}
