import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import Home from "../client/src/pages/Home";
import { COMPANY, SERVICES, SERVICE_CITIES } from "../client/src/const";

const origin = "https://codysplumbingllc.com";
const out = "dist/public";
const index = readFileSync(join(out, "index.html"), "utf8");
const esc = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const json = (value: unknown) => JSON.stringify(value).replaceAll("<", "\\u003c");
const pathFor = (id: string) => `/services/${id}.html`;
const areas = SERVICE_CITIES.map(({ name }) => ({ "@type": "City", name: `${name}, Arizona` }));
const business = {
  "@context": "https://schema.org", "@type": "Plumber", "@id": `${origin}/#business`,
  name: COMPANY.name, url: `${origin}/`, telephone: "+1-928-303-3589",
  image: `${origin}${COMPANY.images.hero}`, logo: `${origin}${COMPANY.logoUrl}`,
  address: { "@type": "PostalAddress", streetAddress: "2470 E Neal Ave", addressLocality: "Kingman", addressRegion: "AZ", postalCode: "86409", addressCountry: "US" },
  areaServed: [...areas, { "@type": "AdministrativeArea", name: "Mohave County, Arizona" }],
  hasOfferCatalog: { "@type": "OfferCatalog", name: "Plumbing services", itemListElement: SERVICES.map((service) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: service.title, url: `${origin}${pathFor(service.id)}` } })) },
};

const searchTopics: Record<string, string[]> = {
  "emergency-repairs": ["Emergency plumber", "Burst pipe repair", "Water leak repair", "Sewer backup help"],
  "water-filtration": ["Water softener installation", "Reverse osmosis systems", "Whole-house water filtration", "Hard water treatment"],
  "water-heaters": ["Water heater repair", "Water heater replacement", "Tankless water heater installation", "No hot water troubleshooting"],
  "commercial-plumbing": ["Commercial plumber", "Business plumbing repairs", "Commercial water heaters", "Plumbing for property managers"],
  "drain-sewer": ["Drain cleaning", "Clogged drain repair", "Main sewer line clearing", "Toilet and sink drain clogs"],
  "repiping-fixtures": ["Whole-house repiping", "Pipe leak repair", "Faucet and sink installation", "Toilet repair and replacement"]
};
const locationTopics = ["Kingman", "Golden Valley", "Bullhead City", "Lake Havasu City", "Fort Mohave", "Mohave Valley"];

