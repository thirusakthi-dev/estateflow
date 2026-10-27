import "dotenv/config";
import bcrypt from "bcryptjs";
import {
  BookingStatus,
  FollowUpOutcome,
  FollowUpStatus,
  LeadStage,
  ProjectStatus,
  UnitStatus,
  UnitType,
  UserRole,
} from "../src/generated/prisma/client";
import { prisma } from "../src/lib/prisma";

const DEMO_SOURCE = "ESTATEFLOW_DEMO_SEED";
const DEMO_PASSWORD = "Admin@123456";

function monthsAgo(months: number, day = 12) {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  date.setDate(day);
  date.setHours(10, 0, 0, 0);
  return date;
}

function daysFromNow(days: number, hour = 10) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date;
}

const projectInputs = [
  {
    name: "Green Valley Residences",
    city: "Chennai",
    address: "OMR, Chennai, Tamil Nadu",
    description:
      "A modern residential community with landscaped open spaces and lifestyle amenities.",
    minPrice: 6500000,
    maxPrice: 14500000,
    imageUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",
    imagePublicId: "estateflow-demo-green-valley",
    imageAlt: "Modern residential property",
  },
  {
    name: "Skyline Heights",
    city: "Chennai",
    address: "Porur, Chennai, Tamil Nadu",
    description:
      "Contemporary apartment living with convenient access to key city destinations.",
    minPrice: 5200000,
    maxPrice: 11000000,
    imageUrl: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea",
    imagePublicId: "estateflow-demo-skyline-heights",
    imageAlt: "Contemporary residential architecture",
  },
  {
    name: "Palm Grove Villas",
    city: "Bengaluru",
    address: "Whitefield, Bengaluru, Karnataka",
    description:
      "Spacious villa homes with private outdoor areas in a landscaped community.",
    minPrice: 12500000,
    maxPrice: 26000000,
    imageUrl: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde",
    imagePublicId: "estateflow-demo-palm-grove",
    imageAlt: "Modern villa exterior",
  },
];

const buildingNames = [
  ["Tower A", "Tower B"],
  ["North Tower", "South Tower"],
  ["Villa Block A", "Villa Block B"],
];

const buildingImageUrls = [
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab",
  "https://images.unsplash.com/photo-1460317442991-0ec209397118",
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",
  "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde",
  "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea",
];

const unitImageUrls = [
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",
  "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea",
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0",
  "https://images.unsplash.com/photo-1600607687644-c7171b42498f",
];

const leadNames = [
  "Rahul Menon",
  "Divya Krishnan",
  "Sanjay Kumar",
  "Meera Nair",
  "Vikram Reddy",
  "Ananya Rao",
  "Praveen Raj",
  "Sneha Iyer",
  "Arjun Das",
  "Kavya Srinivasan",
];

const leadStages: LeadStage[] = [
  LeadStage.NEW,
  LeadStage.CONTACTED,
  LeadStage.SITE_VISIT,
  LeadStage.INTERESTED,
  LeadStage.NEGOTIATION,
  LeadStage.BOOKED,
  LeadStage.LOST,
];

const bookingStatuses: BookingStatus[] = [
  BookingStatus.CONFIRMED,
  BookingStatus.PENDING,
  BookingStatus.CANCELLED,
];

