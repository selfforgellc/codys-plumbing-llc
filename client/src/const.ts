export const COMPANY = {
  name: "Cody's Plumbing, LLC",
  shortName: "Cody's Plumbing",
  phone: "(928) 303-3589",
  phoneRaw: "9283033589",
  emergencyPhone: "(928) 303-3589",
  address: "2470 E Neal Ave, Kingman, AZ 86409",
  serviceArea: "Kingman, Lake Havasu City, Bullhead City, Fort Mohave & Mohave County, AZ",
  rocPrimary: "338378",
  rocClassification: "CR-37 Plumbing (Commercial & Residential)",
  rocStatus: "Active",
  rocVerifyUrl: "https://roc.az.gov/",
  hours: "Monday–Friday, 9 AM–5 PM; after-hours emergencies by availability",
  officeHours: "Monday–Friday: 9:00 AM–5:00 PM | After-hours emergencies subject to availability",
  logoUrl: "/assets/codys-plumbing-logo.webp",
  iconUrl: "/assets/codys-icon-512.png",
  images: {
    hero: "/assets/cody-real-plumbing.jpg",
    waterHeater: "/assets/tankless-water-heater-project.jpg",
    waterFiltration: "/assets/water-filtration-project.jpg",
    commercial: "/assets/commercial-plumbing-project.jpg",
    pipeRepair: "/assets/emergency-plumbing.webp",
    drainCamera: "/assets/drain-cleaning-project.jpg",
  }
};

export const SERVICES = [
  {
    id: "emergency-repairs",
    title: "Emergency Plumbing Repairs",
    shortDesc: "Urgent plumbing repairs for burst pipes, water leaks, and sewer backups; after-hours response based on availability.",
    image: COMPANY.images.pipeRepair,
    badge: "Emergency Service Available",
    features: [
      "Call to confirm response time and availability",
      "Water shut-off guidance and leak repairs",
      "Leak and plumbing problem assessment",
      "Discuss service fees before scheduling"
    ],
    pricingGuide: "Call for current service pricing"
  },
  {
    id: "water-filtration",
    title: "Water Filtration & Softeners",
    shortDesc: "Water softener and reverse osmosis filtration installation for Kingman and Mohave County homes and businesses.",
    image: COMPANY.images.waterFiltration,
    badge: "Mohave County Specialty",
    features: [
      "Custom multi-stage Whole-House Softener systems",
      "Under-sink 5-stage Reverse Osmosis (RO) drinking systems",
      "Scale prevention for water heaters & high-end fixtures",
      "Water treatment options discussed during consultation"
    ],
    pricingGuide: "Call for current installation pricing"
  },
  {
    id: "water-heaters",
    title: "Tank & Tankless Water Heaters",
    shortDesc: "Water heater troubleshooting, repairs, replacement, and tankless installation subject to scheduling.",
    image: COMPANY.images.waterHeater,
    badge: "Water Heater Service",
    features: [
      "Service for a range of tank and tankless water heater models",
      "High-efficiency Tankless conversions for endless hot water",
      "Safe gas line and thermal expansion valve upgrades",
      "Discuss removal and disposal when requesting a quote"
    ],
    pricingGuide: "Call for current repair and replacement quotes"
  },
  {
    id: "commercial-plumbing",
    title: "Commercial & Industrial Systems",
    shortDesc: "Commercial plumbing repairs, installations, and maintenance for businesses and properties across Mohave County.",
    image: COMPANY.images.commercial,
    badge: "ROC #338378 Commercial",
    features: [
      "Backflow prevention service inquiries",
      "Commercial hydro-jetting & heavy grease trap plumbing",
      "Multi-unit apartment and retail tenant plumbing",
      "Discuss permit requirements for planned projects"
    ],
    pricingGuide: "Commercial contract bidding & scheduled maintenance"
  },
  {
    id: "drain-sewer",
    title: "Drain Cleaning & Inspection",
    shortDesc: "Clear clogged drains and sewer lines, remove stubborn roots and buildup, and restore proper water flow.",
    image: COMPANY.images.drainCamera,
    badge: "Drain & Sewer Service",
    features: [
      "Drain and sewer line blockage assessment",
      "Tough tree root cutting and scale scouring",
      "Discuss sewer line repair options after assessment",
      "Main line clearing and blockage removal"
    ],
    pricingGuide: "Call for drain cleaning pricing"
  },
  {
    id: "repiping-fixtures",
    title: "Repiping, Sinks, Fixtures & Toilets",
    shortDesc: "Copper and PEX repiping, leak repairs, garbage disposals, sinks, faucets, and toilet installations.",
    image: "/assets/repiping-project.jpg",
    badge: "Licensed & Bonded",
    features: [
      "Copper and PEX repiping options",
      "Assessment of suspected hidden plumbing leaks",
      "High-output quiet garbage disposal installations",
      "Low-flow commercial and residential luxury fixtures"
    ],
    pricingGuide: "Call for fixture installation pricing"
  }
];

export const SERVICE_CITIES = [
  { name: "Kingman", zip: "86401, 86409", type: "Kingman service area" },
  { name: "Lake Havasu City", zip: "86403, 86404, 86406", type: "Plumbing service area" },
  { name: "Bullhead City", zip: "86429, 86442", type: "Plumbing service area" },
  { name: "Fort Mohave", zip: "86426", type: "Plumbing service area" },
  { name: "Golden Valley", zip: "86413", type: "Plumbing service area" },
  { name: "Mohave Valley", zip: "86440", type: "Full Service Route" }
];

export const TESTIMONIALS: { name: string; location: string; service: string; rating: number; text: string }[] = [];
