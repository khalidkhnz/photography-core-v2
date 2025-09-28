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
      role: "admin",
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

  // Create sample locations
  const locations = [
    {
      name: "Downtown Studio",
      address: "123 Main St",
      city: "New York",
      state: "NY",
      country: "USA",
    },
    {
      name: "Outdoor Park",
      address: "456 Park Ave",
      city: "New York",
      state: "NY",
      country: "USA",
    },
    {
      name: "Client Office",
      address: "789 Business Blvd",
      city: "New York",
      state: "NY",
      country: "USA",
    },
    {
      name: "Event Venue",
      address: "321 Event St",
      city: "New York",
      state: "NY",
      country: "USA",
    },
  ];

  for (const location of locations) {
    await prisma.location.upsert({
      where: { name: location.name },
      update: {},
      create: location,
    });
  }

  console.log("✅ Created sample locations");

  // Create sample photographers
  const photographers = [
    {
      name: "Alice Johnson",
      email: "alice@photography.com",
      phone: "+1-555-0201",
      specialties: ["Real Estate", "Portrait"],
    },
    {
      name: "Bob Wilson",
      email: "bob@photography.com",
      phone: "+1-555-0202",
      specialties: ["Drone", "Landscape"],
    },
    {
      name: "Carol Davis",
      email: "carol@photography.com",
      phone: "+1-555-0203",
      specialties: ["Event", "Wedding"],
    },
    {
      name: "David Brown",
      email: "david@photography.com",
      phone: "+1-555-0204",
      specialties: ["Virtual Tours", "Commercial"],
    },
  ];

  for (const photographer of photographers) {
    await prisma.photographer.upsert({
      where: { email: photographer.email },
      update: {},
      create: photographer,
    });
  }

  console.log("✅ Created sample photographers");

  // Create sample editors
  const editors = [
    {
      name: "Eva Garcia",
      email: "eva@editing.com",
      phone: "+1-555-0301",
      specialties: ["Photo Editing", "Color Correction"],
    },
    {
      name: "Frank Miller",
      email: "frank@editing.com",
      phone: "+1-555-0302",
      specialties: ["Video Editing", "Motion Graphics"],
    },
    {
      name: "Grace Lee",
      email: "grace@editing.com",
      phone: "+1-555-0303",
      specialties: ["Retouching", "Compositing"],
    },
    {
      name: "Henry Chen",
      email: "henry@editing.com",
      phone: "+1-555-0304",
      specialties: ["Audio Editing", "Podcast Production"],
    },
  ];

  for (const editor of editors) {
    await prisma.editor.upsert({
      where: { email: editor.email },
      update: {},
      create: editor,
    });
  }

  console.log("✅ Created sample editors");

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
