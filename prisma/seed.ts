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
        phone: "+1-555-0001",
        roles: ["admin"],
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

  // Create sample clients with main POC details
  const clients = [
    {
      name: "ATS HomeKraft",
      address: "123 Real Estate Blvd, Mumbai, Maharashtra 400001",
      pocName: "Rajesh Kumar",
      pocEmail: "rajesh.kumar@atshomekraft.com",
      pocPhone: "+91-98765-43210",
    },
    {
      name: "Prestige Estates",
      address: "456 Prestige Tower, Bangalore, Karnataka 560001",
      pocName: "Priya Sharma",
      pocEmail: "priya.sharma@prestigeestates.com",
      pocPhone: "+91-98765-43211",
    },
    {
      name: "DLF Limited",
      address: "789 Corporate Ave, Gurgaon, Haryana 122001",
      pocName: "Amit Verma",
      pocEmail: "amit.verma@dlf.com",
      pocPhone: "+91-98765-43212",
    },
    {
      name: "Godrej Properties",
      address: "321 Godrej Complex, Pune, Maharashtra 411001",
      pocName: "Sneha Patel",
      pocEmail: "sneha.patel@godrejproperties.com",
      pocPhone: "+91-98765-43213",
    },
  ];

  for (const client of clients) {
    try {
      await prisma.client.create({
        data: client,
      });
    } catch (error) {
      console.log(`Client ${client.name} already exists, skipping...`);
    }
  }

  console.log("✅ Created sample clients");

  // Get created clients to assign entities and locations
  const createdClients = await prisma.client.findMany();

  // Create entities for clients
  const entityData = [
    {
      name: "ATS HomeKraft Pvt Ltd",
      clientName: "ATS HomeKraft",
    },
    {
      name: "ATS Infrastructure Ltd",
      clientName: "ATS HomeKraft",
    },
    {
      name: "Prestige Estates Projects Ltd",
      clientName: "Prestige Estates",
    },
    {
      name: "DLF Homes Ltd",
      clientName: "DLF Limited",
    },
    {
      name: "Godrej Properties Ltd",
      clientName: "Godrej Properties",
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
        console.log(`Entity ${entity.name} already exists, skipping...`);
      }
    }
  }

  console.log("✅ Created sample entities for clients");

  // Create locations with POCs (independent of entities)
  const locationData = [
    {
      name: "Noida Sector 50 Project",
      address: "Plot 123, Sector 50, Noida, Uttar Pradesh 201301",
      city: "Noida",
      state: "Uttar Pradesh",
      country: "India",
      clientName: "ATS HomeKraft",
      pocs: [
        {
          name: "Vikram Singh",
          email: "vikram.singh@atshomekraft.com",
          phone: "+91-98765-43220",
          role: "Site Manager",
        },
        {
          name: "Anjali Gupta",
          email: "anjali.gupta@atshomekraft.com",
          phone: "+91-98765-43221",
          role: "Project Coordinator",
        },
      ],
    },
    {
      name: "Ghaziabad Township",
      address: "NH-24, Ghaziabad, Uttar Pradesh 201001",
      city: "Ghaziabad",
      state: "Uttar Pradesh",
      country: "India",
      clientName: "ATS HomeKraft",
      pocs: [
        {
          name: "Rohit Mehta",
          email: "rohit.mehta@atshomekraft.com",
          phone: "+91-98765-43222",
          role: "Site Supervisor",
        },
      ],
    },
    {
      name: "Whitefield Residential Complex",
      address: "EPIP Zone, Whitefield, Bangalore, Karnataka 560066",
      city: "Bangalore",
      state: "Karnataka",
      country: "India",
      clientName: "Prestige Estates",
      pocs: [
        {
          name: "Lakshmi Rao",
          email: "lakshmi.rao@prestigeestates.com",
          phone: "+91-98765-43223",
          role: "Project Manager",
        },
        {
          name: "Karthik Reddy",
          email: "karthik.reddy@prestigeestates.com",
          phone: "+91-98765-43224",
          role: "Marketing Head",
        },
      ],
    },
    {
      name: "DLF Cyber City",
      address: "DLF Cyber City, Gurgaon, Haryana 122002",
      city: "Gurgaon",
      state: "Haryana",
      country: "India",
      clientName: "DLF Limited",
      pocs: [
        {
          name: "Manish Jain",
          email: "manish.jain@dlf.com",
          phone: "+91-98765-43225",
          role: "Facility Manager",
        },
      ],
    },
    {
      name: "Godrej Garden City",
      address: "Jagatpur Road, Ahmedabad, Gujarat 382470",
      city: "Ahmedabad",
      state: "Gujarat",
      country: "India",
      clientName: "Godrej Properties",
      pocs: [
        {
          name: "Neha Desai",
          email: "neha.desai@godrejproperties.com",
          phone: "+91-98765-43226",
          role: "Site Engineer",
        },
        {
          name: "Ravi Shah",
          email: "ravi.shah@godrejproperties.com",
          phone: "+91-98765-43227",
          role: "Sales Manager",
        },
      ],
    },
  ];

  for (const location of locationData) {
    const client = createdClients.find((c) => c.name === location.clientName);
    if (client) {
      try {
        const createdLocation = await prisma.location.create({
          data: {
            name: location.name,
            address: location.address,
            city: location.city,
            state: location.state,
            country: location.country,
            clientId: client.id,
          },
        });

        // Create POCs for this location
        for (const poc of location.pocs) {
          await prisma.locationPOC.create({
            data: {
              name: poc.name,
              email: poc.email,
              phone: poc.phone,
              role: poc.role,
              locationId: createdLocation.id,
            },
          });
        }
      } catch (error) {
        console.log(`Location ${location.name} already exists, skipping...`);
      }
    }
  }

  console.log("✅ Created sample locations with POCs");

  // Create team members with different role combinations
  const teamMemberPassword = await bcrypt.hash("team123", 12);

  const teamMembers = [
    // Pure Photographers (DOPs)
    {
      name: "Arjun Kapoor",
      email: "arjun.kapoor@photography.com",
      phone: "+91-98765-43230",
      roles: ["photographer"],
      specialties: ["Real Estate", "Drone Photography"],
      rating: 4.5,
    },
    {
      name: "Meera Iyer",
      email: "meera.iyer@photography.com",
      phone: "+91-98765-43231",
      roles: ["photographer"],
      specialties: ["Real Estate", "Virtual Tours"],
      rating: 4.8,
    },
    {
      name: "Sanjay Rao",
      email: "sanjay.rao@photography.com",
      phone: "+91-98765-43232",
      roles: ["photographer"],
      specialties: ["Event", "Drone Photography"],
      rating: 4.3,
    },
    {
      name: "Pooja Nair",
      email: "pooja.nair@photography.com",
      phone: "+91-98765-43233",
      roles: ["photographer"],
      specialties: ["Real Estate", "Event"],
      rating: 4.6,
    },
    // Pure Editors
    {
      name: "Rahul Khanna",
      email: "rahul.khanna@editing.com",
      phone: "+91-98765-43240",
      roles: ["editor"],
      specialties: ["Real Estate", "Virtual Tours"],
      rating: 4.6,
    },
    {
      name: "Divya Menon",
      email: "divya.menon@editing.com",
      phone: "+91-98765-43241",
      roles: ["editor"],
      specialties: ["Real Estate", "Drone Photography"],
      rating: 4.7,
    },
    {
      name: "Anil Varma",
      email: "anil.varma@editing.com",
      phone: "+91-98765-43242",
      roles: ["editor"],
      specialties: ["Event", "Podcasts"],
      rating: 4.4,
    },
    // Multi-role (Photographer + Editor) - Can be DOP and Editor
    {
      name: "Kabir Malhotra",
      email: "kabir.malhotra@photography.com",
      phone: "+91-98765-43250",
      roles: ["photographer", "editor"],
      specialties: ["Virtual Tours", "Real Estate"],
      rating: 4.9,
    },
    {
      name: "Shreya Bhatt",
      email: "shreya.bhatt@editing.com",
      phone: "+91-98765-43251",
      roles: ["photographer", "editor"],
      specialties: ["Podcasts", "Event"],
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

  // Get created data for shoots
  const createdShootTypes = await prisma.shootType.findMany();
  const createdEntities = await prisma.entity.findMany();
  const createdLocations = await prisma.location.findMany();
  const createdTeamMembers = await prisma.user.findMany({
    where: {
      roles: {
        hasSome: ["photographer", "editor"],
      },
    },
  });

  // Create sample shoots with new structure
  const shootData = [
    {
      shootId: "RE-2024-001",
      clientName: "ATS HomeKraft",
      entityName: "ATS HomeKraft Pvt Ltd",
      locationName: "Noida Sector 50 Project",
      shootTypeCode: "RE",
      projectName: "Luxury Apartment Marketing Shoot",
      remarks: "High-end real estate photography for premium apartments",
      scheduledShootDate: new Date("2024-02-15T09:00:00Z"),
      reportingTime: "09:00 AM",
      wrapUpTime: "05:00 PM",
      photographerNotes: "Focus on natural lighting, wide angles, and luxury amenities",
      workflowType: "shift",
      shootCost: 15000.0,
      travelCost: 2000.0,
      shootCostStatus: "paid",
      travelCostStatus: "paid",
      dopName: "Arjun Kapoor",
      executorNames: ["Arjun Kapoor", "Meera Iyer"],
    },
    {
      shootId: "DR-2024-002",
      clientName: "ATS HomeKraft",
      entityName: "ATS Infrastructure Ltd",
      locationName: "Ghaziabad Township",
      shootTypeCode: "DR",
      projectName: "Aerial Construction Progress Documentation",
      remarks: "Drone photography for quarterly construction updates",
      scheduledShootDate: new Date("2024-02-20T10:00:00Z"),
      reportingTime: "10:00 AM",
      wrapUpTime: "02:00 PM",
      photographerNotes: "Weather conditions must be clear, focus on overall site progress",
      workflowType: "shift",
      shootCost: 20000.0,
      travelCost: 3000.0,
      shootCostStatus: "unpaid",
      travelCostStatus: "unpaid",
      dopName: "Sanjay Rao",
      executorNames: ["Sanjay Rao"],
    },
    {
      shootId: "VT-2024-003",
      clientName: "Prestige Estates",
      entityName: "Prestige Estates Projects Ltd",
      locationName: "Whitefield Residential Complex",
      shootTypeCode: "VT",
      projectName: "360° Virtual Property Tour",
      remarks: "Complete virtual tour for online property viewing",
      scheduledShootDate: new Date("2024-02-25T11:00:00Z"),
      reportingTime: "11:00 AM",
      wrapUpTime: "04:00 PM",
      photographerNotes: "Use 360-degree camera, cover all rooms and common areas",
      workflowType: "project",
      overallCost: 50000.0,
      overallCostStatus: "onhold",
      dopName: "Kabir Malhotra",
      executorNames: ["Kabir Malhotra"],
    },
    {
      shootId: "EV-2024-004",
      clientName: "Godrej Properties",
      entityName: "Godrej Properties Ltd",
      locationName: "Godrej Garden City",
      shootTypeCode: "EV",
      projectName: "Property Launch Event Coverage",
      remarks: "Full event coverage including ceremony, speeches, and networking",
      scheduledShootDate: new Date("2024-03-01T06:00:00Z"),
      reportingTime: "06:00 PM",
      wrapUpTime: "11:00 PM",
      photographerNotes: "Multiple photographers needed, capture key moments and VIP guests",
      workflowType: "shift",
      shootCost: 25000.0,
      travelCost: 1500.0,
      shootCostStatus: "paid",
      travelCostStatus: "paid",
      dopName: "Pooja Nair",
      executorNames: ["Pooja Nair", "Sanjay Rao"],
    },
  ];

  for (const shoot of shootData) {
    const client = createdClients.find((c) => c.name === shoot.clientName);
    const entity = createdEntities.find((e) => e.name === shoot.entityName);
    const location = createdLocations.find((l) => l.name === shoot.locationName);
    const shootType = createdShootTypes.find((st) => st.code === shoot.shootTypeCode);
    const dop = createdTeamMembers.find((tm) => tm.name === shoot.dopName);

    if (client && entity && location && shootType && dop) {
      try {
        const createdShoot = await prisma.shoot.create({
          data: {
            shootId: shoot.shootId,
            clientId: client.id,
            entityId: entity.id,
            locationId: location.id,
            shootTypeId: shootType.id,
            projectName: shoot.projectName,
            remarks: shoot.remarks,
            scheduledShootDate: shoot.scheduledShootDate,
            reportingTime: shoot.reportingTime,
            wrapUpTime: shoot.wrapUpTime,
            photographerNotes: shoot.photographerNotes,
            workflowType: shoot.workflowType,
            shootCost: shoot.shootCost,
            travelCost: shoot.travelCost,
            shootCostStatus: shoot.shootCostStatus,
            travelCostStatus: shoot.travelCostStatus,
            overallCost: shoot.overallCost,
            overallCostStatus: shoot.overallCostStatus,
            dopId: dop.id,
            status: "planned",
          },
        });

        // Add executors
        for (const executorName of shoot.executorNames) {
          const executor = createdTeamMembers.find((tm) => tm.name === executorName);
          if (executor) {
            await prisma.shootExecutor.create({
              data: {
                shootId: createdShoot.id,
                userId: executor.id,
              },
            });
          }
        }
      } catch (error) {
        console.log(`Shoot ${shoot.shootId} already exists, skipping...`);
      }
    }
  }

  console.log("✅ Created sample shoots with new structure");

  // Create sample edits linked to shoots
  const editData = [
    {
      editId: "EDIT-2024-001",
      shootId: "RE-2024-001",
      deliverables: "20 edited photos, color graded, retouched",
      editDeliveryDate: new Date("2024-02-20T00:00:00Z"),
      editorNotes: "Enhance colors, remove minor imperfections, apply luxury filter",
      editCost: 5000.0,
      editCostStatus: "paid",
      editorNames: ["Rahul Khanna", "Divya Menon"],
    },
    {
      editId: "EDIT-2024-002",
      shootId: "DR-2024-002",
      deliverables: "Panoramic stitching, 10 edited aerial shots",
      editDeliveryDate: new Date("2024-02-25T00:00:00Z"),
      editorNotes: "Stitch aerial photos for panoramic view, color correction",
      editCost: 8000.0,
      editCostStatus: "unpaid",
      editorNames: ["Divya Menon"],
    },
    {
      editId: "EDIT-2024-003",
      shootId: "EV-2024-004",
      deliverables: "50 event photos, quick turnaround for social media",
      editDeliveryDate: new Date("2024-03-03T00:00:00Z"),
      editorNotes: "Quick turnaround for social media posts, basic color grading",
      editCost: 6000.0,
      editCostStatus: "paid",
      editorNames: ["Anil Varma"],
    },
    {
      editId: "EDIT-2024-004",
      shootId: null, // Independent edit (edit-only order)
      deliverables: "Video editing for promotional content",
      editDeliveryDate: new Date("2024-03-10T00:00:00Z"),
      editorNotes: "Edit existing footage into 2-minute promotional video",
      editCost: 10000.0,
      editCostStatus: "onhold",
      editorNames: ["Anil Varma", "Shreya Bhatt"],
    },
  ];

  for (const edit of editData) {
    let shoot = null;
    if (edit.shootId) {
      shoot = await prisma.shoot.findUnique({
        where: { shootId: edit.shootId },
      });
    }

    try {
      const createdEdit = await prisma.edit.create({
        data: {
          editId: edit.editId,
          shootId: shoot?.id,
          deliverables: edit.deliverables,
          editDeliveryDate: edit.editDeliveryDate,
          editorNotes: edit.editorNotes,
          editCost: edit.editCost,
          editCostStatus: edit.editCostStatus,
          status: "pending",
        },
      });

      // Add editors
      for (const editorName of edit.editorNames) {
        const editor = createdTeamMembers.find((tm) => tm.name === editorName);
        if (editor) {
          await prisma.editEditor.create({
            data: {
              editId: createdEdit.id,
              userId: editor.id,
            },
          });
        }
      }
    } catch (error) {
      console.log(`Edit ${edit.editId} already exists, skipping...`);
    }
  }

  console.log("✅ Created sample edits with team assignments");

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
