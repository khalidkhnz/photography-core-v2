import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 12);
  try {
    const adminUser = await prisma.user.create({
      data: {
        email: "admin@photography-core.com",
        name: "Admin User",
        password: hashedPassword,
      },
    });
    console.log("✅ Created admin user:", adminUser.email);
  } catch (error) {
    console.log("Admin user already exists, skipping...");
  }

  // Create shoot types
  const shootTypes = [
    { name: "Real Estate", code: "RE", description: "Real estate photography" },
    { name: "Drone", code: "DR", description: "Drone photography" },
    { name: "Event", code: "EV", description: "Event photography" },
    {
      name: "Virtual Tours",
      code: "VT",
      description: "Virtual tour photography",
    },
    { name: "Podcasts", code: "PC", description: "Podcast recording" },
  ];

  for (const shootType of shootTypes) {
    await prisma.shootType.upsert({
      where: { code: shootType.code },
      update: {},
      create: shootType,
    });
  }

  console.log("✅ Created shoot types");

  // Create sample clients (trade names only)
  const clients = [
    { name: "John Doe Photography" },
    { name: "Jane Smith Studios" },
    { name: "ABC Real Estate" },
    { name: "XYZ Events" },
  ];

  for (const client of clients) {
    try {
      await prisma.client.create({
        data: client,
      });
    } catch (error) {
      // Client already exists, skip
      console.log(`Client ${client.name} already exists, skipping...`);
    }
  }

  console.log("✅ Created sample clients");

  // Get created clients to assign entities, sites, and POCs
  const createdClients = await prisma.client.findMany();

  // Create entities for clients
  const entityData = [
    {
      name: "John Doe Photography LLC",
      clientName: "John Doe Photography",
    },
    {
      name: "Jane Smith Studios Inc",
      clientName: "Jane Smith Studios",
    },
    {
      name: "ABC Real Estate Group",
      clientName: "ABC Real Estate",
    },
    {
      name: "ABC Real Estate Holdings",
      clientName: "ABC Real Estate",
    },
    {
      name: "XYZ Events Corporation",
      clientName: "XYZ Events",
    },
  ];

  for (const entity of entityData) {
    const client = createdClients.find((c) => c.name === entity.clientName);
    if (client) {
      try {
        await prisma.entity.create({
          data: {
            name: entity.name,
            clientId: client.id,
          },
        });
      } catch (error) {
        // Entity already exists, skip
        console.log(`Entity ${entity.name} already exists, skipping...`);
      }
    }
  }

  console.log("✅ Created sample entities for clients");

  // Get created entities to assign sites
  const createdEntities = await prisma.entity.findMany();

  // Create sites for entities
  const siteData = [
    {
      name: "Downtown Studio",
      address: "123 Main St, New York, NY 10001",
      entityName: "John Doe Photography LLC",
    },
    {
      name: "Outdoor Garden Studio",
      address: "456 Park Ave, New York, NY 10002",
      entityName: "John Doe Photography LLC",
    },
    {
      name: "Corporate Office",
      address: "789 Business Blvd, New York, NY 10003",
      entityName: "Jane Smith Studios Inc",
    },
    {
      name: "Main Office",
      address: "100 Corporate Dr, New York, NY 10004",
      entityName: "ABC Real Estate Group",
    },
    {
      name: "Secondary Office",
      address: "200 Business Ave, New York, NY 10005",
      entityName: "ABC Real Estate Holdings",
    },
    {
      name: "Event Hall",
      address: "321 Event St, New York, NY 10006",
      entityName: "XYZ Events Corporation",
    },
  ];

  for (const site of siteData) {
    const entity = createdEntities.find((e) => e.name === site.entityName);
    if (entity) {
      try {
        await prisma.site.create({
          data: {
            name: site.name,
            address: site.address,
            entityId: entity.id,
          },
        });
      } catch (error) {
        // Site already exists, skip
        console.log(`Site ${site.name} already exists, skipping...`);
      }
    }
  }

  console.log("✅ Created sample sites for entities");

  // Get created sites to assign POCs
  const createdSites = await prisma.site.findMany();

  // Create POCs for sites
  const pocData = [
    {
      name: "John Doe",
      email: "john@johndoephotography.com",
      phone: "+1-555-0123",
      role: "Owner",
      siteName: "Downtown Studio",
    },
    {
      name: "Sarah Johnson",
      email: "sarah@johndoephotography.com",
      phone: "+1-555-0124",
      role: "Studio Manager",
      siteName: "Downtown Studio",
    },
    {
      name: "Mike Wilson",
      email: "mike@johndoephotography.com",
      phone: "+1-555-0125",
      role: "Photographer",
      siteName: "Outdoor Garden Studio",
    },
    {
      name: "Jane Smith",
      email: "jane@janesmithstudios.com",
      phone: "+1-555-0126",
      role: "Creative Director",
      siteName: "Corporate Office",
    },
    {
      name: "Robert Brown",
      email: "robert@abcrealestate.com",
      phone: "+1-555-0127",
      role: "Property Manager",
      siteName: "Main Office",
    },
    {
      name: "Lisa Davis",
      email: "lisa@abcrealestate.com",
      phone: "+1-555-0128",
      role: "Sales Director",
      siteName: "Secondary Office",
    },
    {
      name: "Tom Anderson",
      email: "tom@xyzevents.com",
      phone: "+1-555-0129",
      role: "Event Coordinator",
      siteName: "Event Hall",
    },
    {
      name: "Emma Wilson",
      email: "emma@xyzevents.com",
      phone: "+1-555-0130",
      role: "Operations Manager",
      siteName: "Event Hall",
    },
  ];

  for (const poc of pocData) {
    const site = createdSites.find((s) => s.name === poc.siteName);
    if (site) {
      try {
        await prisma.pOC.create({
          data: {
            name: poc.name,
            email: poc.email,
            phone: poc.phone,
            role: poc.role,
            siteId: site.id,
          },
        });
      } catch (error) {
        // POC already exists, skip
        console.log(`POC ${poc.name} already exists, skipping...`);
      }
    }
  }

  console.log("✅ Created sample POCs for sites");

  // Create team members with different role combinations
  const teamMemberPassword = await bcrypt.hash("team123", 12);

  const teamMembers = [
    // Pure Photographers
    {
      name: "Alice Johnson",
      email: "alice@photography.com",
      phone: "+1-555-0201",
      roles: ["photographer"],
      specialties: ["Real Estate", "Portrait Photography"],
      rating: 4.5,
    },
    {
      name: "Bob Wilson",
      email: "bob@photography.com",
      phone: "+1-555-0202",
      roles: ["photographer"],
      specialties: ["Drone Photography", "Landscape"],
      rating: 4.8,
    },
    {
      name: "Carol Davis",
      email: "carol@photography.com",
      phone: "+1-555-0203",
      roles: ["photographer"],
      specialties: ["Event Photography", "Wedding"],
      rating: 4.3,
    },
    // Pure Editors
    {
      name: "Eva Garcia",
      email: "eva@editing.com",
      phone: "+1-555-0301",
      roles: ["editor"],
      specialties: ["Photo Editing", "Color Correction"],
      rating: 4.6,
    },
    {
      name: "Frank Miller",
      email: "frank@editing.com",
      phone: "+1-555-0302",
      roles: ["editor"],
      specialties: ["Video Editing", "Motion Graphics"],
      rating: 4.7,
    },
    {
      name: "Grace Lee",
      email: "grace@editing.com",
      phone: "+1-555-0303",
      roles: ["editor"],
      specialties: ["Retouching", "Compositing"],
      rating: 4.4,
    },
    // Multi-role (Photographer + Editor)
    {
      name: "David Brown",
      email: "david@photography.com",
      phone: "+1-555-0204",
      roles: ["photographer", "editor"],
      specialties: ["Virtual Tours", "Photo Editing", "Commercial Photography"],
      rating: 4.9,
    },
    {
      name: "Henry Chen",
      email: "henry@editing.com",
      phone: "+1-555-0304",
      roles: ["photographer", "editor"],
      specialties: ["Podcast Production", "Audio Editing", "Videography"],
      rating: 4.5,
    },
  ];

  for (const member of teamMembers) {
    try {
      await prisma.user.create({
        data: {
          name: member.name,
          email: member.email,
          password: teamMemberPassword,
        },
      });
    } catch (error) {
      console.log(`Team member ${member.name} already exists, skipping...`);
    }
  }

  console.log(
    "✅ Created team members (photographers, editors, and multi-role)",
  );

  console.log("🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
