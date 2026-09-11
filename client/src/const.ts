export const COMPANY = {
  name: "Cody's Plumbing, LLC",
  shortName: "Cody's Plumbing",
  phone: "(928) 303-3589",
  phoneRaw: "9283033589",
  emergencyPhone: "(928) 303-3589",
  address: "2470 E Neal Ave, Kingman, AZ 86409",
  serviceArea: "Kingman, Lake Havasu City, Bullhead City, Fort Mohave & Mohave County, AZ",
  rocPrimary: "338378",
  rocSecondary: "279673",
  rocClassification: "CR-37 Plumbing (Commercial & Residential)",
  rocStatus: "Active & Verified",
  rocVerifyUrl: "https://checkcontractorlicense.com/az/plumbing-contractors/kingman/",
  hours: "24 Hours / 7 Days a Week Emergency Service",
  officeHours: "Monday – Friday: 7:00 AM – 6:00 PM | Sat: 8:00 AM – 2:00 PM | 24/7 Rapid Response",
  logoUrl: "/assets/codys-plumbing-logo.png",
  iconUrl: "/assets/codys-icon-512.png",
  images: {
    hero: "/assets/hero-plumber-truck.jpg",
    waterHeater: "/assets/water-heater-install.jpg",
    waterFiltration: "/assets/water-filtration-ro.jpg",
    commercial: "/assets/commercial-plumbing.jpg",
    pipeRepair: "/assets/emergency-pipe-repair.jpg",
    drainCamera: "/assets/drain-camera-inspection.jpg",
  }
};

export const SERVICES = [
  {
    id: "emergency-repairs",
    title: "24/7 Emergency Plumbing",
    shortDesc: "Burst pipes, active floods, sewer backups, and urgent gas leaks dispatched immediately.",
    image: COMPANY.images.pipeRepair,
    badge: "24/7 Rapid Response",
    features: [
      "Average Kingman/Havasu arrival under 45 mins",
      "Immediate mainline water shut-off & damage mitigation",
      "High-pressure leak diagnostic cameras",
      "No overtime surge surprises on diagnostics"
    ],
    pricingGuide: "Starting from $185 diagnostic & dispatch"
  },
  {
    id: "water-filtration",
    title: "Water Filtration & Softeners",
    shortDesc: "Tame harsh Arizona hard water with commercial-grade water softeners and multi-stage reverse osmosis.",
    image: COMPANY.images.waterFiltration,
    badge: "Mohave County Specialty",
    features: [
      "Custom multi-stage Whole-House Softener systems",
      "Under-sink 5-stage Reverse Osmosis (RO) drinking systems",
      "Scale prevention for water heaters & high-end fixtures",
      "Free in-home water hardness & purity testing"
    ],
    pricingGuide: "RO systems from $495 • Softeners from $1,250"
  },
  {
    id: "water-heaters",
    title: "Tank & Tankless Water Heaters",
    shortDesc: "Same-day installation, rapid replacement, burner repair, and power flushing for all major brands.",
    image: COMPANY.images.waterHeater,
    badge: "Same-Day Replacement",
    features: [
      "Rinnai, Navien, Bradford White & Rheem certified",
      "High-efficiency Tankless conversions for endless hot water",
      "Safe gas line and thermal expansion valve upgrades",
      "Old unit removal and disposal included"
    ],
    pricingGuide: "Standard repairs from $175 • New tanks from $1,450"
  },
  {
    id: "commercial-plumbing",
    title: "Commercial & Industrial Systems",
    shortDesc: "Full-scale commercial plumbing, RPZ backflow preventers, tenant improvements, and restaurant grease interceptors.",
    image: COMPANY.images.commercial,
    badge: "ROC #338378 Commercial",
    features: [
      "Backflow prevention testing, rebuilds & certifications",
      "Commercial hydro-jetting & heavy grease trap plumbing",
      "Multi-unit apartment and retail tenant plumbing",
      "Code compliance and city permit processing"
    ],
    pricingGuide: "Commercial contract bidding & scheduled maintenance"
  },
  {
    id: "drain-sewer",
    title: "Drain Cleaning & Camera Inspection",
    shortDesc: "Full color HD video sewer line diagnostics, motorized snaking, and high-pressure hydro-jet root removal.",
    image: COMPANY.images.drainCamera,
    badge: "HD Video Diagnostics",
    features: [
      "See the blockage with your own eyes on color HD monitor",
      "Tough tree root cutting and scale scouring",
      "Trenchless pipe lining and spot sewer line repairs",
      "Free camera review with any main line clearing"
    ],
    pricingGuide: "Drain clearing specials starting at $99"
  },
  {
    id: "repiping-fixtures",
    title: "Repiping, Sinks, Fixtures & Toilets",
    shortDesc: "Complete copper and Uponor PEX re-piping, garbage disposals, luxury faucet installs, and slab leak detection.",
    image: COMPANY.images.hero,
    badge: "Licensed & Bonded",
    features: [
      "Durable Uponor PEX repipes with lifetime material warranty",
      "Precision acoustic and thermal slab leak pinpointing",
      "High-output quiet garbage disposal installations",
      "Low-flow commercial and residential luxury fixtures"
    ],
    pricingGuide: "Fixture installs from $145"
  }
];

export const SERVICE_CITIES = [
  { name: "Kingman", zip: "86401, 86409", type: "Headquarters & Rapid Dispatch" },
  { name: "Lake Havasu City", zip: "86403, 86404, 86406", type: "Full Service & Water Filtration Hub" },
  { name: "Bullhead City", zip: "86429, 86442", type: "Commercial & Residential Dispatch" },
  { name: "Fort Mohave", zip: "86426", type: "Residential & Emergency Service" },
  { name: "Golden Valley", zip: "86413", type: "Full Service Route" },
  { name: "Mohave Valley", zip: "86440", type: "Full Service Route" }
];

export const TESTIMONIALS = [
  {
    name: "Marcus Sterling",
    location: "Kingman, AZ",
    service: "Emergency Slab Leak Repair",
    rating: 5,
    text: "Cody's Plumbing is the real deal. Woke up on a Sunday morning with hot water pooling near the hallway baseboard. They had a technician at my house in 35 minutes with acoustic listening gear, found the slab leak, bypassed the damaged line, and saved our hardwood floors. Best plumbing experience in Mohave County!"
  },
  {
    name: "Elena Rostova",
    location: "Lake Havasu City, AZ",
    service: "Whole-Home Water Softener & RO",
    rating: 5,
    text: "Our tap water was destroying our faucets and leaving white crust everywhere. Cody's installed a commercial-grade water softener and reverse osmosis drinking station. The water tastes incredible now and no more lime buildup! Licensed ROC contractor you can genuinely trust."
  },
  {
    name: "Dave Henderson",
    location: "Bullhead City, AZ (Commercial)",
    service: "Restaurant Backflow & Grease Line",
    rating: 5,
    text: "I manage two dining establishments in the tri-state area. Cody's handles our annual backflow preventer certifications and commercial hydrojetting. They show up on schedule, provide certified documentation for the city, and keep us code compliant. ROC #338378 gives total peace of mind."
  },
  {
    name: "Patricia Miller",
    location: "Golden Valley, AZ",
    service: "Tankless Water Heater Installation",
    rating: 5,
    text: "Replaced our old 50-gallon tank with a modern Rinnai tankless unit. The installation is a work of art—straight copper pipes, secure gas fitting, clean electrical conduit. Friendly, polite, and left the utility closet cleaner than they found it!"
  }
];