const details: Record<string, { title: string; intro: string; guidance: string; topics: string[] }> = {
  "emergency-repairs": {
    title: "Emergency Plumbing Repairs", intro: "A burst pipe, sudden water leak or sewer backup can interrupt your home or business without warning. Cody's Plumbing provides emergency plumbing service in Kingman and Mohave County, including urgent after-hours calls based on availability.",
    guidance: "For active flooding or an urgent plumbing problem, call dispatch directly to describe what is happening and arrange service. If you suspect a gas leak, leave the affected area and contact your gas utility or emergency services from a safe location.",
    topics: ["Burst pipes and water leaks", "Sewer backups and urgent drain blockages", "Emergency plumbing for homes and businesses"],
  },
  "water-filtration": {
    title: "Water Softeners & Water Filtration", intro: "Hard water can leave mineral deposits on fixtures and reduce the performance of household plumbing equipment. Cody's Plumbing installs water softeners and filtration systems for homes and businesses in Mohave County.",
    guidance: "If you're comparing a whole-house water softener, reverse osmosis drinking water system or other filtration options, we can discuss your water conditions, available space and installation needs before recommending a system.",
    topics: ["Whole-house water softeners", "Reverse osmosis drinking water systems", "Water filtration and hard-water scale concerns"],
  },
  "water-heaters": {
    title: "Water Heater Repair & Installation", intro: "No hot water, inconsistent temperatures or a leaking tank? Cody's Plumbing services tank and tankless water heaters in Kingman and surrounding Mohave County communities.",
    guidance: "A technician can assess your existing unit, explain repair and replacement options, and help you compare tank versus tankless systems based on your property and hot-water needs. Call to confirm availability for urgent service.",
    topics: ["Tank water heater repair and replacement", "Tankless water heater installation and service", "Hot water problems and maintenance"],
  },
  "commercial-plumbing": {
    title: "Commercial & Industrial Plumbing", intro: "Plumbing problems can affect business operations, tenants and customers. Cody's Plumbing provides commercial plumbing for businesses and commercial properties across Kingman and Mohave County.",
    guidance: "Tell us about your property, the equipment involved and your scheduling needs. We can discuss the scope of service, whether it is an urgent repair or a planned improvement, and provide a quote for the job.",
    topics: ["Commercial plumbing repairs and installations", "Backflow prevention and tenant improvements", "Restaurant, retail and multi-unit property plumbing"],
  },
  "drain-sewer": {
    title: "Drain Cleaning & Sewer Line Inspection", intro: "Slow drains, recurring clogs and sewer backups can signal a problem deeper in the drain line. Cody's Plumbing offers drain and sewer services to help identify blockages and restore proper drainage.",
    guidance: "We can discuss recurring clogs, root intrusion or buildup and recommend an appropriate clearing or repair approach. Contact us if several fixtures are backing up or the same drain keeps clogging.",
    topics: ["Clogged drains and main sewer line clearing", "Tree root intrusion and buildup removal", "Drain and sewer line blockage assessment"],
  },
  "repiping-fixtures": {
    title: "Repiping, Leak Repair & Plumbing Fixtures", intro: "From leaking pipes and worn-out plumbing to a dripping faucet or running toilet, Cody's Plumbing helps homeowners and businesses maintain reliable plumbing systems.",
    guidance: "If you have recurring pipe leaks or are replacing fixtures, a technician can assess the affected plumbing and explain repair or replacement options. Larger repiping projects require an on-site assessment to establish the scope.",
    topics: ["Copper and PEX repiping", "Pipe leaks, sinks, toilets and faucets", "Garbage disposal and fixture installation"],
  },
};

const css = `:root{color-scheme:dark;--cyan:#22d3ee;--bg:#080d1b;--panel:#111b2d}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:#e2e8f0;font:16px/1.65 system-ui,sans-serif}a{color:var(--cyan)}a:focus-visible{outline:2px solid var(--cyan);outline-offset:4px}.wrap{width:min(100% - 36px,980px);margin:auto}.ribbon{background:linear-gradient(90deg,#b91c1c,#075985);text-align:center;color:white;font-size:14px;padding:7px 12px}.ribbon a{color:white;font-weight:700}header{border-bottom:1px solid #28364b}header .wrap{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:12px 0}header img{width:112px;height:auto}header nav{display:flex;flex-wrap:wrap;gap:14px;font-size:14px}main{padding:36px 0 48px}h1,h2{line-height:1.14;color:white}h1{font-size:clamp(2rem,5vw,3.25rem);margin:.5rem 0 1rem}h2{font-size:1.5rem;margin-top:2rem}.kicker{color:var(--cyan);font-size:13px;text-transform:uppercase;letter-spacing:.1em;font-weight:700}.lead{font-size:1.1rem;color:#cbd5e1}.hero{display:grid;grid-template-columns:1.25fr 1fr;align-items:center;gap:28px}.hero img{width:100%;max-height:350px;object-fit:contain;background:var(--panel);border-radius:12px}.actions{display:flex;gap:12px;flex-wrap:wrap;margin:24px 0}.button{display:inline-block;padding:12px 18px;background:var(--cyan);color:#08111e;text-decoration:none;border-radius:8px;font-weight:800}.button.call{background:#dc2626;color:white}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}.cards a{background:var(--panel);border:1px solid #28364b;padding:16px;border-radius:10px;text-decoration:none}.cards a:hover{text-decoration:underline}footer{border-top:1px solid #28364b;padding:20px 0;color:#94a3b8;font-size:14px}@media(max-width:640px){.hero{grid-template-columns:1fr}.hero img{max-height:280px}header nav{gap:10px}.actions .button{width:100%;text-align:center}}`;

