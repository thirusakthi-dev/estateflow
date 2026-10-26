import "dotenv/config";
import bcrypt from "bcryptjs";
import {
  BookingStatus,
  LeadStage,
  ProjectStatus,
  UnitStatus,
  UnitType,
  UserRole,
} from "../src/generated/prisma/client";
import { prisma } from "../src/lib/prisma";

const DEMO_SOURCE = "ESTATEFLOW_DEMO_SEED";

function monthsAgo(months: number, day = 12) {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  date.setDate(day);
  date.setHours(10, 0, 0, 0);
  return date;
}

async function main() {
  const password = "Admin@123456";
  const passwordHash = await bcrypt.hash(password, 12);

  // 1. Admin account
  const admin = await prisma.user.upsert({
    where: { email: "admin@estateflow.local" },
    update: {},
    create: {
      name: "EstateFlow Admin",
      email: "admin@estateflow.local",
      passwordHash,
      role: UserRole.ADMIN,
    },
  });

  // 2. Sales employees
  const salesUsers = [];

  for (const [index, name] of [
    "Arun Kumar",
    "Priya Sharma",
    "Karthik Raj",
  ].entries()) {
    const user = await prisma.user.upsert({
      where: { email: `demo.sales${index + 1}@estateflow.local` },
      update: {},
      create: {
        name,
        email: `demo.sales${index + 1}@estateflow.local`,
        passwordHash,
        role: UserRole.SALES_EMPLOYEE,
      },
    });

    salesUsers.push(user);
  }

  // 3. Projects
  const projectInputs = [
    {
      name: "Green Valley Residences",
      city: "Chennai",
      address: "OMR, Chennai, Tamil Nadu",
    },
    {
      name: "Skyline Heights",
      city: "Chennai",
      address: "Porur, Chennai, Tamil Nadu",
    },
    {
      name: "Palm Grove Villas",
      city: "Bengaluru",
      address: "Whitefield, Bengaluru, Karnataka",
    },
  ];

  const projects = [];

  for (const input of projectInputs) {
    const existing = await prisma.project.findFirst({
      where: { name: input.name, city: input.city },
    });

    const project =
      existing ??
      (await prisma.project.create({
        data: {
          ...input,
          status: ProjectStatus.ACTIVE,
          description: `Demo project: ${input.name}`,
        },
      }));

    projects.push(project);
  }

  // 4. Buildings
  const buildingInputs = [
    ["Tower A", "Tower B"],
    ["North Tower", "South Tower"],
    ["Villa Block A", "Villa Block B"],
  ];

  const buildings = [];

  for (let i = 0; i < projects.length; i++) {
    for (const name of buildingInputs[i]) {
      const existing = await prisma.building.findFirst({
        where: { projectId: projects[i].id, name },
      });

      const building =
        existing ??
        (await prisma.building.create({
          data: {
            projectId: projects[i].id,
            name,
            description: `${name} demo building`,
            totalFloors: 12,
          },
        }));

      buildings.push(building);
    }
  }

  // 5. Units
  for (const building of buildings) {
    for (let i = 1; i <= 5; i++) {
      const unitNumber = `D-${String(i).padStart(3, "0")}`;

      await prisma.propertyUnit.upsert({
        where: {
          buildingId_unitNumber: {
            buildingId: building.id,
            unitNumber,
          },
        },
        update: {},
        create: {
          buildingId: building.id,
          unitNumber,
          type: building.name.includes("Villa")
            ? UnitType.VILLA
            : UnitType.APARTMENT,
          price: 4500000 + i * 250000,
          bedrooms: i % 2 === 0 ? 3 : 2,
          bathrooms: 2,
          area: 950 + i * 100,
          areaUnit: "SQ_FT",
          status: UnitStatus.AVAILABLE,
        },
      });
    }
  }

  // 6. Remove only the previous demo leads and their bookings.
  await prisma.booking.deleteMany({
    where: { lead: { source: DEMO_SOURCE } },
  });

  await prisma.lead.deleteMany({
    where: { source: DEMO_SOURCE },
  });

  // 7. Leads distributed across the last 12 months.
  const stageSequence: LeadStage[] = [
    LeadStage.NEW,
    LeadStage.CONTACTED,
    LeadStage.SITE_VISIT,
    LeadStage.INTERESTED,
    LeadStage.NEGOTIATION,
    LeadStage.BOOKED,
    LeadStage.LOST,
  ];

  const names = [
    "Rahul Menon",
    "Divya Krishnan",
    "Sanjay Kumar",
    "Meera Nair",
    "Vikram Reddy",
    "Ananya Rao",
    "Praveen Raj",
    "Sneha Iyer",
    "Arjun Das",
    "Kavya S",
  ];

  const leads = [];

  for (let i = 0; i < 60; i++) {
    const lead = await prisma.lead.create({
      data: {
        name: `${names[i % names.length]} ${Math.floor(i / names.length) + 1}`,
        email: `demo.lead${i + 1}@estateflow.local`,
        phone: `98${String(i).padStart(8, "0")}`,
        source: DEMO_SOURCE,
        stage: stageSequence[i % stageSequence.length],
        assignedToId: salesUsers[i % salesUsers.length].id,
        createdById: admin.id,
        createdAt: monthsAgo(i % 12, (i % 26) + 1),
      },
    });

    leads.push(lead);
  }

  // 8. Bookings with different statuses.
  const bookingStatusSequence: BookingStatus[] = [
    BookingStatus.CONFIRMED,
    BookingStatus.PENDING,
    BookingStatus.CANCELLED,
  ];

  for (let i = 0; i < leads.length; i++) {
    if (i % 3 !== 0) continue;

    const status = bookingStatusSequence[i % 3];
    const bookedAt = monthsAgo(i % 12, (i % 26) + 1);

    await prisma.booking.create({
      data: {
        leadId: leads[i].id,
        buildingId: buildings[i % buildings.length].id,
        bookedById: salesUsers[i % salesUsers.length].id,
        status,
        bookedAt,
        cancelledAt: status === BookingStatus.CANCELLED ? bookedAt : null,
      },
    });
  }

  console.log("EstateFlow seed completed.");
  console.log("Admin: admin@estateflow.local");
  console.log(`Password: ${password}`);
  console.log(`Projects: ${projects.length}`);
  console.log(`Buildings: ${buildings.length}`);
  console.log(`Units: ${buildings.length * 5}`);
  console.log(`Demo leads: ${leads.length}`);
  console.log("Demo bookings: 20");
}

main()
  .catch((error) => {
    console.error("Failed to seed EstateFlow:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
