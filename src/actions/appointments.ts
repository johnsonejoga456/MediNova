"use server";

import { auth } from "@/auth";
import prisma from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import type { AppointmentStatus, AppointmentType } from "@prisma/client";

// Permission check helper
async function checkPermissions(requireStaff = false, allowPatient = false, allowDoctor = false) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (requireStaff && !["ADMIN", "RECEPTIONIST", "NURSE"].includes(session.user.role)) {
    throw new Error("Insufficient permissions");
  }

  if (!requireStaff && !allowPatient && !allowDoctor) {
    // If no specific permission specified, allow staff only
    if (!["ADMIN", "RECEPTIONIST", "NURSE", "DOCTOR"].includes(session.user.role)) {
      throw new Error("Insufficient permissions");
    }
  }

  return session;
}

// Get all appointments with filters
export async function getAppointments(params?: {
  doctorId?: string;
  patientId?: string;
  status?: AppointmentStatus;
  startDate?: Date;
  endDate?: Date;
}) {
  const session = await checkPermissions();

  const where: any = {};

  // Role-based filtering
  if (session.user.role === "PATIENT") {
    // Patients see only their own appointments
    const patient = await prisma.patient.findUnique({
      where: { userId: session.user.id },
    });
    if (!patient) throw new Error("Patient profile not found");
    where.patientId = patient.id;
  } else if (session.user.role === "DOCTOR") {
    // Doctors see only their own appointments
    const doctor = await prisma.doctor.findUnique({
      where: { userId: session.user.id },
    });
    if (!doctor) throw new Error("Doctor profile not found");
    where.doctorId = doctor.id;
  }

  // Apply filters
  if (params?.doctorId) where.doctorId = params.doctorId;
  if (params?.patientId) where.patientId = params.patientId;
  if (params?.status) where.status = params.status;

  // Date range filter
  if (params?.startDate || params?.endDate) {
    where.appointmentDate = {};
    if (params.startDate) where.appointmentDate.gte = params.startDate;
    if (params.endDate) where.appointmentDate.lte = params.endDate;
  }

  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      patient: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phoneNumber: true,
            },
          },
        },
      },
      doctor: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: {
      appointmentDate: "asc",
    },
  });

  return appointments;
}

// Get single appointment by ID
export async function getAppointmentById(id: string) {
  specialization: true,
        },
      },
    },
  });

if (!appointment) {
  throw new Error("Appointment not found");
}

// Permission check: patients can only view their own
if (session.user.role === "PATIENT") {
  const patient = await prisma.patient.findUnique({
    where: { userId: session.user.id },
  });
  if (appointment.patientId !== patient?.id) {
    throw new Error("Unauthorized");
  }
}

// Doctors can only view their own
if (session.user.role === "DOCTOR") {
  const doctor = await prisma.doctor.findUnique({
    where: { userId: session.user.id },
  });
  if (appointment.doctorId !== doctor?.id) {
    throw new Error("Unauthorized");
  }
}

return appointment;
}

// Get doctor's availability for a specific date
export async function getDoctorAvailability(doctorId: string, date: Date) {
  await checkPermissions();

  // Business hours: 8 AM to 6 PM
  const startHour = 8;
  const endHour = 18;
  const slotDuration = 30; // minutes

  // Get existing appointments for this doctor on this date
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const existingAppointments = await prisma.appointment.findMany({
    where: {
      doctorId,
      appointmentDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: {
        not: "CANCELLED",
      },
    },
    orderBy: {
      appointmentDate: "asc",
    },
  });

  // Generate all possible time slots
  const slots: { time: string; available: boolean; date: Date }[] = [];
  const selectedDate = new Date(date);

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += slotDuration) {
      const slotTime = new Date(selectedDate);
      slotTime.setHours(hour, minute, 0, 0);

      const timeString = slotTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      // Check if this slot conflicts with existing appointments
      const isBooked = existingAppointments.some((apt) => {
        const aptStart = new Date(apt.appointmentDate);
        const aptEnd = new Date(aptStart.getTime() + apt.duration * 60000);
        const slotEnd = new Date(slotTime.getTime() + slotDuration * 60000);

        // Check for overlap
        return slotTime < aptEnd && slotEnd > aptStart;
      });

      slots.push({
        time: timeString,
        available: !isBooked,
        date: slotTime,
      });
    }
  }

  return slots;
}

// Create new appointment
export async function createAppointment(data: {
  patientId: string;
  doctorId: string;
  appointmentDate: Date;
  duration: number;
  type: AppointmentType;
  reason?: string;
  notes?: string;
}) {
  await checkPermissions(true); // Staff only

  try {
    // Validate minimum advance booking (1 hour)
    const now = new Date();
    const minBookingTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now

    if (new Date(data.appointmentDate) < minBookingTime) {
      return { error: "Appointments must be booked at least 1 hour in advance" };
    }

    // Validate business hours (8 AM - 6 PM)
    const aptHour = new Date(data.appointmentDate).getHours();
    if (aptHour < 8 || aptHour >= 18) {
      return { error: "Appointments must be between 8 AM and 6 PM" };
    }

    // Check for conflicts
    const aptStart = new Date(data.appointmentDate);
    const aptEnd = new Date(aptStart.getTime() + data.duration * 60000);

    const conflicts = await prisma.appointment.findMany({
      where: {
        doctorId: data.doctorId,
        status: {
          not: "CANCELLED",
        },
        appointmentDate: {
          gte: new Date(aptStart.getTime() - data.duration * 60000),
          lte: aptEnd,
        },
      },
    });

    if (conflicts.length > 0) {
      return { error: "This time slot is not available" };
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        patientId: data.patientId,
        doctorId: data.doctorId,
        appointmentDate: data.appointmentDate,
        duration: data.duration,
        type: data.type,
        reason: data.reason,
        notes: data.notes,
        status: "SCHEDULED",
      },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
        doctor: {
          include: {
            user: true,
          },
        },
      },
    });

    revalidatePath("/dashboard/appointments");

    return { success: true, appointment };
  } catch (error: any) {
    console.error("Error creating appointment:", error);
    return { error: "Failed to create appointment" };
  }
}