const followUpOutcomes: FollowUpOutcome[] = [
  FollowUpOutcome.CALL_BACK,
  FollowUpOutcome.INTERESTED,
  FollowUpOutcome.SITE_VISIT_PLANNED,
  FollowUpOutcome.NEGOTIATION,
  FollowUpOutcome.NOT_INTERESTED,
  FollowUpOutcome.READY_TO_BOOK,
];

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  // 1. Admin and sales employees
  const admin = await prisma.user.upsert({
    where: { email: "admin@estateflow.local" },
    update: {
      name: "EstateFlow Admin",
      passwordHash,
      role: UserRole.ADMIN,
      isActive: true,
    },
    create: {
      name: "EstateFlow Admin",
      email: "admin@estateflow.local",
      passwordHash,
      role: UserRole.ADMIN,
    },
  });

  const salesNames = ["Arun Kumar", "Priya Sharma", "Karthik Raj"];
  const salesUsers = [];

  for (let i = 0; i < salesNames.length; i++) {
    const email = `demo.sales${i + 1}@estateflow.local`;
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name: salesNames[i],
        passwordHash,
        role: UserRole.SALES_EMPLOYEE,
        isActive: true,
      },
      create: {
        name: salesNames[i],
        email,
        passwordHash,
        role: UserRole.SALES_EMPLOYEE,
      },
    });
    salesUsers.push(user);
  }

  // 2. Projects and cover images
  const projects = [];

  for (const input of projectInputs) {
    const existing = await prisma.project.findFirst({
      where: { name: input.name, city: input.city },
    });

    const project = existing
      ? await prisma.project.update({
          where: { id: existing.id },
          data: {
            address: input.address,
            description: input.description,
            status: ProjectStatus.ACTIVE,
            minPrice: input.minPrice,
            maxPrice: input.maxPrice,
          },
        })
      : await prisma.project.create({
          data: {
            name: input.name,
            city: input.city,
            address: input.address,
            description: input.description,
            status: ProjectStatus.ACTIVE,
            minPrice: input.minPrice,
            maxPrice: input.maxPrice,
          },
        });

    projects.push(project);

    await prisma.projectImage.upsert({
      where: { publicId: input.imagePublicId },
      update: {
        projectId: project.id,
        imageUrl: input.imageUrl,
        alt: input.imageAlt,
        isCover: true,
        sortOrder: 0,
      },
      create: {
        projectId: project.id,
        imageUrl: input.imageUrl,
        publicId: input.imagePublicId,
        alt: input.imageAlt,
        isCover: true,
        sortOrder: 0,
      },
    });
  }

  // 3. Buildings, building images, units, and unit images
  const buildings = [];
  let unitCount = 0;

  for (let projectIndex = 0; projectIndex < projects.length; projectIndex++) {
    for (let buildingIndex = 0; buildingIndex < 2; buildingIndex++) {
      const name = buildingNames[projectIndex][buildingIndex];
      const building = await prisma.building.upsert({
        where: {
          projectId_name: {
            projectId: projects[projectIndex].id,
            name,
          },
        },
        update: {
          description: `${name} at ${projects[projectIndex].name}`,
          totalFloors: projectIndex === 2 ? 3 : 12,
          minPrice: projectInputs[projectIndex].minPrice,
          maxPrice: projectInputs[projectIndex].maxPrice,
          contactName:
            salesNames[(projectIndex + buildingIndex) % salesNames.length],
          contactPhone: `90000000${String(projectIndex * 2 + buildingIndex + 1).padStart(2, "0")}`,
          contactEmail: `demo.sales${((projectIndex + buildingIndex) % salesNames.length) + 1}@estateflow.local`,
        },
        create: {
          projectId: projects[projectIndex].id,
          name,
          description: `${name} at ${projects[projectIndex].name}`,
          totalFloors: projectIndex === 2 ? 3 : 12,
          minPrice: projectInputs[projectIndex].minPrice,
          maxPrice: projectInputs[projectIndex].maxPrice,
          contactName:
            salesNames[(projectIndex + buildingIndex) % salesNames.length],
          contactPhone: `90000000${String(projectIndex * 2 + buildingIndex + 1).padStart(2, "0")}`,
          contactEmail: `demo.sales${((projectIndex + buildingIndex) % salesNames.length) + 1}@estateflow.local`,
        },
      });

      buildings.push(building);

      const buildingImageIndex = projectIndex * 2 + buildingIndex;
      const buildingImagePublicId = `estateflow-demo-building-${projectIndex + 1}-${buildingIndex + 1}`;

      await prisma.buildingImage.upsert({
        where: { publicId: buildingImagePublicId },
        update: {
          buildingId: building.id,
          imageUrl: buildingImageUrls[buildingImageIndex],
          alt: `${name} building`,
          isCover: true,
          sortOrder: 0,
        },
        create: {
          buildingId: building.id,
          imageUrl: buildingImageUrls[buildingImageIndex],
          publicId: buildingImagePublicId,
          alt: `${name} building`,
          isCover: true,
          sortOrder: 0,
        },
      });

      // Five units per building; the compound unique key makes reruns safe.
      for (let unitIndex = 1; unitIndex <= 5; unitIndex++) {
        const isVillaProject = projectIndex === 2;
        const type = isVillaProject
          ? UnitType.VILLA
          : unitIndex === 5
            ? UnitType.PLOT
            : UnitType.APARTMENT;

        const basePrice = projectInputs[projectIndex].minPrice;
        const price = basePrice + (unitIndex - 1) * 750000;
        const unitNumber = isVillaProject
          ? `V-${buildingIndex + 1}${String(unitIndex).padStart(2, "0")}`
          : `${buildingIndex + 1}${String(unitIndex).padStart(2, "0")}`;

        const unit = await prisma.propertyUnit.upsert({
          where: {
            buildingId_unitNumber: {
              buildingId: building.id,
              unitNumber,
            },
          },
          update: {
            type,
            price,
            bedrooms:
              type === UnitType.PLOT
                ? null
                : isVillaProject
                  ? 4
                  : (unitIndex % 3) + 1,
            bathrooms:
              type === UnitType.PLOT
                ? null
                : isVillaProject
                  ? 3
                  : (unitIndex % 2) + 1,
            area:
              type === UnitType.PLOT
                ? 1200 + unitIndex * 100
                : 850 + unitIndex * 125,
            areaUnit: "SQ_FT",
            status: UnitStatus.AVAILABLE,
          },
          create: {
            buildingId: building.id,
            unitNumber,
            type,
            price,
            bedrooms:
              type === UnitType.PLOT
                ? null
                : isVillaProject
                  ? 4
                  : (unitIndex % 3) + 1,
            bathrooms:
              type === UnitType.PLOT
                ? null
                : isVillaProject
                  ? 3
                  : (unitIndex % 2) + 1,
            area:
              type === UnitType.PLOT
                ? 1200 + unitIndex * 100
                : 850 + unitIndex * 125,
            areaUnit: "SQ_FT",
            status: UnitStatus.AVAILABLE,
          },
        });

        const unitImagePublicId = `estateflow-demo-unit-${projectIndex + 1}-${buildingIndex + 1}-${unitIndex}`;
        await prisma.propertyUnitImage.upsert({
          where: { publicId: unitImagePublicId },
          update: {
            unitId: unit.id,
            imageUrl:
              unitImageUrls[(unitCount + unitIndex) % unitImageUrls.length],
            alt: `${unitNumber} ${type.toLowerCase()} interior`,
            isCover: true,
            sortOrder: 0,
          },
          create: {
            unitId: unit.id,
            imageUrl:
              unitImageUrls[(unitCount + unitIndex) % unitImageUrls.length],
            publicId: unitImagePublicId,
            alt: `${unitNumber} ${type.toLowerCase()} interior`,
            isCover: true,
            sortOrder: 0,
          },
        });

        unitCount++;
      }
    }
  }

  // 4. Remove only records created by this demo seed.
  // Booking has no onDelete cascade from Lead, so delete bookings first.
  await prisma.booking.deleteMany({
    where: { lead: { source: DEMO_SOURCE } },
  });
  await prisma.lead.deleteMany({
    where: { source: DEMO_SOURCE },
  });

  // 5. Create 60 demo leads across the previous 12 months.
  const leads = [];

  for (let i = 0; i < 60; i++) {
    const stage = leadStages[i % leadStages.length];
    const lead = await prisma.lead.create({
      data: {
        name: `${leadNames[i % leadNames.length]} ${Math.floor(i / leadNames.length) + 1}`,
        email: `demo.lead${i + 1}@estateflow.local`,
        phone: `98${String(i + 1).padStart(8, "0")}`,
        source: DEMO_SOURCE,
        stage,
        assignedToId: salesUsers[i % salesUsers.length].id,
        createdById: admin.id,
        createdAt: monthsAgo(i % 12, (i % 26) + 1),
      },
    });

    leads.push(lead);
  }

  // 6. Create follow-ups with a mix of pending, completed, and cancelled states.
  let followUpCount = 0;

  for (let i = 0; i < leads.length; i++) {
    const isCompleted = i % 3 === 0;
    const isCancelled = i % 10 === 0 && !isCompleted;

    await prisma.followUp.create({
      data: {
        leadId: leads[i].id,
        assignedToId: salesUsers[i % salesUsers.length].id,
        scheduledAt: isCompleted
          ? monthsAgo(i % 6, (i % 26) + 1)
          : daysFromNow((i % 14) + 1, 10 + (i % 6)),
        status: isCompleted
          ? FollowUpStatus.COMPLETED
          : isCancelled
            ? FollowUpStatus.CANCELLED
            : FollowUpStatus.PENDING,
        outcome: isCompleted
          ? followUpOutcomes[i % followUpOutcomes.length]
          : null,
        notes: isCompleted
          ? `Demo follow-up completed for ${leads[i].name}.`
          : isCancelled
            ? "Demo follow-up cancelled and rescheduled."
            : `Follow up with ${leads[i].name} about property requirements.`,
      },
    });
    followUpCount++;
  }

  // 7. Create 20 demo bookings linked to leads and buildings.
  let bookingCount = 0;

  for (let i = 0; i < leads.length; i++) {
    if (i % 3 !== 0) continue;

    const status = bookingStatuses[bookingCount % bookingStatuses.length];
    const bookedAt = monthsAgo(i % 12, (i % 26) + 1);

    await prisma.booking.create({
      data: {
        leadId: leads[i].id,
        buildingId: buildings[i % buildings.length].id,
        bookedById: salesUsers[i % salesUsers.length].id,
        status,
        agreedPrice: 6500000 + bookingCount * 250000,
        bookedAt,
        cancelledAt: status === BookingStatus.CANCELLED ? bookedAt : null,
      },
    });

    bookingCount++;
  }

  console.log("\nEstateFlow demo seed completed.");
  console.log(`Admin email: admin@estateflow.local`);
  console.log(`Demo password: ${DEMO_PASSWORD}`);
  console.log(`Sales employees: ${salesUsers.length}`);
  console.log(`Projects: ${projects.length}`);
  console.log(`Project images: ${projectInputs.length}`);
  console.log(`Buildings: ${buildings.length}`);
  console.log(`Building images: ${buildings.length}`);
  console.log(`Units: ${unitCount}`);
  console.log(`Unit images: ${unitCount}`);
  console.log(`Demo leads: ${leads.length}`);
  console.log(`Demo follow-ups: ${followUpCount}`);
  console.log(`Demo bookings: ${bookingCount}`);
}

main()
  .catch((error) => {
    console.error("Failed to seed EstateFlow:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
