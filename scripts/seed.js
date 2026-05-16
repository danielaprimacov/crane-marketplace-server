require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/User.model");
const Crane = require("../models/Crane.model");
const Inquiry = require("../models/Inquiry.model");
const Message = require("../models/Message.model");
const ROLES = require("../constants/roles");

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI in .env");
  process.exit(1);
}

if (
  !MONGODB_URI.includes("localhost") &&
  process.env.ALLOW_REMOTE_SEED !== "true"
) {
  console.error(
    "Refusing to seed non-local database without ALLOW_REMOTE_SEED=true."
  );
  process.exit(1);
}

const PASSWORD = "Test123456!";

const craneImages = {
  liebherr:
    "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
  tadano:
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1200&auto=format&fit=crop",
  potain:
    "https://images.unsplash.com/photo-1485083269755-a7b559a4fe5e?q=80&w=1200&auto=format&fit=crop",
  grove:
    "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=1200&auto=format&fit=crop",
};

async function clearDatabase() {
  const seedEmails = ["admin@kranhub.test", "user@kranhub.test"];

  const seedUsers = await User.find({
    email: { $in: seedEmails },
  }).select("_id");

  const seedUserIds = seedUsers.map((user) => user._id);

  const existingUserIds = await User.distinct("_id");

  await Inquiry.deleteMany({
    $or: [{ email: /@seed\.test$/ }, { customerName: /^Seed/ }],
  });

  await Message.deleteMany({
    $or: [
      { email: /@seed\.test$/ },
      { firstName: "Seed" },
      { lastName: "Contact" },
      { name: /^Seed/ },
    ],
  });

  await Crane.deleteMany({
    $or: [
      // cranes owned by current seed users
      { owner: { $in: seedUserIds } },

      // orphan cranes
      { owner: null },
      { owner: { $exists: false } },

      // cranes whose owner points to a deleted user
      { owner: { $nin: existingUserIds } },

      // old seed cranes from previous seed versions / renamed titles
      {
        title: {
          $in: [
            "Seed Liebherr 200 EC-H 10",
            "Seed Tadano AC 4.080-1",
            "Seed Potain MDT 219",
            "Seed Grove GMK 5250L",

            "Liebherr 200 EC-H 10",
            "Tadano AC 4.080-1",
            "Potain MDT 8 219",
            "Grove GMK 250 5250L",
            "Grove GMK 5250L",
          ],
        },
      },
    ],
  });

  await User.deleteMany({
    email: { $in: seedEmails },
  });
}

async function createUsers() {
  const hashedPassword = await bcrypt.hash(PASSWORD, 10);

  const admin = await User.create({
    name: "Seed Admin",
    email: "admin@kranhub.test",
    password: hashedPassword,
    role: ROLES.ADMIN,
  });

  const user = await User.create({
    name: "Seed User",
    email: "user@kranhub.test",
    password: hashedPassword,
    role: ROLES.USER,
  });

  return { admin, user };
}

async function createCranes(ownerId) {
  const cranes = await Crane.create([
    {
      title: "Seed Liebherr 200 EC-H 10",
      producer: "Liebherr",
      seriesCode: "200 EC-H",
      capacityClassNumber: 10,
      capacity: 10,
      height: 65,
      radius: 60,
      variantRevision: "Litronic",
      status: "for rent",
      rentPrice: {
        amount: 2800,
        interval: "month",
      },
      location: "Berlin, Germany",
      description:
        "Seed tower crane for medium and large construction sites. Suitable for long-term rental projects.",
      images: [craneImages.liebherr],
      owner: ownerId,
    },
    {
      title: "Seed Tadano AC 4.080-1",
      producer: "Tadano",
      seriesCode: "AC",
      capacityClassNumber: 80,
      capacity: 80,
      height: 60,
      radius: 48,
      variantRevision: "4.080-1",
      status: "for sale",
      salePrice: 485000,
      location: "Hamburg, Germany",
      description:
        "Seed mobile crane with strong lifting capacity and flexible use on different jobsites.",
      images: [craneImages.tadano],
      owner: ownerId,
    },
    {
      title: "Seed Potain MDT 219",
      producer: "Potain",
      seriesCode: "MDT",
      capacityClassNumber: 8,
      capacity: 8,
      height: 55,
      radius: 65,
      variantRevision: "219",
      status: "for rent",
      rentPrice: {
        amount: 2400,
        interval: "month",
      },
      location: "Munich, Germany",
      description:
        "Seed flat-top tower crane for urban sites with limited setup space.",
      images: [craneImages.potain],
      owner: ownerId,
    },
    {
      title: "Seed Grove GMK 5250L",
      producer: "Grove",
      seriesCode: "GMK",
      capacityClassNumber: 250,
      capacity: 250,
      height: 110,
      radius: 80,
      variantRevision: "5250L",
      status: "for sale",
      salePrice: 950000,
      location: "Cologne, Germany",
      description:
        "Seed all-terrain crane for heavy lifting and infrastructure projects.",
      images: [craneImages.grove],
      owner: ownerId,
    },
  ]);

  return cranes;
}