// Update appointment
export async function updateAppointment(
  id: string,
  data: {
    appointmentDate?: Date;
    duration?: number;
    type?: AppointmentType;
    reason?: string;
    notes?: string;
  }
) {
  await checkPermissions(true); // Staff only

  try {
    const existing = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!existing) {
      return { error: "Appointment not found" };
    }

    if (existing.status === "COMPLETED" || existing.status === "CANCELLED") {
      return { error: "Cannot update completed or cancelled appointments" };
    }

    // If changing date/time, check for conflicts
    if (data.appointmentDate) {
      const newAptStart = new Date(data.appointmentDate);
      const duration = data.duration || existing.duration;
      const newAptEnd = new Date(newAptStart.getTime() + duration * 60000);

      const conflicts = await prisma.appointment.findMany({
        where: {
          doctorId: existing.doctorId,
          id: { not: id },
          status: { not: "CANCELLED" },
          appointmentDate: {
            gte: new Date(newAptStart.getTime() - duration * 60000),
            lte: newAptEnd,
          },
        },
      });

      if (conflicts.length > 0) {
        return { error: "This time slot is not available" };
      }
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data,
    });

    revalidatePath("/dashboard/appointments");
    revalidatePath(`/dashboard/appointments/${id}`);

    return { success: true, appointment: updated };
  } catch (error: any) {
    console.error("Error updating appointment:", error);
    return { error: "Failed to update appointment" };
  }
}

// Update appointment status
export async function updateAppointmentStatus(id: string, status: AppointmentStatus) {
  const session = await checkPermissions();

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      return { error: "Appointment not found" };
    }

    // Doctors can only update their own appointments
    if (session.user.role === "DOCTOR") {
      const doctor = await prisma.doctor.findUnique({
        where: { userId: session.user.id },
      });
      if (appointment.doctorId !== doctor?.id) {
        return { error: "Unauthorized" };
      }
    }

    await prisma.appointment.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/dashboard/appointments");
    revalidatePath(`/dashboard/appointments/${id}`);

    return { success: true };
  } catch (error: any) {
    console.error("Error updating status:", error);
    return { error: "Failed to update status" };
  }
}

// Cancel appointment
export async function cancelAppointment(id: string, reason?: string) {
  const session = await checkPermissions();

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      return { error: "Appointment not found" };
    }

    // Patients can cancel their own appointments (with time restriction)
    if (session.user.role === "PATIENT") {
      const patient = await prisma.patient.findUnique({
        where: { userId: session.user.id },
      });

      if (appointment.patientId !== patient?.id) {
        return { error: "Unauthorized" };
      }

      // Check 2-hour cancellation policy
      const now = new Date();
      const twoHoursBeforeApt = new Date(
        new Date(appointment.appointmentDate).getTime() - 2 * 60 * 60 * 1000
      );

      if (now > twoHoursBeforeApt) {
        return { error: "Cannot cancel appointments less than 2 hours before scheduled time" };
      }
    }

    await prisma.appointment.update({
      where: { id },
      data: {
        status: "CANCELLED",
        notes: reason ? `Cancelled: ${reason}` : appointment.notes,
      },
    });

    revalidatePath("/dashboard/appointments");
    revalidatePath(`/dashboard/appointments/${id}`);

    return { success: true };
  } catch (error: any) {
    console.error("Error cancelling appointment:", error);
    return { error: "Failed to cancel appointment" };
  }
}

// Get appointments by doctor
export async function getAppointmentsByDoctor(doctorId: string, date?: Date) {
  await checkPermissions();

  const where: any = { doctorId };

  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    where.appointmentDate = {
      gte: startOfDay,
      lte: endOfDay,
    };
  }

  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      patient: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: {
      appointmentDate: "asc",
    },
  });

  return appointments;
}

// Get appointments by patient
export async function getAppointmentsByPatient(patientId: string) {
  const session = await checkPermissions();

  // Only allow patients to see their own or staff to see any
  if (session.user.role === "PATIENT") {
    const patient = await prisma.patient.findUnique({
      where: { userId: session.user.id },
    });
    if (patient?.id !== patientId) {
      throw new Error("Unauthorized");
    }
  }

  const appointments = await prisma.appointment.findMany({
    where: { patientId },
    include: {
      doctor: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
    orderBy: {
      appointmentDate: "desc",
    },
  });

  return appointments;
}
