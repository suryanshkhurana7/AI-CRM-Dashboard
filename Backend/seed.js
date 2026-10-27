import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import { User } from "./models/User.js";
import { Lead } from "./models/Lead.js";
import { Contact } from "./models/Contact.js";
import { Note } from "./models/Note.js";
import { Task } from "./models/Task.js";

/* ---------- helpers ---------- */
const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (n) => new Date(Date.now() - n * DAY);
const daysAhead = (n) => new Date(Date.now() + n * DAY);
const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickSome = (arr, n) =>
  [...arr].sort(() => Math.random() - 0.5).slice(0, n);
const weighted = (pairs) => {
  const total = pairs.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [v, w] of pairs) {
    if ((r -= w) <= 0) return v;
  }
  return pairs[0][0];
};
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/* ---------- data pools ---------- */
const COMPANIES = [
  ["Helios Analytics", "helioslytics.com"],
  ["Mintbridge", "mintbridge.io"],
  ["Orchid Robotics", "orchidrobotics.ai"],
  ["Lumen Logistics", "lumenlogistics.co"],
  ["Stackhaven", "stackhaven.dev"],
  ["Zenith Health", "zenithhealth.com"],
  ["Paperplane Labs", "paperplane.io"],
  ["Redwood Capital", "redwoodcap.com"],
  ["Tidal Commerce", "tidalcommerce.co"],
  ["Ironleaf Security", "ironleaf.io"],
  ["Cobalt Media", "cobaltmedia.com"],
  ["Nimbus Retail", "nimbusretail.com"],
  ["Aurora Pay", "aurorapay.io"],
  ["Kestrel Aerospace", "kestrelaero.com"],
  ["Basil & Co", "basilandco.co"],
  ["Summit EdTech", "summitedtech.org"],
  ["Pinecone Foods", "pineconefoods.com"],
  ["Driftwood Studio", "driftwood.studio"],
  ["Quanta Freight", "quantafreight.com"],
  ["Meridian Energy", "meridianenergy.co"],
  ["Sparkline AI", "sparkline.ai"],
  ["Harbor Insurance", "harborins.com"],
  ["Foxglove Bio", "foxglovebio.com"],
  ["Cinder Games", "cindergames.io"],
  ["Atlas Mobility", "atlasmobility.com"],
  ["Willow Systems", "willowsystems.io"],
  ["Crescent Travel", "crescenttravel.co"],
  ["Onyx Hardware", "onyxhw.com"],
  ["Polaris Legal", "polarislegal.com"],
  ["Birchwood Realty", "birchwoodrealty.com"],
  ["Flux Telecom", "fluxtelecom.net"],
  ["Gravity Apparel", "gravityapparel.co"],
  ["Mosaic Learning", "mosaiclearning.io"],
  ["Tangent Consulting", "tangentconsult.com"],
  ["Verdant Agritech", "verdantagri.com"],
  ["Beacon Nonprofits", "beaconnp.org"],
  ["Echo Cloud", "echocloud.io"],
  ["Juniper Finance", "juniperfin.com"],
  ["Ranger Outdoors", "rangeroutdoors.co"],
  ["Solstice Solar", "solsticesolar.com"],
  ["Caravel Maritime", "caravelmaritime.com"],
  ["Nectar Beverages", "nectarbev.com"],
  ["Bolt Charging", "boltcharging.io"],
  ["Lattice Data", "latticedata.ai"],
];

const FIRST = [
  "Rahul",
  "Priya",
  "Siddharth",
  "Neha",
  "Harsh",
  "Pooja",
  "Varun",
  "Simran",
  "Tushar",
  "Shreya",
  "Manish",
  "Aditi",
  "Gaurav",
  "Sneha",
  "Nikhil",
  "Tanvi",
  "Ayaan",
  "Mahika",
  "Parth",
  "Ritika",
  "Sahil",
  "Divya",
  "Kunal",
  "Bhavna",
  "Ethan",
  "Olivia",
  "Liam",
  "Sophia",
  "Noah",
  "Emma",
  "Lucas",
  "Mia",
  "Omar",
  "Layla",
  "Hiro",
  "Yuki",
  "Mateo",
  "Elena",
  "Samuel",
  "Chloe",
];

const LAST = [
  "Kulkarni",
  "Banerjee",
  "Chatterjee",
  "Trivedi",
  "Bhatt",
  "Kohli",
  "Anand",
  "Grover",
  "Dutta",
  "Ghosh",
  "Thakur",
  "Rathore",
  "Yadav",
  "Jain",
  "Lal",
  "Pillai",
  "Naidu",
  "Hegde",
  "Kaur",
  "Bose",
  "Walker",
  "Nguyen",
  "Carter",
  "Rossi",
  "Tanaka",
  "Hughes",
  "Moreau",
  "Silva",
  "Haddad",
  "Fischer",
];

