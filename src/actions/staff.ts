"use server";

import { auth } from "@/auth";
import prisma from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

// Permission check helper (Admin only for all staff operations)
async function checkPermissions() {
  const session = await auth();
  
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // @ts-ignore - Check role safely
  if (session.user.role !== "ADMIN") {
    throw new Error("Insufficient permissions - Admin only");
  }

  return session;
}

// Get all staff with search and filter
export async function getStaff(params?: {
  search?: string;
  department?: string;
  role?: string;
}) {
  await checkPermissions();

  const where: any = {
    user: {
      isActive: true,
    },
  };

  // Search by name or email
  if (params?.search) {
    where.OR = [
      {
        user: {
          firstName: {
            contains: params.search,
            mode: "insensitive",
          },
        },
      },
      {
        user: {
          lastName: {
            contains: params.search,
            mode: "insensitive",
          },
        },
      },
      {
        user: {
          email: {
            contains: params.search,
            mode: "insensitive",
          },
        },
      },
      {
        department: {
          contains: params.search,
          mode: "insensitive",
        },
      },
      // Also allow searching by employeeId if it exists in schema
      {
        employeeId: {
          contains: params.search,
          mode: "insensitive",
        },
      },
    ];
  }

  // Filter by department
  if (params?.department) {
    where.department = {
      equals: params.department,
      mode: "insensitive",
    };
  }

  // Filter by role
  if (params?.role) {
    where.user = {
      ...where.user,
      role: params.role,
    };
  }

  const staff = await prisma.staff.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          role: true,
          isActive: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return staff;
}

// Get single staff by ID
export async function getStaffById(id: string) {
  await checkPermissions();

  const staff = await prisma.staff.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!staff) {
    throw new Error("Staff member not found");
  }

  return staff;
}

// Create new staff
export async function createStaff(data: {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: "NURSE" | "RECEPTIONIST";
  department: string;
  position: string;
}) {
  await checkPermissions();

  try {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return { error: "Email already exists" };
    }

    // Generate temporary password
    const tempPassword = `Staff${Math.random().toString(36).slice(-8)}!`;
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // ✅ FIX: Generate a random Employee ID (e.g., EMP-K92L)
    // You can adjust this format to match your hospital's needs
    const employeeId = `EMP-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Create user and staff in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber,
          role: data.role,
        },
      });

      // Create staff profile
      const staff = await tx.staff.create({
        data: {
          userId: user.id,
          employeeId: employeeId, // <--- Added missing field here
          department: data.department,
          position: data.position,
        },
      });

      return { user, staff };
    });

    revalidatePath("/dashboard/staff");

    return { 
      success: true, 
      tempPassword,
      staff: result.staff 
    };
  } catch (error: any) {
    console.error("Error creating staff:", error);
    return { error: "Failed to create staff member" };
  }
}

// Update staff
export async function updateStaff(
  id: string,
  data: {
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    role: "NURSE" | "RECEPTIONIST";
    department: string;
    position: string;
  }
) {
  await checkPermissions();

  try {
    const staff = await prisma.staff.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!staff) {
      return { error: "Staff member not found" };
    }

    // Update user and staff in a transaction
    await prisma.$transaction(async (tx) => {
      // Update user
      await tx.user.update({
        where: { id: staff.userId },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber,
          role: data.role,
        },
      });

      // Update staff
      await tx.staff.update({
        where: { id },
        data: {
          department: data.department,
          position: data.position,
        },
      });
    });

    revalidatePath("/dashboard/staff");
    revalidatePath(`/dashboard/staff/${id}`);

    return { success: true };
  } catch (error: any) {
    console.error("Error updating staff:", error);
    return { error: "Failed to update staff member" };
  }
}

// Delete staff (soft delete)
export async function deleteStaff(id: string) {
  await checkPermissions();

  try {
    const staff = await prisma.staff.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!staff) {
      return { error: "Staff member not found" };
    }

    // Soft delete by setting user as inactive
    await prisma.user.update({
      where: { id: staff.userId },
      data: { isActive: false },
    });

    revalidatePath("/dashboard/staff");

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting staff:", error);
    return { error: "Failed to delete staff member" };
  }
}