function Page({ title, description, pathname, image, schema, children }: { title: string; description: string; pathname: string; image: string; schema: unknown; children: React.ReactNode }) {
  return <html lang="en"><head><meta charSet="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>{title}</title><meta name="description" content={description}/><link rel="canonical" href={origin + pathname}/><meta property="og:type" content="website"/><meta property="og:title" content={title}/><meta property="og:description" content={description}/><meta property="og:url" content={origin + pathname}/><meta property="og:image" content={origin + image}/><link rel="icon" href="/favicon.ico"/><script type="application/ld+json" dangerouslySetInnerHTML={{__html:json(schema)}}/><style dangerouslySetInnerHTML={{__html:css}}/></head><body><div className="ribbon">Emergency Plumbing · <a href={`tel:${COMPANY.phoneRaw}`}>{COMPANY.phone}</a></div><header><div className="wrap"><a href="/"><img src={COMPANY.logoUrl} alt={COMPANY.name}/></a><nav aria-label="Main navigation"><a href="/">Home</a><a href="/#services">Services</a><a href="/service-area.html">Service area</a></nav></div></header><main className="wrap">{children}</main><footer><div className="wrap">{COMPANY.name} · {COMPANY.address} · AZ ROC #{COMPANY.rocPrimary} · <a href={`tel:${COMPANY.phoneRaw}`}>{COMPANY.phone}</a></div></footer></body></html>;
}

function ServiceLinks({ exclude }: { exclude?: string }) {
  return <div className="cards">{SERVICES.filter((s) => s.id !== exclude).map((s) => <a key={s.id} href={pathFor(s.id)}>{s.title}</a>)}</div>;
}

function Actions({ service }: { service?: string }) {
  return <div className="actions"><a className="button call" href={`tel:${COMPANY.phoneRaw}`}>Call {COMPANY.phone}</a><a className="button" href={service ? `/?service=${service}` : "/#services"}>Request service</a></div>;
}

mkdirSync(join(out, "services"), { recursive: true });
for (const service of SERVICES) {
  const detail = details[service.id];
  if (!detail) throw new Error(`Missing SEO content for ${service.id}`);
  const pathname = pathFor(service.id);
  const title = `${detail.title} in Kingman, AZ | Cody's Plumbing`;
  const schema = { "@context": "https://schema.org", "@graph": [business, { "@type": "Service", "@id": `${origin}${pathname}#service`, name: detail.title, description: detail.intro, url: origin + pathname, provider: { "@id": `${origin}/#business` }, areaServed: areas }] };
  const page = <Page title={title} description={service.shortDesc + " Serving Kingman and Mohave County, AZ."} pathname={pathname} image={service.image} schema={schema}><div className="hero"><div><p className="kicker">Cody's Plumbing · Kingman, AZ</p><h1>{detail.title}</h1><p className="lead">{detail.intro}</p><Actions service={service.id}/></div><img src={service.image} alt={`${service.title} project`} decoding="async"/></div><h2>How we can help</h2><ul>{detail.topics.map((topic) => <li key={topic}>{topic}</li>)}</ul><p>{detail.guidance}</p><h2>Serving Mohave County</h2><p>Based in Kingman, we serve Lake Havasu City, Bullhead City, Fort Mohave, Golden Valley and nearby communities. <a href="/service-area.html">See our service area.</a></p><h2>Plumbing service in Kingman, AZ</h2><p>Looking for {detail.title.toLowerCase()} in Kingman? Call <a href={`tel:${COMPANY.phoneRaw}`}>{COMPANY.phone}</a> to discuss the issue, service availability and the next steps. We also serve nearby Mohave County communities; appointments and emergency response depend on scheduling and location.</p><h2>Common plumbing problems and services</h2><p>Customers also contact us about these related plumbing needs:</p><ul>{searchTopics[service.id].map((topic) => <li key={topic}>{topic}</li>)}</ul><h2>Other plumbing services</h2><ServiceLinks exclude={service.id}/></Page>;
  writeFileSync(join(out, pathname.slice(1)), "<!doctype html>\n" + renderToStaticMarkup(page));
}

