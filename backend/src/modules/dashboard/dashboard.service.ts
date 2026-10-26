import { prisma } from "../../lib/prisma";

const LEAD_STAGES = [
  "NEW",
  "CONTACTED",
  "SITE_VISIT",
  "INTERESTED",
  "NEGOTIATION",
  "BOOKED",
  "LOST",
] as const;

const BOOKING_STATUSES = ["PENDING", "CONFIRMED", "CANCELLED"] as const;

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export async function getDashboard(user: { id: string; role: string }) {
  const isAdmin = user.role === "ADMIN";

  const leadWhere = isAdmin ? {} : { assignedToId: user.id };

  const bookingWhere = isAdmin
    ? {}
    : {
        OR: [{ bookedById: user.id }, { lead: { assignedToId: user.id } }],
      };

  const currentYear = new Date().getFullYear();

  const [
    totalLeads,
    newLeads,
    bookedLeads,
    lostLeads,
    totalProjects,
    totalBuildings,
    confirmedBookings,
    recentLeads,
    recentBookings,
    leadStageCounts,
    bookingStatusCounts,
    monthlyLeads,
  ] = await Promise.all([
    prisma.lead.count({ where: leadWhere }),

    prisma.lead.count({
      where: { ...leadWhere, stage: "NEW" },
    }),

    prisma.lead.count({
      where: { ...leadWhere, stage: "BOOKED" },
    }),

    prisma.lead.count({
      where: { ...leadWhere, stage: "LOST" },
    }),

    prisma.project.count({
      where: { status: "ACTIVE" },
    }),

    prisma.building.count(),

    prisma.booking.count({
      where: { ...bookingWhere, status: "CONFIRMED" },
    }),

    prisma.lead.findMany({
      where: leadWhere,
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        phone: true,
        stage: true,
        updatedAt: true,
        assignedTo: {
          select: { id: true, name: true },
        },
      },
    }),

    prisma.booking.findMany({
      where: bookingWhere,
      orderBy: { bookedAt: "desc" },
      take: 5,
      select: {
        id: true,
        status: true,
        bookedAt: true,
        lead: {
          select: { id: true, name: true },
        },
        building: {
          select: {
            id: true,
            name: true,
            project: {
              select: { id: true, name: true },
            },
          },
        },
      },
    }),

    prisma.lead.groupBy({
      by: ["stage"],
      where: leadWhere,
      _count: { _all: true },
    }),

    prisma.booking.groupBy({
      by: ["status"],
      where: bookingWhere,
      _count: { _all: true },
    }),

    Promise.all(
      MONTHS.map(async (month, index) => {
        const start = new Date(currentYear, index, 1);
        const end = new Date(currentYear, index + 1, 1);

        const count = await prisma.lead.count({
          where: {
            ...leadWhere,
            createdAt: { gte: start, lt: end },
          },
        });

        return { month, count };
      }),
    ),
  ]);

  const leadPipeline = LEAD_STAGES.map((stage) => ({
    stage,
    count:
      leadStageCounts.find((item) => item.stage === stage)?._count._all ?? 0,
  }));

  const bookingStatuses = BOOKING_STATUSES.map((status) => ({
    status,
    count:
      bookingStatusCounts.find((item) => item.status === status)?._count._all ??
      0,
  }));

  let teamPerformance: {
    employeeId: string;
    employeeName: string;
    leadsAssigned: number;
    bookingsCreated: number;
  }[] = [];

  if (isAdmin) {
    const [employees, leadCounts, bookingCounts] = await Promise.all([
      prisma.user.findMany({
        where: { role: "SALES_EMPLOYEE", isActive: true },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),

      prisma.lead.groupBy({
        by: ["assignedToId"],
        where: { assignedToId: { not: null } },
        _count: { _all: true },
      }),

      prisma.booking.groupBy({
        by: ["bookedById"],
        _count: { _all: true },
      }),
    ]);

    teamPerformance = employees.map((employee) => ({
      employeeId: employee.id,
      employeeName: employee.name,
      leadsAssigned:
        leadCounts.find((item) => item.assignedToId === employee.id)?._count
          ._all ?? 0,
      bookingsCreated:
        bookingCounts.find((item) => item.bookedById === employee.id)?._count
          ._all ?? 0,
    }));
  }

  return {
    summary: {
      totalLeads,
      newLeads,
      bookedLeads,
      lostLeads,
      totalProjects,
      totalBuildings,
      confirmedBookings,
    },
    charts: {
      monthlyLeads,
      leadPipeline,
      bookingStatuses,
      teamPerformance,
    },
    recentLeads,
    recentBookings,
  };
}
