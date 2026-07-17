/**
 * Document preview generators.
 * Produces clean, legal-document-formatted text from user form data
 * for live preview in the questionnaire and final preview page.
 */

import type { DocumentTemplate } from "./document-templates";

function getSelectLabel(
  value: string | undefined,
  options: { value: string; label: string }[] | undefined
): string {
  if (!value || !options) return value || "—";
  const opt = options.find((o) => o.value === value);
  return opt?.label ?? value;
}

function formatDate(value: string | undefined): string {
  if (!value) return "_______________";
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return value;
  }
}

function formatINR(value: string | undefined): string {
  if (!value) return "₹________";
  const num = Number(value);
  if (isNaN(num)) return value;
  return "₹" + num.toLocaleString("en-IN");
}

/**
 * Generate a professional rental agreement preview.
 */
export function buildRentalAgreementPreview(data: Record<string, string>): string {
  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const lines: string[] = [];

  lines.push("RENTAL AGREEMENT");
  lines.push("");
  lines.push(
    `This Rental Agreement (hereinafter referred to as the "Agreement") is made and entered into on this ${today}, by and between:`
  );
  lines.push("");

  // Parties
  lines.push("LANDLORD:");
  lines.push(`  ${data.landlordName || "_______________"}`);
  lines.push(`  ${data.landlordAddress || "_______________"}`);
  lines.push("");
  lines.push("AND");
  lines.push("");
  lines.push("TENANT:");
  lines.push(`  ${data.tenantName || "_______________"}`);
  lines.push(`  ${data.tenantAddress || "_______________"}`);
  lines.push("");

  lines.push(
    "WHEREAS the Landlord is the owner of the property described below and wishes to let out the same on rent, and the Tenant has agreed to take the property on rent on the terms and conditions hereinafter appearing."
  );
  lines.push("");

  lines.push("NOW THIS AGREEMENT WITNESSETH AS FOLLOWS:");
  lines.push("");

  // Property
  lines.push("1. PROPERTY DETAILS");
  lines.push(`   Address: ${data.propertyAddress || "_______________"}`);
  const propType = getSelectLabel(data.propertyType, [
    { value: "residential", label: "Residential" },
    { value: "commercial", label: "Commercial" },
  ]);
  lines.push(`   Type: ${propType}`);
  const furnish = getSelectLabel(data.furnishing, [
    { value: "unfurnished", label: "Unfurnished" },
    { value: "semi-furnished", label: "Semi-Furnished" },
    { value: "fully-furnished", label: "Fully Furnished" },
  ]);
  lines.push(`   Furnishing: ${furnish}`);
  lines.push("");

  // Terms
  lines.push("2. TERMS OF TENANCY");
  lines.push(`   Monthly Rent: ${formatINR(data.monthlyRent)}`);
  lines.push(`   Security Deposit: ${formatINR(data.securityDeposit)}`);
  lines.push(`   Lease Start Date: ${formatDate(data.leaseStart)}`);
  lines.push(`   Lease Duration: ${data.leaseDuration || "__"} months`);
  lines.push(`   Notice Period: ${data.noticePeriod || "__"} days`);
  lines.push("");

  // Clauses
  lines.push("3. ADDITIONAL CLAUSES");
  const petPolicy = getSelectLabel(data.petPolicy, [
    { value: "yes", label: "Pets Allowed" },
    { value: "no", label: "No Pets Allowed" },
  ]);
  lines.push(`   Pet Policy: ${petPolicy}`);
  const subletting = getSelectLabel(data.subletting, [
    { value: "yes", label: "Subletting Allowed" },
    { value: "no", label: "Subletting Not Allowed" },
  ]);
  lines.push(`   Subletting: ${subletting}`);
  const maintenance = getSelectLabel(data.maintenance, [
    { value: "landlord", label: "Landlord" },
    { value: "tenant", label: "Tenant" },
    { value: "shared", label: "Shared" },
  ]);
  lines.push(`   Maintenance Responsibility: ${maintenance}`);
  if (data.specialConditions) {
    lines.push(`   Special Conditions: ${data.specialConditions}`);
  }
  lines.push("");

  // Signatures
  lines.push("IN WITNESS WHEREOF, the parties hereto have signed this Agreement on the date first above written.");
  lines.push("");
  lines.push("_________________________          _________________________");
  lines.push("     (Landlord)                          (Tenant)");
  lines.push("");

  return lines.join("\n");
}

/**
 * Generate a professional NDA preview.
 */