const TITLES = [
  "Chief Revenue Officer",
  "Head of Partnerships",
  "VP Engineering",
  "Director of Procurement",
  "Customer Success Lead",
  "Chief Product Officer",
  "Senior Data Scientist",
  "IT Security Manager",
  "Managing Director",
  "Head of Digital",
  "Finance Controller",
  "Demand Gen Manager",
  "Platform Architect",
  "Operations Director",
  "Co-Founder",
];

const TAGS = [
  "budget-holder",
  "evaluator",
  "internal-champion",
  "technical",
  "legal",
  "exec-sponsor",
  "hot",
  "referral",
  "mid-market",
  "enterprise",
  "at-risk",
];

const SOURCES = [
  "Website",
  "Referral",
  "Cold Outreach",
  "Social",
  "Event",
  "Other",
];

const LEAD_NOTES = [
  "Downloaded the pricing guide and requested a callback.",
  "Introduced by a partner agency after a joint webinar.",
  "Met at a trade show — asked about API limits.",
  "Outbound sequence reply; wants a short intro call.",
  "Running a pilot with two teams, usage is growing.",
  "Switching from a legacy vendor; contract ends in Q1.",
  "",
];

const NOTE_TEMPLATES = [
  (c) =>
    `Kickoff call with ${c} done. They want a phased rollout starting with one department.`,
  (c) =>
    `${c} asked for a custom integration with their ERP. Estimate effort with engineering.`,
  (c) =>
    `CFO at ${c} pushed back on annual prepay. Offer quarterly billing as a fallback.`,
  (c) =>
    `No-show on today's demo with ${c}. Reschedule and send a calendar hold.`,
  (c) =>
    `${c} needs data residency in the EU. Confirm hosting options with the infra team.`,
  (c) =>
    `Executive sponsor at ${c} joined the call and signalled strong support.`,
  (c) =>
    `${c} is evaluating two other vendors. Differentiate on integrations and reporting.`,
  (c) =>
    `Pilot at ${c} hit 80% weekly active usage — good moment to propose a full rollout.`,
  (c) =>
    `${c} requested a DPA and pen-test summary. Sent via the secure portal.`,
  (c) =>
    `Contract signed by ${c}. Hand over to onboarding and schedule the kickoff.`,
  (c) =>
    `Lost to an incumbent at ${c}. Ask for feedback and revisit in six months.`,
];

const TASK_TEMPLATES = [
  (c) => `Send revised quote to ${c}`,
  (c) => `Prepare demo environment for ${c}`,
  (c) => `Follow up on security review with ${c}`,
  (c) => `Schedule executive alignment call with ${c}`,
  (c) => `Collect pilot feedback from ${c}`,
  (c) => `Send onboarding checklist to ${c}`,
  (c) => `Review MSA changes from ${c}`,
  (c) => `Re-engage ${c} after quiet period`,
];

const TASK_DESCRIPTIONS = [
  "Attach the latest pricing sheet and a short summary of changes.",
  "Sync with the product team before sending anything out.",
  "Keep it under 15 minutes and focus on next steps.",
  "Log the outcome in the lead notes once done.",
  "",
];

const LEAD_COUNT = 45;
const CONTACT_COUNT = 30;
const NOTE_COUNT = 26;
const TASK_COUNT = 34;

const personName = () => `${pick(FIRST)} ${pick(LAST)}`;
const emailFor = (name, domain) => {
  const [f, l] = name.split(" ");
  return `${slug(f)}.${slug(l)}@${domain}`;
};
const phone = () => `+1 415 ${rand(200, 999)} ${rand(1000, 9999)}`;