const areaPage = <Page title="Plumbing Service Areas | Kingman & Mohave County, AZ" description="Cody's Plumbing serves Kingman, Lake Havasu City, Bullhead City, Fort Mohave, Golden Valley and Mohave Valley with residential and commercial plumbing." pathname="/service-area.html" image={COMPANY.images.hero} schema={business}><p className="kicker">Local plumbing services</p><h1>Plumbers serving Kingman and Mohave County</h1><p className="lead">Cody's Plumbing, LLC is based in Kingman, Arizona. We serve homes and businesses throughout Mohave County. For an urgent issue, call our emergency plumbing line for availability.</p><Actions/><h2>Communities we serve</h2><div className="cards">{SERVICE_CITIES.map(({name}) => <div key={name}><h3>{name}, AZ</h3><p>Contact us to confirm availability for plumbing repairs, installations and service at your property.</p></div>)}</div><h2>Plumbing help across Mohave County</h2><p>Looking for a plumber in {locationTopics.join(", ")} or nearby? Call to confirm service availability for your location and plumbing needs.</p><h2>Find the service you need</h2><ServiceLinks/></Page>;
writeFileSync(join(out, "service-area.html"), "<!doctype html>\n" + renderToStaticMarkup(areaPage));

// Keep the admin entry independent of public marketing markup and search metadata.
const admin = index.replace(/<title>.*?<\/title>/s, "<title>Cody's Plumbing | Dispatch Sign-in</title>").replace(/<meta name="description"[^>]*>/, "<meta name=\"robots\" content=\"noindex,nofollow\"/>").replace(/<link rel="canonical"[^>]*>/, "");
writeFileSync(join(out, "admin.html"), admin);

// Serve the real React homepage as HTML to all visitors, then activate the existing app.
const homeMarkup = renderToStaticMarkup(<Home />);
const homeMetadata = `<script type="application/ld+json">${json(business)}</script><meta property="og:type" content="website"/><meta property="og:title" content="Cody's Plumbing | Kingman, AZ"/><meta property="og:description" content="Local residential and commercial plumbing, water heaters, drain cleaning and emergency plumbing service based on availability."/><meta property="og:url" content="${origin}/"/><meta property="og:image" content="${origin}${COMPANY.images.hero}"/>`;
if (!index.includes('<div id="root"></div>') || !homeMarkup.includes("Drain Cleaning")) throw new Error("Homepage prerender verification failed");
writeFileSync(join(out, "index.html"), index.replace("</head>", `${homeMetadata}</head>`).replace('<div id="root"></div>', () => `<div id="root">${homeMarkup}</div>`));

const urls = ["/", ...SERVICES.map((s) => pathFor(s.id)), "/service-area.html"];
writeFileSync(join(out, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((url) => `<url><loc>${esc(origin + url)}</loc></url>`).join("")}</urlset>\n`);
writeFileSync(join(out, "robots.txt"), `User-agent: *\nDisallow: /api/\nSitemap: ${origin}/sitemap.xml\n`);
writeFileSync(join(out, "404.html"), '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Page not found | Cody’s Plumbing</title></head><body><h1>Page not found</h1><p><a href="/">Return to Cody’s Plumbing</a></p></body></html>');
console.log(`SEO: prerendered homepage, ${SERVICES.length} services and service area, plus sitemap and private admin entry.`);
