import prisma from "../lib/prisma";
import { Request } from "express";

export const createEventService = async (req: Request) => {
  const user = req.user!;
  const {
    name,
    description,
    category,
    location,
    Pay,
    start_date,
    end_date,
    available_seats,
  } = req.body;

  // Cek hanya ORGANIZER yang boleh buat event
  if (user.role !== "ORGANIZER") {
    throw { status: 403, message: "Only organizer can create event" };
  }

  // Validasi pastikan tanggal start sebelum tanggal end
  if (new Date(start_date) >= new Date(end_date)) {
    throw { status: 400, message: "Start date must be before end date" };
  }

  const newEvent = await prisma.event.create({
    data: {
      name,
      description,
      category,
      location,
      Pay,
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      available_seats,
      organizer_id: user.id, // Relasi ke events pada user
    },
  });

  return newEvent;
};

export const getAllEventsService = async (req: Request) => {
  const { category } = req.query;
  return prisma.event.findMany({
    where: category
      ? { category: { equals: String(category), mode: "insensitive" } }
      : undefined,
    include: {
      ticket_types: true, // Melihat jenis tiket dari event
      reviews: true, // Melihat review terhadap event
    },
  });
};

export const getEventDetailService = async (id: string) => {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      ticket_types: true, // Melihat semua jenis tiket
      reviews: {
        // Melihat review
        include: {
          user: { select: { first_name: true, last_name: true } }, // Termasuk nama reviewer
        },
      },
      organizer: {
        // Informasi penyelenggara event
        select: { first_name: true, last_name: true },
      },
    },
  });

  if (!event) throw { status: 404, message: "Event not found" };
  return event;
};

export const getMyEventsService = async (req: Request) => {
  const organizerId = req.user?.id;

  if (!organizerId) {
    throw { status: 401, message: "Unauthorized" };
  }

  const events = await prisma.event.findMany({
    where: {
      organizer_id: organizerId,
    },
    select: {
      id: true,
      name: true,
      category: true,
      location: true,
      available_seats: true,
      start_date: true,
      end_date: true,
    },
    orderBy: {
      created_at: "desc",
    },
  });

  return events;
};

export const findEventsByTitle = async (query: string) => {
  const keywords = query
    .split(" ")
    .map((word) => word.trim())
    .filter((word) => word.length > 0);

  const events = await prisma.event.findMany({
    where: {
      OR: keywords.flatMap((word) => [
        {
          name: {
            contains: word,
            mode: "insensitive",
          },
        },
        {
          category: {
            contains: word,
            mode: "insensitive",
          },
        },
      ]),
    },
    take: 10,
    orderBy: {
      start_date: "asc",
    },
    select: {
      id: true,
      name: true,
      category: true,
      start_date: true,
      image: true, // URL Cloudinary
      organizer: {
        select: {
          first_name: true,
          last_name: true,
          profile_pict: true, // relative path
        },
      },
      ticket_types: {
        select: {
          price: true,
        },
        orderBy: {
          price: "asc",
        },
        take: 1,
      },
    },
  });

  return events;
};

export const updateEventService = async (req: Request) => {
  const { id } = req.params;
  const { name, start_date, end_date, location } = req.body;
  const user_id = req.user?.id;

  if (!user_id) {
    throw { status: 401, message: "Unauthorized" };
  }

  const event = await prisma.event.findFirst({
    where: {
      id,
      organizer_id: user_id,
    },
  });

  if (!event) {
    throw { status: 404, message: "Event not found" };
  }

  const updated = await prisma.event.update({
    where: { id },
    data: {
      name,
      start_date,
      end_date,
      location,
    },
  });

  return updated;
};

// SHow events
export const ShowEventsService = async (req: Request) => {
  const { category, featured } = req.query;

  const filter: any = {};

  if (category) {
    filter.category = {
      equals: String(category),
      mode: "insensitive",
    };
  }

  if (featured !== undefined) {
    filter.Pay = featured === "true";
  }

  const events = await prisma.event.findMany({
    where: filter,
    orderBy: {
      created_at: "desc",
    },
    select: {
      id: true,
      name: true,
      category: true,
      location: true,
      start_date: true,
      organizer: {
        select: {
          first_name: true,
          last_name: true,
        },
      },
      ticket_types: {
        select: { price: true },
        orderBy: { price: "asc" },
        take: 1,
      },
    },
  });

  return events;
};

// EXplore
export const getExploreEventsService = async (req: Request) => {
  const { category, location } = req.query;

  const filters: any = {};

  if (category) {
    filters.category = {
      equals: String(category),
      mode: "insensitive",
    };
  }

  if (location) {
    filters.location = {
      contains: String(location),
      mode: "insensitive",
    };
  }

  return prisma.event.findMany({
    where: filters,
    orderBy: {
      created_at: "desc",
    },
    include: {
      ticket_types: {
        select: { price: true },
        orderBy: { price: "asc" },
        take: 1,
      },
      organizer: {
        select: {
          first_name: true,
          last_name: true,
          profile_pict: true,
        },
      },
    },
  });
};