export function buildNDAPreview(data: Record<string, string>): string {
  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const lines: string[] = [];

  lines.push("NON-DISCLOSURE AGREEMENT");
  lines.push("");
  lines.push(
    `This Non-Disclosure Agreement (hereinafter referred to as the "Agreement") is made and entered into on this ${today}, by and between:`
  );
  lines.push("");

  // Parties
  lines.push("DISCLOSING PARTY:");
  lines.push(`  ${data.disclosingParty || "_______________"}`);
  lines.push(`  ${data.disclosingPartyAddress || "_______________"}`);
  lines.push("");
  lines.push("AND");
  lines.push("");
  lines.push("RECEIVING PARTY:");
  lines.push(`  ${data.receivingParty || "_______________"}`);
  lines.push(`  ${data.receivingPartyAddress || "_______________"}`);
  lines.push("");

  lines.push(
    "WHEREAS the Disclosing Party possesses certain confidential and proprietary information which it desires to disclose to the Receiving Party for a specified purpose, and the Receiving Party is willing to receive such information subject to the terms and conditions set forth herein."
  );
  lines.push("");

  lines.push("NOW THEREFORE, in consideration of the mutual promises and covenants contained herein, the parties agree as follows:");
  lines.push("");

  // Scope
  lines.push("1. PURPOSE & SCOPE");
  lines.push(`   Purpose of Disclosure: ${data.purpose || "_______________"}`);
  lines.push(`   Confidentiality Duration: ${data.duration || "__"} months from the date hereof`);
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
  lines.push(`   Governing Law: State of ${getSelectLabel(data.governingState, stateOpts)}`);
  lines.push("");

  // Terms
  lines.push("2. ADDITIONAL TERMS");
  const nonSolicit = getSelectLabel(data.nonSolicitation, [
    { value: "yes", label: "Included" },
    { value: "no", label: "Not Included" },
  ]);
  lines.push(`   Non-Solicitation Clause: ${nonSolicit}`);
  const nonCompete = getSelectLabel(data.nonCompete, [
    { value: "yes", label: "Included" },
    { value: "no", label: "Not Included" },
  ]);
  lines.push(`   Non-Compete Clause: ${nonCompete}`);
  const remedies = getSelectLabel(data.remediesClause, [
    { value: "standard", label: "Standard (Injunction + Damages)" },
    { value: "arbitration", label: "Arbitration" },
  ]);
  lines.push(`   Remedies: ${remedies}`);
  if (data.specialConditions) {
    lines.push(`   Special Conditions: ${data.specialConditions}`);
  }
  lines.push("");

  lines.push("3. CONFIDENTIAL INFORMATION");
  lines.push(
    '   The Receiving Party agrees to hold all Confidential Information in strict confidence, not to disclose it to any third party, and to use it solely for the Purpose described herein. "Confidential Information" shall include all information, whether oral, written, or in any other form, disclosed by the Disclosing Party to the Receiving Party.'
  );
  lines.push("");

  lines.push("4. GOVERNING LAW & JURISDICTION");
  const gs = getSelectLabel(data.governingState, stateOpts);
  lines.push(`   This Agreement shall be governed by and construed in accordance with the laws of India. Any disputes arising out of this Agreement shall be subject to the exclusive jurisdiction of the courts in ${gs}.`);
  lines.push("");

  // Signatures
  lines.push("IN WITNESS WHEREOF, the parties hereto have executed this Agreement on the date first above written.");
  lines.push("");
  lines.push("_________________________          _________________________");
  lines.push("  (Disclosing Party)                   (Receiving Party)");
  lines.push("");

  return lines.join("\n");
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
  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const lines: string[] = [];
  lines.push(template.name.toUpperCase());
  lines.push("");
  lines.push(`Generated on: ${today}`);
  lines.push("");

  for (const step of template.formSteps) {
    const filledFields = step.fields.filter((f) => data[f.id]);
    if (filledFields.length === 0) continue;

    lines.push(`— ${step.title.toUpperCase()} —`);
    lines.push("");

    for (const field of filledFields) {
      let value = data[field.id];
      if (field.type === "select" && field.options) {
        value = getSelectLabel(value, field.options);
      } else if (field.type === "date") {
        value = formatDate(value);
      } else if (field.type === "number" && field.label.toLowerCase().includes("₹")) {
        value = formatINR(value);
      }
      lines.push(`  ${field.label}: ${value}`);
    }

    lines.push("");
  }

  return lines.join("\n");
}
