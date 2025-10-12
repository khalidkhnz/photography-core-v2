import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 12);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@photography-core.com" },
    update: {},
    create: {
      email: "admin@photography-core.com",
      name: "Admin User",
      password: hashedPassword,
      roles: ["admin"],
      isActive: true,
    },
  });

  console.log("✅ Created admin user:", adminUser.email);

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

  // Create sample clients
  const clients = [
    { name: "John Doe", email: "john@example.com", phone: "+1-555-0123" },
    { name: "Jane Smith", email: "jane@example.com", phone: "+1-555-0124" },
    {
      name: "ABC Real Estate",
      email: "contact@abcrealestate.com",
      phone: "+1-555-0125",
    },
    { name: "XYZ Events", email: "info@xyzevents.com", phone: "+1-555-0126" },
  ];

  for (const client of clients) {
    await prisma.client.upsert({
      where: { email: client.email },
      update: {},
      create: client,
    });
  }

  console.log("✅ Created sample clients");

  // Get created clients to assign locations to them
  const createdClients = await prisma.client.findMany();

  // Create sample locations for specific clients
  const locationData = [
    {
      name: "Downtown Studio",
      address: "123 Main St",
      city: "New York",
      state: "NY",
      country: "USA",
      clientEmail: "john@example.com", // Link to John Doe
    },
    {
      name: "Outdoor Garden",
      address: "456 Park Ave",
      city: "New York",
      state: "NY",
      country: "USA",
      clientEmail: "john@example.com", // Link to John Doe
    },
    {
      name: "Corporate Office",
      address: "789 Business Blvd",
      city: "New York",
      state: "NY",
      country: "USA",
      clientEmail: "jane@example.com", // Link to Jane Smith
    },
    {
      name: "Main Office",
      address: "100 Corporate Dr",
      city: "New York",
      state: "NY",
      country: "USA",
      clientEmail: "contact@abcrealestate.com", // Link to ABC Real Estate
    },
    {
      name: "Event Hall",
      address: "321 Event St",
      city: "New York",
      state: "NY",
      country: "USA",
      clientEmail: "info@xyzevents.com", // Link to XYZ Events
    },
  ];

  for (const location of locationData) {
    const client = createdClients.find((c) => c.email === location.clientEmail);
    if (client) {
      await prisma.location.upsert({
        where: {
          name_clientId: {
            name: location.name,
            clientId: client.id,
          },
        },
        update: {},
        create: {
          name: location.name,
          address: location.address,
          city: location.city,
          state: location.state,
          country: location.country,
          clientId: client.id,
        },
      });
    }
  }

  console.log("✅ Created sample locations for clients");

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
    await prisma.user.upsert({
      where: { email: member.email },
      update: {},
      create: {
        name: member.name,
        email: member.email,
        phone: member.phone,
        password: teamMemberPassword,
        roles: member.roles,
        specialties: member.specialties,
        rating: member.rating,
        isActive: true,
      },
    });
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
