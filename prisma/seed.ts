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

  // Create sample clients with full details
  const clients = [
    { 
      name: "John Doe Photography",
      email: "contact@johndoephotography.com",
      phone: "+1-555-0100",
      address: "123 Photography Lane, New York, NY 10001",
      poc: "John Doe"
    },
    { 
      name: "Jane Smith Studios",
      email: "info@janesmithstudios.com",
      phone: "+1-555-0101",
      address: "456 Studio Street, New York, NY 10002",
      poc: "Jane Smith"
    },
    { 
      name: "ABC Real Estate",
      email: "contact@abcrealestate.com",
      phone: "+1-555-0102",
      address: "789 Real Estate Blvd, New York, NY 10003",
      poc: "Robert Brown"
    },
    { 
      name: "XYZ Events",
      email: "events@xyzevents.com",
      phone: "+1-555-0103",
      address: "321 Event Avenue, New York, NY 10004",
      poc: "Tom Anderson"
    },
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

  // Get created data for shoots
  const createdShootTypes = await prisma.shootType.findMany();
  const createdPOCs = await prisma.pOC.findMany();

  // Create sample shoots with hierarchical data
  const shootData = [
    {
      shootId: "RE-2024-001",
      clientName: "ABC Real Estate",
      entityName: "ABC Real Estate Group",
      siteName: "Main Office",
      pocName: "Robert Brown",
      shootTypeCode: "RE",
      projectName: "Luxury Condo Marketing",
      remarks: "High-end real estate photography for luxury condominium",
      shootStartDate: new Date("2024-01-15T09:00:00Z"),
      shootEndDate: new Date("2024-01-15T17:00:00Z"),
      photographerNotes: "Focus on natural lighting and wide angles",
      editorNotes: "Enhance colors and remove minor imperfections",
      workflowType: "shift",
      photographyCost: 500.00,
      travelCost: 50.00,
      editingCost: 200.00,
    },
    {
      shootId: "DR-2024-002",
      clientName: "John Doe Photography",
      entityName: "John Doe Photography LLC",
      siteName: "Downtown Studio",
      pocName: "John Doe",
      shootTypeCode: "DR",
      projectName: "Aerial Property Survey",
      remarks: "Drone photography for property assessment",
      shootStartDate: new Date("2024-01-20T10:00:00Z"),
      shootEndDate: new Date("2024-01-20T14:00:00Z"),
      photographerNotes: "Weather conditions: Clear, light wind",
      editorNotes: "Stitch aerial photos for panoramic view",
      workflowType: "shift",
      photographyCost: 800.00,
      travelCost: 100.00,
      editingCost: 300.00,
    },
    {
      shootId: "EV-2024-003",
      clientName: "XYZ Events",
      entityName: "XYZ Events Corporation",
      siteName: "Event Hall",
      pocName: "Tom Anderson",
      shootTypeCode: "EV",
      projectName: "Corporate Gala",
      remarks: "Full event coverage including ceremony and reception",
      shootStartDate: new Date("2024-01-25T18:00:00Z"),
      shootEndDate: new Date("2024-01-25T23:00:00Z"),
      photographerNotes: "Multiple photographers needed for large event",
      editorNotes: "Quick turnaround for social media posts",
      workflowType: "shift",
      photographyCost: 1200.00,
      travelCost: 0.00,
      editingCost: 400.00,
    },
    {
      shootId: "VT-2024-004",
      clientName: "ABC Real Estate",
      entityName: "ABC Real Estate Holdings",
      siteName: "Secondary Office",
      pocName: "Lisa Davis",
      shootTypeCode: "VT",
      projectName: "Virtual Office Tour",
      remarks: "360-degree virtual tour for remote viewing",
      shootStartDate: new Date("2024-01-30T11:00:00Z"),
      shootEndDate: new Date("2024-01-30T15:00:00Z"),
      photographerNotes: "Use 360-degree camera equipment",
      editorNotes: "Create interactive virtual tour",
      workflowType: "project",
      photographyCost: 600.00,
      travelCost: 75.00,
      editingCost: 500.00,
    },
  ];

  for (const shoot of shootData) {
    const client = createdClients.find((c) => c.name === shoot.clientName);
    const entity = createdEntities.find((e) => e.name === shoot.entityName);
    const site = createdSites.find((s) => s.name === shoot.siteName);
    const poc = createdPOCs.find((p) => p.name === shoot.pocName);
    const shootType = createdShootTypes.find((st) => st.code === shoot.shootTypeCode);

    if (client && entity && site && poc && shootType) {
      try {
        await prisma.shoot.create({
          data: {
            shootId: shoot.shootId,
            clientId: client.id,
            entityId: entity.id,
            siteId: site.id,
            pocId: poc.id,
            shootTypeId: shootType.id,
            projectName: shoot.projectName,
            remarks: shoot.remarks,
            shootStartDate: shoot.shootStartDate,
            shootEndDate: shoot.shootEndDate,
            photographerNotes: shoot.photographerNotes,
            editorNotes: shoot.editorNotes,
            workflowType: shoot.workflowType,
            photographyCost: shoot.photographyCost,
            travelCost: shoot.travelCost,
            editingCost: shoot.editingCost,
            status: "planned",
          },
        });
      } catch (error) {
        console.log(`Shoot ${shoot.shootId} already exists, skipping...`);
      }
    }
  }

  console.log("✅ Created sample shoots with hierarchical data");

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
          phone: member.phone,
          roles: member.roles,
          specialties: member.specialties,
          rating: member.rating,
          isActive: true,
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