/* ---------- seed ---------- */
const run = async () => {
  await connectDB();

  // Change this email if you want to seed a different workspace.
  let user = await User.findOne({ email: "suryanshkhurana9@gmail.com" });

  if (user) {
    await Promise.all([
      Lead.deleteMany({ owner: user._id }),
      Contact.deleteMany({ owner: user._id }),
      Note.deleteMany({ owner: user._id }),
      Task.deleteMany({ owner: user._id }),
    ]);
  } else {
    user = await User.create({
      name: "Suryansh Khurana",
      email: "suryanshkhurana9@gmail.com",
      password: "Test@1234",
      company: "AI CRM",
    });
  }

  const owner = user._id;

  /* Leads */
  const stageOrder = { New: 0, Qualified: 0, Proposal: 0, Won: 0, Lost: 0 };
  const shuffledCompanies = pickSome(COMPANIES, COMPANIES.length);
  const leadDocs = [];

  for (let i = 0; i < LEAD_COUNT; i++) {
    const [company, domain] = shuffledCompanies[i % shuffledCompanies.length];
    const name = personName();
    const status = weighted([
      ["New", 26],
      ["Qualified", 22],
      ["Proposal", 22],
      ["Won", 18],
      ["Lost", 12],
    ]);
    const ageDays =
      status === "Won" || status === "Lost" ? rand(25, 180) : rand(0, 110);

    leadDocs.push({
      owner,
      name,
      email: emailFor(name, domain),
      phone: phone(),
      company,
      status,
      priority: weighted([
        ["High", 30],
        ["Medium", 50],
        ["Low", 20],
      ]),
      source: pick(SOURCES),
      value: rand(5, 350) * 1000,
      notes: pick(LEAD_NOTES),
      tags: pickSome(
        ["saas", "enterprise", "smb", "priority", "renewal"],
        rand(0, 2),
      ),
      order: stageOrder[status]++,
      createdAt: daysAgo(ageDays),
      updatedAt: daysAgo(rand(0, Math.min(ageDays, 14))),
    });
  }

  const leads = await Lead.insertMany(leadDocs);

  /* Contacts */
  const contactDocs = [];
  for (let i = 0; i < CONTACT_COUNT; i++) {
    const [company, domain] = pick(COMPANIES);
    const name = personName();

    contactDocs.push({
      owner,
      name,
      title: pick(TITLES),
      company,
      email: emailFor(name, domain),
      phone: phone(),
      tags: pickSome(TAGS, rand(1, 3)),
      favorite: Math.random() < 0.2,
      notes:
        Math.random() < 0.55
          ? pick([
              "Best reached after 3 PM.",
              "Prefers Slack or email over phone.",
              "Spoke at the SaaS Summit panel.",
              "Owns the vendor evaluation process.",
              "Introduced us to their CTO.",
            ])
          : "",
      createdAt: daysAgo(rand(0, 170)),
    });
  }
  await Contact.insertMany(contactDocs);

  /* Notes */
  const noteDocs = [];
  for (let i = 0; i < NOTE_COUNT; i++) {
    const lead = pick(leads);
    noteDocs.push({
      owner,
      content: pick(NOTE_TEMPLATES)(lead.company),
      lead: lead._id,
      pinned: Math.random() < 0.2,
      createdAt: daysAgo(rand(0, 100)),
    });
  }
  await Note.insertMany(noteDocs);

  /* Tasks */
  const taskDocs = [];
  for (let i = 0; i < TASK_COUNT; i++) {
    const lead = pick(leads);
    const bucket = weighted([
      ["overdue", 20],
      ["today", 14],
      ["upcoming", 44],
      ["completed", 22],
    ]);

    let dueDate;
    let status;
    let completedAt = null;

    if (bucket === "overdue") {
      dueDate = daysAgo(rand(1, 20));
      status = weighted([
        ["Pending", 55],
        ["In Progress", 45],
      ]);
    } else if (bucket === "today") {
      dueDate = new Date();
      status = weighted([
        ["Pending", 50],
        ["In Progress", 50],
      ]);
    } else if (bucket === "upcoming") {
      dueDate = daysAhead(rand(1, 35));
      status = weighted([
        ["Pending", 70],
        ["In Progress", 30],
      ]);
    } else {
      dueDate = daysAgo(rand(1, 25));
      status = "Completed";
      completedAt = daysAgo(rand(0, 12));
    }

    taskDocs.push({
      owner,
      title: pick(TASK_TEMPLATES)(lead.company),
      description: pick(TASK_DESCRIPTIONS),
      dueDate,
      status,
      priority: weighted([
        ["High", 30],
        ["Medium", 50],
        ["Low", 20],
      ]),
      relatedLead: lead._id,
      completedAt,
      createdAt: daysAgo(rand(0, 45)),
    });
  }
  await Task.insertMany(taskDocs);

  console.log("✅ Seed complete for Suryansh Khurana's workspace:");
  console.log(`   • ${leads.length} leads`);
  console.log(`   • ${contactDocs.length} contacts`);
  console.log(`   • ${noteDocs.length} notes`);
  console.log(`   • ${taskDocs.length} tasks`);
  console.log("   Login → suryanshkhurana9@gmail.com / Test@1234");

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
