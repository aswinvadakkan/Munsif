/**
 * Document preview generators.
 * Produces clean, semantic HTML from user form data
 * for live preview in the questionnaire and final PDF generation.
 */

import type { DocumentTemplate } from "./document-templates";

function getSelectLabel(
  value: string | undefined,
  options: { value: string; label: string }[] | undefined
): string {
  if (!value || !options) return esc(value || "—");
  const opt = options.find((o) => o.value === value);
  return esc(opt?.label ?? value);
}

function formatDate(value: string | undefined): string {
  if (!value) return "_______________";
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return esc(value);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return esc(value);
  }
}

function formatINR(value: string | undefined): string {
  if (!value) return "₹________";
  const num = Number(value);
  if (isNaN(num)) return esc(value);
  return "₹" + num.toLocaleString("en-IN");
}

function esc(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function todayFormatted(): string {
  return new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Generate a professional rental agreement preview as semantic HTML.
 */
export function buildRentalAgreementPreview(data: Record<string, string>): string {
  const today = todayFormatted();

  const parts: string[] = [];

  // Title
  parts.push(`<h1>RENTAL AGREEMENT</h1>`);
  parts.push(
    `<p>This Rental Agreement (hereinafter referred to as the "Agreement") is made and entered into on this ${today}, by and between:</p>`
  );

  // Parties table
  parts.push(`<h2>PARTIES</h2>`);
  parts.push(`<table class="parties">`);
  parts.push(`<tr><th style="width:50%">LANDLORD</th><th style="width:50%">TENANT</th></tr>`);
  parts.push(`<tr>`);
  parts.push(`<td><strong>Name:</strong> ${esc(data.landlordName || "_______________")}<br><strong>Address:</strong> ${esc(data.landlordAddress || "_______________")}</td>`);
  parts.push(`<td><strong>Name:</strong> ${esc(data.tenantName || "_______________")}<br><strong>Address:</strong> ${esc(data.tenantAddress || "_______________")}</td>`);
  parts.push(`</tr>`);
  parts.push(`</table>`);

  // Recital
  parts.push(`<p>WHEREAS the Landlord is the owner of the property described below and wishes to let out the same on rent, and the Tenant has agreed to take the property on rent on the terms and conditions hereinafter appearing.</p>`);
  parts.push(`<p><em>NOW THIS AGREEMENT WITNESSETH AS FOLLOWS:</em></p>`);

  // Property details
  parts.push(`<h2>1. PROPERTY DETAILS</h2>`);
  const propType = getSelectLabel(data.propertyType, [
    { value: "residential", label: "Residential" },
    { value: "commercial", label: "Commercial" },
  ]);
  const furnish = getSelectLabel(data.furnishing, [
    { value: "unfurnished", label: "Unfurnished" },
    { value: "semi-furnished", label: "Semi-Furnished" },
    { value: "fully-furnished", label: "Fully Furnished" },
  ]);
  parts.push(`<table class="terms">`);
  parts.push(`<tr><td>Address:</td><td>${esc(data.propertyAddress || "_______________")}</td></tr>`);
  parts.push(`<tr><td>Property Type:</td><td>${propType}</td></tr>`);
  parts.push(`<tr><td>Furnishing:</td><td>${furnish}</td></tr>`);
  parts.push(`</table>`);

  // Terms
  parts.push(`<h2>2. TERMS OF TENANCY</h2>`);
  parts.push(`<table class="terms">`);
  parts.push(`<tr><td>Monthly Rent:</td><td>${formatINR(data.monthlyRent)}</td></tr>`);
  parts.push(`<tr><td>Security Deposit:</td><td>${formatINR(data.securityDeposit)}</td></tr>`);
  parts.push(`<tr><td>Lease Start Date:</td><td>${formatDate(data.leaseStart)}</td></tr>`);
  parts.push(`<tr><td>Lease Duration:</td><td>${esc(data.leaseDuration || "__")} months</td></tr>`);
  parts.push(`<tr><td>Notice Period:</td><td>${esc(data.noticePeriod || "__")} days</td></tr>`);
  parts.push(`</table>`);

  // Additional clauses
  parts.push(`<h2>3. ADDITIONAL CLAUSES</h2>`);
  const petPolicy = getSelectLabel(data.petPolicy, [
    { value: "yes", label: "Pets Allowed" },
    { value: "no", label: "No Pets Allowed" },
  ]);
  const subletting = getSelectLabel(data.subletting, [
    { value: "yes", label: "Subletting Allowed" },
    { value: "no", label: "Subletting Not Allowed" },
  ]);
  const maintenance = getSelectLabel(data.maintenance, [
    { value: "landlord", label: "Landlord" },
    { value: "tenant", label: "Tenant" },
    { value: "shared", label: "Shared" },
  ]);
  parts.push(`<table class="terms">`);
  parts.push(`<tr><td>Pet Policy:</td><td>${petPolicy}</td></tr>`);
  parts.push(`<tr><td>Subletting:</td><td>${subletting}</td></tr>`);
  parts.push(`<tr><td>Maintenance Responsibility:</td><td>${maintenance}</td></tr>`);
  if (data.specialConditions) {
    parts.push(`<tr><td>Special Conditions:</td><td>${esc(data.specialConditions)}</td></tr>`);
  }
  parts.push(`</table>`);

  // Legal reference
  parts.push(`<p class="ica-ref">This Agreement is governed by the provisions of the Indian Contract Act, 1872 and applicable state-specific rent control legislation. Stamp duty as applicable under the Indian Stamp Act, 1899 and relevant state stamp acts shall be borne by the Tenant.</p>`);

  // Signatures
  parts.push(`<div class="signature-block">`);
  parts.push(`<p>IN WITNESS WHEREOF, the parties hereto have signed this Agreement on the date first above written.</p>`);
  parts.push(`<div class="signatures-row">`);
  parts.push(`<div class="signature-line"><div class="line"></div><div class="label">Landlord</div></div>`);
  parts.push(`<div class="signature-line"><div class="line"></div><div class="label">Tenant</div></div>`);
  parts.push(`</div>`);
  parts.push(`</div>`);

  return parts.join("\n");
}

/**
 * Generate a professional NDA preview as semantic HTML.
 */
export function buildNDAPreview(data: Record<string, string>): string {
  const today = todayFormatted();

  const parts: string[] = [];

  // Title
  parts.push(`<h1>NON-DISCLOSURE AGREEMENT</h1>`);
  parts.push(
    `<p>This Non-Disclosure Agreement (hereinafter referred to as the "Agreement") is made and entered into on this ${today}, by and between:</p>`
  );

  // Parties table
  parts.push(`<h2>PARTIES</h2>`);
  parts.push(`<table class="parties">`);
  parts.push(`<tr><th style="width:50%">DISCLOSING PARTY</th><th style="width:50%">RECEIVING PARTY</th></tr>`);
  parts.push(`<tr>`);
  parts.push(`<td><strong>Name:</strong> ${esc(data.disclosingParty || "_______________")}<br><strong>Address:</strong> ${esc(data.disclosingPartyAddress || "_______________")}</td>`);
  parts.push(`<td><strong>Name:</strong> ${esc(data.receivingParty || "_______________")}<br><strong>Address:</strong> ${esc(data.receivingPartyAddress || "_______________")}</td>`);
  parts.push(`</tr>`);
  parts.push(`</table>`);

  // Recital
  parts.push(
    `<p>WHEREAS the Disclosing Party possesses certain confidential and proprietary information which it desires to disclose to the Receiving Party for a specified purpose, and the Receiving Party is willing to receive such information subject to the terms and conditions set forth herein.</p>`
  );
  parts.push(`<p><em>NOW THEREFORE, in consideration of the mutual promises and covenants contained herein, the parties agree as follows:</em></p>`);

  // Scope
  parts.push(`<h2>1. PURPOSE &amp; SCOPE</h2>`);
  const stateOpts = [
    { value: "maharashtra", label: "Maharashtra" },
    { value: "delhi", label: "Delhi (NCT)" },
    { value: "karnataka", label: "Karnataka" },
    { value: "tamil-nadu", label: "Tamil Nadu" },
    { value: "telangana", label: "Telangana" },
    { value: "gujarat", label: "Gujarat" },
    { value: "uttar-pradesh", label: "Uttar Pradesh" },
    { value: "west-bengal", label: "West Bengal" },
    { value: "rajasthan", label: "Rajasthan" },
    { value: "kerala", label: "Kerala" },
    { value: "haryana", label: "Haryana" },
    { value: "punjab", label: "Punjab" },
    { value: "madhya-pradesh", label: "Madhya Pradesh" },
    { value: "bihar", label: "Bihar" },
    { value: "odisha", label: "Odisha" },
    { value: "assam", label: "Assam" },
    { value: "chhattisgarh", label: "Chhattisgarh" },
    { value: "jharkhand", label: "Jharkhand" },
    { value: "uttarakhand", label: "Uttarakhand" },
    { value: "himachal-pradesh", label: "Himachal Pradesh" },
    { value: "goa", label: "Goa" },
    { value: "andhra-pradesh", label: "Andhra Pradesh" },
    { value: "arunachal-pradesh", label: "Arunachal Pradesh" },
    { value: "manipur", label: "Manipur" },
    { value: "meghalaya", label: "Meghalaya" },
    { value: "mizoram", label: "Mizoram" },
    { value: "nagaland", label: "Nagaland" },
    { value: "sikkim", label: "Sikkim" },
    { value: "tripura", label: "Tripura" },
    { value: "chandigarh", label: "Chandigarh" },
    { value: "puducherry", label: "Puducherry" },
  ];
  const gs = getSelectLabel(data.governingState, stateOpts);

  parts.push(`<table class="terms">`);
  parts.push(`<tr><td>Purpose of Disclosure:</td><td>${esc(data.purpose || "_______________")}</td></tr>`);
  parts.push(`<tr><td>Confidentiality Duration:</td><td>${esc(data.duration || "__")} months from the date hereof</td></tr>`);
  parts.push(`<tr><td>Governing Law:</td><td>State of ${gs}</td></tr>`);
  parts.push(`</table>`);

  // Additional terms
  parts.push(`<h2>2. ADDITIONAL TERMS</h2>`);
  const nonSolicit = getSelectLabel(data.nonSolicitation, [
    { value: "yes", label: "Included" },
    { value: "no", label: "Not Included" },
  ]);
  const nonCompete = getSelectLabel(data.nonCompete, [
    { value: "yes", label: "Included" },
    { value: "no", label: "Not Included" },
  ]);
  const remedies = getSelectLabel(data.remediesClause, [
    { value: "standard", label: "Standard (Injunction + Damages)" },
    { value: "arbitration", label: "Arbitration" },
  ]);
  parts.push(`<table class="terms">`);
  parts.push(`<tr><td>Non-Solicitation Clause:</td><td>${nonSolicit}</td></tr>`);
  parts.push(`<tr><td>Non-Compete Clause:</td><td>${nonCompete}</td></tr>`);
  parts.push(`<tr><td>Remedies:</td><td>${remedies}</td></tr>`);
  if (data.specialConditions) {
    parts.push(`<tr><td>Special Conditions:</td><td>${esc(data.specialConditions)}</td></tr>`);
  }
  parts.push(`</table>`);

  // Confidential Information
  parts.push(`<h2>3. CONFIDENTIAL INFORMATION</h2>`);
  parts.push(
    `<p>The Receiving Party agrees to hold all Confidential Information in strict confidence, not to disclose it to any third party, and to use it solely for the Purpose described herein. "Confidential Information" shall include all information, whether oral, written, or in any other form, disclosed by the Disclosing Party to the Receiving Party.</p>`
  );

  // Governing law
  parts.push(`<h2>4. GOVERNING LAW &amp; JURISDICTION</h2>`);
  parts.push(`<p>This Agreement shall be governed by and construed in accordance with the laws of India. Any disputes arising out of this Agreement shall be subject to the exclusive jurisdiction of the courts in ${gs}.</p>`);
  parts.push(`<p class="ica-ref">Reference: Indian Contract Act, 1872 — Sections pertaining to lawful object, consideration, and agreements in restraint of trade (Section 27). The confidentiality obligations herein are reasonable and limited in scope and duration.</p>`);

  // Signatures
  parts.push(`<div class="signature-block">`);
  parts.push(`<p>IN WITNESS WHEREOF, the parties hereto have executed this Agreement on the date first above written.</p>`);
  parts.push(`<div class="signatures-row">`);
  parts.push(`<div class="signature-line"><div class="line"></div><div class="label">Disclosing Party</div></div>`);
  parts.push(`<div class="signature-line"><div class="line"></div><div class="label">Receiving Party</div></div>`);
  parts.push(`</div>`);
  parts.push(`</div>`);

  return parts.join("\n");
}

/**
 * Generate a preview document given a template and form data.
 * Falls back to a generic field-based format for templates without a custom builder.
 */
export function generateDocumentPreview(
  template: DocumentTemplate,
  data: Record<string, string>
): string {
  switch (template.id) {
    case "rental-agreement":
      return buildRentalAgreementPreview(data);
    case "nda":
      return buildNDAPreview(data);
    default:
      return buildGenericPreview(template, data);
  }
}

/**
 * Generic field-based preview for templates without a custom builder.
 */
function buildGenericPreview(
  template: DocumentTemplate,
  data: Record<string, string>
): string {
  const today = todayFormatted();

  const parts: string[] = [];
  parts.push(`<h1>${esc(template.name.toUpperCase())}</h1>`);
  parts.push(`<p><em>Generated on: ${today}</em></p>`);

  for (const step of template.formSteps) {
    const filledFields = step.fields.filter((f) => data[f.id]);
    if (filledFields.length === 0) continue;

    parts.push(`<h2>${esc(step.title.toUpperCase())}</h2>`);
    parts.push(`<table class="terms">`);
    for (const field of filledFields) {
      let value = data[field.id];
      if (field.type === "select" && field.options) {
        value = getSelectLabel(value, field.options);
      } else if (field.type === "date") {
        value = formatDate(value);
      } else if (field.type === "number" && field.label.toLowerCase().includes("₹")) {
        value = formatINR(value);
      } else {
        value = esc(value);
      }
      parts.push(`<tr><td>${esc(field.label)}:</td><td>${value}</td></tr>`);
    }
    parts.push(`</table>`);
  }

  return parts.join("\n");
}