async function createInquiries(cranes) {
  const [liebherr, tadano, potain] = cranes;

  await Inquiry.create([
    {
      customerName: "Seed Customer One",
      email: "customer.one@seed.test",
      message:
        "We need a tower crane for a residential project. Please confirm availability and transport options.",
      crane: liebherr._id,
      period: {
        from: new Date("2026-07-01"),
        to: new Date("2026-09-30"),
      },
      address: "Alexanderplatz 1, 10178 Berlin",
      needsTransport: true,
      needsInstallation: true,
      status: "new",
      isRead: false,
    },
    {
      customerName: "Seed Customer Two",
      email: "customer.two@seed.test",
      message:
        "Please send more information about the sale price and maintenance history.",
      crane: tadano._id,
      period: {
        from: new Date("2026-08-10"),
        to: new Date("2026-08-20"),
      },
      address: "HafenCity, Hamburg",
      needsTransport: false,
      needsInstallation: false,
      status: "in_progress",
      isRead: true,
    },
    {
      customerName: "Seed Customer Three",
      email: "customer.three@seed.test",
      message:
        "We are comparing several flat-top cranes. Can you advise if this model fits a narrow city site?",
      crane: potain._id,
      period: {
        from: new Date("2026-06-15"),
        to: new Date("2026-10-15"),
      },
      address: "Marienplatz, Munich",
      needsTransport: true,
      needsInstallation: false,
      status: "resolved",
      isRead: true,
    },
  ]);
}

async function createMessages() {
  await Message.create([
    {
      formType: "contact",
      salutation: "Mr.",
      firstName: "Seed",
      lastName: "Contact",
      email: "contact@seed.test",
      phone: "+49 111 111111",
      country: "Germany",
      message: "I would like to know more about your crane transport services.",
    },
    {
      formType: "expert",
      name: "Seed Expert Request",
      company: "Seed Construction GmbH",
      email: "expert@seed.test",
      phone: "+49 222 222222",
      projectDetails:
        "We need help choosing a crane for a 7-floor building project with limited street access.",
    },
    {
      formType: "newsletter",
      firstName: "Seed",
      lastName: "Subscriber",
      email: "newsletter@seed.test",
      phone: "+49 333 333333",
      topics: ["newListings", "safetyCompliance", "financingLeasing"],
      agreeComm: true,
      agreeNewsletter: true,
      recaptchaVerified: true,
      consentTimestamp: new Date(),
    },
  ]);
}

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);

    console.log("Clearing old seed data...");
    await clearDatabase();

    console.log("Creating users...");
    const { admin, user } = await createUsers();

    console.log("Creating cranes...");
    const cranes = await createCranes(user._id);

    console.log("Creating inquiries...");
    await createInquiries(cranes);

    console.log("Creating messages...");
    await createMessages();

    console.log("");
    console.log("Seed completed.");
    console.log("");
    console.log("Admin login:");
    console.log("  email: admin@kranhub.test");
    console.log(`  password: ${PASSWORD}`);
    console.log("");
    console.log("User login:");
    console.log("  email: user@kranhub.test");
    console.log(`  password: ${PASSWORD}`);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
  }
}

seed();
