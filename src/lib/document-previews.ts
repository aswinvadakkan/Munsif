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

// ============================================================
// 1. RENTAL AGREEMENT PREVIEW
// ============================================================
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

// ============================================================
// 2. NDA PREVIEW
// ============================================================
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

// ============================================================
// 3. EMPLOYMENT CONTRACT PREVIEW
// ============================================================
export function buildEmploymentContractPreview(data: Record<string, string>): string {
  const today = todayFormatted();

  const parts: string[] = [];

  parts.push(`<h1>EMPLOYMENT CONTRACT</h1>`);
  parts.push(`<p>This Employment Contract (hereinafter referred to as the "Agreement") is made and entered into on this ${today}, by and between:</p>`);

  // Parties table
  parts.push(`<h2>PARTIES</h2>`);
  parts.push(`<table class="parties">`);
  parts.push(`<tr><th style="width:50%">EMPLOYER</th><th style="width:50%">EMPLOYEE</th></tr>`);
  parts.push(`<tr>`);
  parts.push(`<td><strong>Name:</strong> ${esc(data.employerName || "_______________")}<br><strong>Address:</strong> ${esc(data.employerAddress || "_______________")}</td>`);
  parts.push(`<td><strong>Name:</strong> ${esc(data.employeeName || "_______________")}<br><strong>Address:</strong> ${esc(data.employeeAddress || "_______________")}</td>`);
  parts.push(`</tr>`);
  parts.push(`</table>`);

  // Recital
  parts.push(`<p>WHEREAS the Employer is engaged in the business of [business description] and desires to employ the Employee, and the Employee has agreed to serve the Employer on the terms and conditions hereinafter set forth.</p>`);
  parts.push(`<p><em>NOW THEREFORE, it is mutually agreed as follows:</em></p>`);

  // Section 1: Position
  parts.push(`<h2>1. POSITION &amp; COMMENCEMENT</h2>`);
  const employmentType = getSelectLabel(data.employmentType, [
    { value: "full-time", label: "Full-Time" },
    { value: "part-time", label: "Part-Time" },
    { value: "contract", label: "Contract" },
  ]);
  parts.push(`<table class="terms">`);
  parts.push(`<tr><td>Job Title:</td><td>${esc(data.jobTitle || "_______________")}</td></tr>`);
  parts.push(`<tr><td>Employment Type:</td><td>${employmentType}</td></tr>`);
  parts.push(`<tr><td>Start Date:</td><td>${formatDate(data.startDate)}</td></tr>`);
  parts.push(`<tr><td>Probation Period:</td><td>${esc(data.probationMonths || "__")} months</td></tr>`);
  parts.push(`</table>`);

  // Section 2: Compensation
  parts.push(`<h2>2. COMPENSATION &amp; BENEFITS</h2>`);
  parts.push(`<table class="terms">`);
  parts.push(`<tr><td>Annual Salary (CTC):</td><td>${formatINR(data.salary)}</td></tr>`);
  parts.push(`<tr><td>Working Hours:</td><td>${esc(data.workingHours || "_______________")}</td></tr>`);
  parts.push(`<tr><td>Leave Entitlement:</td><td>${esc(data.leaveDays || "__")} days per annum</td></tr>`);
  parts.push(`<tr><td>Notice Period:</td><td>${esc(data.noticeDays || "__")} days</td></tr>`);
  if (data.benefits) {
    parts.push(`<tr><td>Additional Benefits:</td><td>${esc(data.benefits)}</td></tr>`);
  }
  parts.push(`</table>`);

  // Section 3: Obligations
  parts.push(`<h2>3. EMPLOYEE OBLIGATIONS</h2>`);
  const confidentiality = getSelectLabel(data.confidentiality, [
    { value: "yes", label: "Included" },
    { value: "no", label: "Not Included" },
  ]);
  const nonCompeteEmp = getSelectLabel(data.nonCompete, [
    { value: "yes", label: "Included" },
    { value: "no", label: "Not Included" },
  ]);
  parts.push(`<table class="terms">`);
  parts.push(`<tr><td>Confidentiality Obligations:</td><td>${confidentiality}</td></tr>`);
  parts.push(`<tr><td>Non-Compete Clause:</td><td>${nonCompeteEmp}</td></tr>`);
  if (data.specialTerms) {
    parts.push(`<tr><td>Special Terms:</td><td>${esc(data.specialTerms)}</td></tr>`);
  }
  parts.push(`</table>`);

  // Section 4: Statutory compliance
  parts.push(`<h2>4. STATUTORY COMPLIANCE</h2>`);
  parts.push(`<p>This employment is subject to the provisions of applicable Indian labour laws including but not limited to the Industrial Employment (Standing Orders) Act, 1946, the Shops and Establishments Act of the applicable state, the Employees' Provident Funds and Miscellaneous Provisions Act, 1952, the Payment of Gratuity Act, 1972, and the Employees' State Insurance Act, 1948, as applicable.</p>`);

  // Legal reference
  parts.push(`<p class="ica-ref">Reference: This Agreement is governed by the Indian Contract Act, 1872. Employment terms are subject to the Industrial Disputes Act, 1947 and applicable state-specific Shops &amp; Establishments Acts.</p>`);

  // Signatures
  parts.push(`<div class="signature-block">`);
  parts.push(`<p>IN WITNESS WHEREOF, the parties hereto have executed this Agreement on the date first above written.</p>`);
  parts.push(`<div class="signatures-row">`);
  parts.push(`<div class="signature-line"><div class="line"></div><div class="label">For and on behalf of<br>${esc(data.employerName || "Employer")}</div></div>`);
  parts.push(`<div class="signature-line"><div class="line"></div><div class="label">${esc(data.employeeName || "Employee")}</div></div>`);
  parts.push(`</div>`);
  parts.push(`</div>`);

  return parts.join("\n");
}

// ============================================================
// 4. FREELANCE AGREEMENT PREVIEW
// ============================================================
export function buildFreelanceAgreementPreview(data: Record<string, string>): string {
  const today = todayFormatted();

  const parts: string[] = [];

  parts.push(`<h1>FREELANCE / SERVICE AGREEMENT</h1>`);
  parts.push(`<p>This Freelance Agreement (hereinafter referred to as the "Agreement") is made and entered into on this ${today}, by and between:</p>`);

  // Parties table
  parts.push(`<h2>PARTIES</h2>`);
  parts.push(`<table class="parties">`);
  parts.push(`<tr><th style="width:50%">CLIENT</th><th style="width:50%">FREELANCER</th></tr>`);
  parts.push(`<tr>`);
  parts.push(`<td><strong>Name:</strong> ${esc(data.clientName || "_______________")}<br><strong>Address:</strong> ${esc(data.clientAddress || "_______________")}</td>`);
  parts.push(`<td><strong>Name:</strong> ${esc(data.freelancerName || "_______________")}<br><strong>Address:</strong> ${esc(data.freelancerAddress || "_______________")}</td>`);
  parts.push(`</tr>`);
  parts.push(`</table>`);

  // Recital
  parts.push(`<p>WHEREAS the Client wishes to engage the Freelancer for certain services as described herein, and the Freelancer has agreed to provide such services on the terms and conditions set forth below.</p>`);
  parts.push(`<p><em>NOW THEREFORE, the parties agree as follows:</em></p>`);

  // Section 1: Scope of Work
  parts.push(`<h2>1. SCOPE OF WORK</h2>`);
  parts.push(`<table class="terms">`);
  parts.push(`<tr><td>Project Description:</td><td>${esc(data.projectDescription || "_______________")}</td></tr>`);
  parts.push(`<tr><td>Deliverables:</td><td>${esc(data.deliverables || "_______________")}</td></tr>`);
  parts.push(`<tr><td>Timeline / Deadline:</td><td>${esc(data.timeline || "_______________")}</td></tr>`);
  parts.push(`</table>`);

  // Section 2: Payment Terms
  parts.push(`<h2>2. PAYMENT TERMS</h2>`);
  const paymentSchedule = getSelectLabel(data.paymentSchedule, [
    { value: "upfront", label: "100% Upfront" },
    { value: "milestone", label: "Milestone-Based" },
    { value: "completion", label: "100% on Completion" },
  ]);
  parts.push(`<table class="terms">`);
  parts.push(`<tr><td>Total Project Fee:</td><td>${formatINR(data.totalFee)}</td></tr>`);
  parts.push(`<tr><td>Payment Schedule:</td><td>${paymentSchedule}</td></tr>`);
  if (data.latePaymentPenalty) {
    parts.push(`<tr><td>Late Payment Penalty:</td><td>${esc(data.latePaymentPenalty)}% per month on overdue amounts</td></tr>`);
  }
  parts.push(`</table>`);

  // Section 3: IP & Rights
  parts.push(`<h2>3. INTELLECTUAL PROPERTY &amp; RIGHTS</h2>`);
  const ipOwnership = getSelectLabel(data.ipOwnership, [
    { value: "client", label: "Client owns all IP" },
    { value: "freelancer", label: "Freelancer retains IP" },
    { value: "shared", label: "Shared / Joint Ownership" },
  ]);
  parts.push(`<table class="terms">`);
  parts.push(`<tr><td>IP Ownership:</td><td>${ipOwnership}</td></tr>`);
  parts.push(`<tr><td>Revision Rounds Included:</td><td>${esc(data.revisionRounds || "__")}</td></tr>`);
  parts.push(`<tr><td>Termination Notice:</td><td>${esc(data.terminationNotice || "__")} days</td></tr>`);
  if (data.specialTerms) {
    parts.push(`<tr><td>Special Terms:</td><td>${esc(data.specialTerms)}</td></tr>`);
  }
  parts.push(`</table>`);

  // Section 4: Relationship
  parts.push(`<h2>4. RELATIONSHIP OF THE PARTIES</h2>`);
  parts.push(`<p>The Freelancer is an independent contractor and not an employee of the Client. The Freelancer shall be responsible for all taxes, GST (if applicable), and statutory contributions in respect of the fees received under this Agreement. The Client shall deduct TDS under Section 194J of the Income Tax Act, 1961 where applicable.</p>`);

  // Legal reference
  parts.push(`<p class="ica-ref">This Agreement is governed by the Indian Contract Act, 1872. For the avoidance of doubt, this is a contract for services and does not create an employer-employee relationship. GST registration requirements under the CGST Act, 2017 may apply if the Freelancer's aggregate turnover exceeds the prescribed threshold.</p>`);

  // Signatures
  parts.push(`<div class="signature-block">`);
  parts.push(`<p>IN WITNESS WHEREOF, the parties hereto have executed this Agreement on the date first above written.</p>`);
  parts.push(`<div class="signatures-row">`);
  parts.push(`<div class="signature-line"><div class="line"></div><div class="label">For ${esc(data.clientName || "Client")}</div></div>`);
  parts.push(`<div class="signature-line"><div class="line"></div><div class="label">${esc(data.freelancerName || "Freelancer")}</div></div>`);
  parts.push(`</div>`);
  parts.push(`</div>`);

  return parts.join("\n");
}

// ============================================================
// 5. PARTNERSHIP DEED PREVIEW
// ============================================================
export function buildPartnershipDeedPreview(data: Record<string, string>): string {
  const today = todayFormatted();

  const parts: string[] = [];

  parts.push(`<h1>PARTNERSHIP DEED</h1>`);
  parts.push(`<p>This DEED OF PARTNERSHIP is made and executed on this ${today} at [Place]:</p>`);

  // Preamble
  parts.push(`<h2>PREAMBLE</h2>`);
  parts.push(`<p>WHEREAS the parties hereto have agreed to carry on business in partnership on the terms and conditions hereinafter appearing.</p>`);
  parts.push(`<p><em>NOW THIS DEED WITNESSETH AS FOLLOWS:</em></p>`);

  // Section 1: Firm & Business
  parts.push(`<h2>1. FIRM NAME &amp; BUSINESS</h2>`);
  parts.push(`<table class="terms">`);
  parts.push(`<tr><td>Firm Name:</td><td>${esc(data.firmName || "_______________")}</td></tr>`);
  parts.push(`<tr><td>Business Address:</td><td>${esc(data.businessAddress || "_______________")}</td></tr>`);
  parts.push(`<tr><td>Nature of Business:</td><td>${esc(data.natureOfBusiness || "_______________")}</td></tr>`);
  parts.push(`</table>`);

  // Section 2: Partners
  parts.push(`<h2>2. PARTNERS</h2>`);
  parts.push(`<table class="parties">`);
  parts.push(`<tr><th style="width:50%">PARTNER 1</th><th style="width:50%">PARTNER 2</th></tr>`);
  parts.push(`<tr>`);
  parts.push(`<td><strong>Name:</strong> ${esc(data.partner1Name || "_______________")}<br><strong>Address:</strong> ${esc(data.partner1Address || "_______________")}</td>`);
  parts.push(`<td><strong>Name:</strong> ${esc(data.partner2Name || "_______________")}<br><strong>Address:</strong> ${esc(data.partner2Address || "_______________")}</td>`);
  parts.push(`</tr>`);
  parts.push(`</table>`);

  // Section 3: Capital & Profits
  parts.push(`<h2>3. CAPITAL CONTRIBUTION &amp; PROFIT SHARING</h2>`);
  parts.push(`<table class="terms">`);
  parts.push(`<tr><td>Capital — ${esc(data.partner1Name || "Partner 1")}:</td><td>${formatINR(data.partner1Capital)}</td></tr>`);
  parts.push(`<tr><td>Capital — ${esc(data.partner2Name || "Partner 2")}:</td><td>${formatINR(data.partner2Capital)}</td></tr>`);
  parts.push(`<tr><td>Profit Sharing Ratio:</td><td>${esc(data.profitSharingRatio || "_______________")}</td></tr>`);
  parts.push(`</table>`);

  // Section 4: Duration & Banking
  parts.push(`<h2>4. DURATION &amp; BANKING</h2>`);
  parts.push(`<table class="terms">`);
  parts.push(`<tr><td>Commencement Date:</td><td>${formatDate(data.startDate)}</td></tr>`);
  parts.push(`<tr><td>Duration:</td><td>${esc(data.partnershipDuration || "_______________")}</td></tr>`);
  parts.push(`<tr><td>Bank Account:</td><td>${esc(data.bankDetails || "_______________")}</td></tr>`);
  parts.push(`</table>`);
  parts.push(`<p>The partnership shall operate a bank account in the firm's name and all receipts and payments shall be routed through it. Cheques shall be signed jointly by both partners unless otherwise agreed in writing.</p>`);

  // Section 5: Dispute Resolution & Dissolution
  parts.push(`<h2>5. DISPUTE RESOLUTION &amp; DISSOLUTION</h2>`);
  const disputeResolution = getSelectLabel(data.disputeResolution, [
    { value: "arbitration", label: "Arbitration" },
    { value: "mediation", label: "Mediation" },
    { value: "court", label: "Court of Law" },
  ]);
  parts.push(`<table class="terms">`);
  parts.push(`<tr><td>Dispute Resolution:</td><td>${disputeResolution}</td></tr>`);
  if (data.dissolutionTerms) {
    parts.push(`<tr><td>Dissolution Terms:</td><td>${esc(data.dissolutionTerms)}</td></tr>`);
  }
  if (data.specialClauses) {
    parts.push(`<tr><td>Special Clauses:</td><td>${esc(data.specialClauses)}</td></tr>`);
  }
  parts.push(`</table>`);

  // Legal reference
  parts.push(`<p class="ica-ref">This Partnership Deed is governed by the Indian Partnership Act, 1932. The mutual rights and duties of the partners shall be as provided in this Deed and, in the absence of any provision herein, as provided under the Act. The firm shall be registered under Section 58 of the Indian Partnership Act, 1932 with the Registrar of Firms.</p>`);

  // Signatures
  parts.push(`<div class="signature-block">`);
  parts.push(`<p>IN WITNESS WHEREOF, the partners have signed this Deed in the presence of the following witnesses:</p>`);
  parts.push(`<div class="signatures-row">`);
  parts.push(`<div class="signature-line"><div class="line"></div><div class="label">${esc(data.partner1Name || "Partner 1")}</div></div>`);
  parts.push(`<div class="signature-line"><div class="line"></div><div class="label">${esc(data.partner2Name || "Partner 2")}</div></div>`);
  parts.push(`</div>`);
  parts.push(`<div class="signatures-row" style="margin-top:40px">`);
  parts.push(`<div class="signature-line"><div class="line"></div><div class="label">Witness 1</div></div>`);
  parts.push(`<div class="signature-line"><div class="line"></div><div class="label">Witness 2</div></div>`);
  parts.push(`</div>`);
  parts.push(`</div>`);

  return parts.join("\n");
}

// ============================================================
// 6. LEGAL NOTICE PREVIEW
// ============================================================
export function buildLegalNoticePreview(data: Record<string, string>): string {
  const parts: string[] = [];

  parts.push(`<h1>LEGAL NOTICE</h1>`);

  // Sender & recipient
  parts.push(`<table class="terms">`);
  parts.push(`<tr><td><strong>From:</strong></td><td>${esc(data.senderName || "_______________")}<br>${esc(data.senderAddress || "_______________")}</td></tr>`);
  parts.push(`<tr><td><strong>To:</strong></td><td>${esc(data.recipientName || "_______________")}<br>${esc(data.recipientAddress || "_______________")}</td></tr>`);
  parts.push(`<tr><td><strong>Date:</strong></td><td>${formatDate(data.noticeDate)}</td></tr>`);
  parts.push(`<tr><td><strong>Sent Via:</strong></td><td>${getSelectLabel(data.sentVia, [
    { value: "registered-post", label: "Registered Post (AD)" },
    { value: "email", label: "Email" },
    { value: "both", label: "Both (Registered Post + Email)" },
  ])}</td></tr>`);
  parts.push(`</table>`);

  // Subject
  parts.push(`<h2>SUBJECT: ${esc(data.subject || "_______________")}</h2>`);

  // Body
  parts.push(`<p><strong>Dear Sir/Madam,</strong></p>`);
  parts.push(`<p>Under instructions from and on behalf of my client, <strong>${esc(data.senderName || "_______________")}</strong>, I hereby serve upon you the following legal notice:</p>`);

  // Grievance
  parts.push(`<h2>1. NATURE OF GRIEVANCE</h2>`);
  parts.push(`<p>${esc(data.grievanceNature || "_______________")}</p>`);

  // Legal basis
  parts.push(`<h2>2. LEGAL BASIS</h2>`);
  parts.push(`<p>${esc(data.legalBasis || "_______________")}</p>`);

  // Relief sought
  parts.push(`<h2>3. RELIEF SOUGHT</h2>`);
  parts.push(`<p>${esc(data.reliefSought || "_______________")}</p>`);

  // Deadline
  parts.push(`<h2>4. CALL TO ACTION</h2>`);
  parts.push(`<p>You are hereby called upon to comply with the above within <strong>${esc(data.deadlineDays || "__")} days</strong> from the receipt of this notice, failing which my client shall be constrained to initiate appropriate civil and/or criminal proceedings against you in the competent court of law, entirely at your risk as to costs and consequences.</p>`);

  // Legal reference
  parts.push(`<p class="ica-ref">This notice is issued under the applicable provisions of Indian law. Reference: Section 138 of the Negotiable Instruments Act, 1881 (in case of cheque dishonour); Section 73 of the Indian Contract Act, 1872 (breach of contract); Order IV of the Code of Civil Procedure, 1908; and other applicable provisions. This notice is without prejudice to any other rights or remedies available to my client.</p>`);

  // Signature
  parts.push(`<div class="signature-block">`);
  parts.push(`<p>Yours faithfully,</p>`);
  parts.push(`<div class="signatures-row">`);
  parts.push(`<div class="signature-line"><div class="line"></div><div class="label">${esc(data.senderName || "Sender")}<br><em>(Through Advocate)</em></div></div>`);
  parts.push(`<div class="signature-line"><div class="line"></div><div class="label">Place: _______________<br>Date: ${formatDate(data.noticeDate)}</div></div>`);
  parts.push(`</div>`);
  parts.push(`</div>`);

  return parts.join("\n");
}

// ============================================================
// 7. AFFIDAVIT PREVIEW
// ============================================================
export function buildAffidavitPreview(data: Record<string, string>): string {
  const parts: string[] = [];

  parts.push(`<h1>AFFIDAVIT</h1>`);
  parts.push(`<p style="text-align:center"><em>(Under the Indian Oaths Act, 1969)</em></p>`);

  // Deponent details
  parts.push(`<h2>DEPONENT DETAILS</h2>`);
  parts.push(`<table class="terms">`);
  parts.push(`<tr><td style="width:40%"><strong>Name of Deponent:</strong></td><td>${esc(data.deponentName || "_______________")}</td></tr>`);
  parts.push(`<tr><td><strong>Son/Daughter of:</strong></td><td>${esc(data.parentName || "_______________")}</td></tr>`);
  parts.push(`<tr><td><strong>Age:</strong></td><td>${esc(data.deponentAge || "__")} years</td></tr>`);
  parts.push(`<tr><td><strong>Resident of:</strong></td><td>${esc(data.deponentAddress || "_______________")}</td></tr>`);
  parts.push(`</table>`);

  // Purpose
  parts.push(`<h2>PURPOSE</h2>`);
  parts.push(`<p>${esc(data.affidavitPurpose || "_______________")}</p>`);

  // Sworn statement
  parts.push(`<h2>STATEMENT OF FACTS</h2>`);
  parts.push(`<p>I, <strong>${esc(data.deponentName || "_______________")}</strong>, the above-named Deponent, do hereby solemnly affirm and state on oath as under:</p>`);
  parts.push(`<div class="statement-block">`);
  parts.push(`<p>${esc(data.statementOfFacts || "_______________")}</p>`);
  parts.push(`</div>`);

  // Verification
  parts.push(`<h2>VERIFICATION</h2>`);
  parts.push(`<p>I, the above-named Deponent, do hereby verify that the contents of the above affidavit are true and correct to the best of my knowledge and belief. Nothing material has been concealed therefrom. No part of it is false.</p>`);
  parts.push(`<p>This affidavit is being submitted before the <strong>${esc(data.courtAuthority || "_______________")}</strong>.</p>`);

  // Notary details
  if (data.notaryName) {
    parts.push(`<h2>NOTARY ATTESTATION</h2>`);
    parts.push(`<table class="terms">`);
    parts.push(`<tr><td><strong>Notary Name:</strong></td><td>${esc(data.notaryName)}</td></tr>`);
    if (data.notaryRegNumber) {
      parts.push(`<tr><td><strong>Registration No.:</strong></td><td>${esc(data.notaryRegNumber)}</td></tr>`);
    }
    parts.push(`</table>`);
  }

  // Legal reference
  parts.push(`<p class="ica-ref">This affidavit is sworn under the provisions of the Indian Oaths Act, 1969 and the Code of Civil Procedure, 1908 (Order XIX). The Deponent understands that making a false statement in this affidavit is punishable under Section 193, 199, and 200 of the Indian Penal Code, 1860.</p>`);

  // Signatures
  parts.push(`<div class="signature-block">`);
  parts.push(`<div class="signatures-row">`);
  parts.push(`<div class="signature-line"><div class="line"></div><div class="label">Deponent<br>${esc(data.deponentName || "_______________")}</div></div>`);
  parts.push(`<div class="signature-line"><div class="line"></div><div class="label">Place: ${esc(data.affidavitPlace || "_______________")}<br>Date: ${formatDate(data.affidavitDate)}</div></div>`);
  parts.push(`</div>`);
  if (data.notaryName) {
    parts.push(`<div class="signatures-row" style="margin-top:40px">`);
    parts.push(`<div class="signature-line"><div class="line"></div><div class="label">Notary Public<br>${esc(data.notaryName)}</div></div>`);
    parts.push(`<div class="signature-line"><div class="line"></div><div class="label">(Seal &amp; Stamp)</div></div>`);
    parts.push(`</div>`);
  }
  parts.push(`</div>`);

  return parts.join("\n");
}

// ============================================================
// 8. TERMS OF SERVICE PREVIEW
// ============================================================
export function buildTermsOfServicePreview(data: Record<string, string>): string {
  const parts: string[] = [];

  parts.push(`<h1>TERMS OF SERVICE</h1>`);
  parts.push(`<p style="text-align:center"><em>Effective Date: ${formatDate(data.lastUpdated)} | Last Updated: ${formatDate(data.lastUpdated)}</em></p>`);

  // Business
  parts.push(`<h2>1. ABOUT US</h2>`);
  parts.push(`<table class="terms">`);
  parts.push(`<tr><td style="width:40%"><strong>Company:</strong></td><td>${esc(data.companyName || "_______________")}</td></tr>`);
  parts.push(`<tr><td><strong>Website/App:</strong></td><td>${esc(data.websiteUrl || "_______________")}</td></tr>`);
  parts.push(`<tr><td><strong>Contact Email:</strong></td><td>${esc(data.contactEmail || "_______________")}</td></tr>`);
  parts.push(`<tr><td><strong>Registered Address:</strong></td><td>${esc(data.businessAddress || "_______________")}</td></tr>`);
  parts.push(`</table>`);

  // Service description
  parts.push(`<h2>2. SERVICES</h2>`);
  parts.push(`<p>${esc(data.serviceDescription || "_______________")}</p>`);

  // User obligations
  parts.push(`<h2>3. USER OBLIGATIONS</h2>`);
  parts.push(`<p>By accessing or using our services, you agree to the following:</p>`);
  parts.push(`<p>${esc(data.userObligations || "_______________")}</p>`);

  // Acceptable use
  parts.push(`<h2>4. ACCEPTABLE USE POLICY</h2>`);
  parts.push(`<p>${esc(data.acceptableUse || "_______________")}</p>`);

  // Privacy / Data
  parts.push(`<h2>5. DATA COLLECTION &amp; PRIVACY</h2>`);
  const thirdPartySharing = getSelectLabel(data.thirdPartySharing, [
    { value: "yes", label: "Yes, data is shared with third parties" },
    { value: "no", label: "No, data is not shared with third parties" },
  ]);
  const cookiePolicy = getSelectLabel(data.cookiePolicy, [
    { value: "yes", label: "Yes, the platform uses cookies" },
    { value: "no", label: "No, the platform does not use cookies" },
  ]);
  parts.push(`<table class="terms">`);
  parts.push(`<tr><td><strong>Data Collected:</strong></td><td>${esc(data.dataCollected || "_______________")}</td></tr>`);
  parts.push(`<tr><td><strong>Third-Party Sharing:</strong></td><td>${thirdPartySharing}</td></tr>`);
  parts.push(`<tr><td><strong>Cookie Usage:</strong></td><td>${cookiePolicy}</td></tr>`);
  parts.push(`<tr><td><strong>Data Retention:</strong></td><td>${esc(data.dataRetention || "_______________")}</td></tr>`);
  parts.push(`</table>`);

  // Legal terms
  parts.push(`<h2>6. LEGAL TERMS</h2>`);
  const limitationOfLiability = getSelectLabel(data.limitationOfLiability, [
    { value: "standard", label: "Standard (to the extent permitted by law)" },
    { value: "custom", label: "Custom" },
  ]);
  parts.push(`<table class="terms">`);
  parts.push(`<tr><td><strong>Limitation of Liability:</strong></td><td>${limitationOfLiability}</td></tr>`);
  parts.push(`<tr><td><strong>Governing Law:</strong></td><td>${getSelectLabel(data.governingState, [
    { value: "andhra-pradesh", label: "Andhra Pradesh" },
    { value: "arunachal-pradesh", label: "Arunachal Pradesh" },
    { value: "assam", label: "Assam" },
    { value: "bihar", label: "Bihar" },
    { value: "chhattisgarh", label: "Chhattisgarh" },
    { value: "goa", label: "Goa" },
    { value: "gujarat", label: "Gujarat" },
    { value: "haryana", label: "Haryana" },
    { value: "himachal-pradesh", label: "Himachal Pradesh" },
    { value: "jharkhand", label: "Jharkhand" },
    { value: "karnataka", label: "Karnataka" },
    { value: "kerala", label: "Kerala" },
    { value: "madhya-pradesh", label: "Madhya Pradesh" },
    { value: "maharashtra", label: "Maharashtra" },
    { value: "manipur", label: "Manipur" },
    { value: "meghalaya", label: "Meghalaya" },
    { value: "mizoram", label: "Mizoram" },
    { value: "nagaland", label: "Nagaland" },
    { value: "odisha", label: "Odisha" },
    { value: "punjab", label: "Punjab" },
    { value: "rajasthan", label: "Rajasthan" },
    { value: "sikkim", label: "Sikkim" },
    { value: "tamil-nadu", label: "Tamil Nadu" },
    { value: "telangana", label: "Telangana" },
    { value: "tripura", label: "Tripura" },
    { value: "uttar-pradesh", label: "Uttar Pradesh" },
    { value: "uttarakhand", label: "Uttarakhand" },
    { value: "west-bengal", label: "West Bengal" },
    { value: "delhi", label: "Delhi (NCT)" },
    { value: "chandigarh", label: "Chandigarh" },
    { value: "puducherry", label: "Puducherry" },
  ])}</td></tr>`);
  parts.push(`<tr><td><strong>Dispute Resolution:</strong></td><td>${esc(data.disputeResolution || "_______________")}</td></tr>`);
  parts.push(`</table>`);

  // Section 7: Limitation of liability detail
  parts.push(`<h2>7. LIMITATION OF LIABILITY</h2>`);
  parts.push(`<p>To the fullest extent permitted by applicable law, ${esc(data.companyName || "the Company")} shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the services.</p>`);

  // Legal reference
  parts.push(`<p class="ica-ref">These Terms of Service are governed by the laws of India, including but not limited to the Information Technology Act, 2000, the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, the Indian Contract Act, 1872, and the Consumer Protection Act, 2019. The Company is committed to compliance with the Digital Personal Data Protection Act, 2023.</p>`);

  // Acceptance
  parts.push(`<h2>8. ACCEPTANCE OF TERMS</h2>`);
  parts.push(`<p>By accessing or using ${esc(data.websiteUrl || "the platform")}, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree, you must discontinue use immediately.</p>`);

  // Signature / Company
  parts.push(`<div class="signature-block">`);
  parts.push(`<p>These Terms of Service were last updated on <strong>${formatDate(data.lastUpdated)}</strong>.</p>`);
  parts.push(`<div class="signatures-row">`);
  parts.push(`<div class="signature-line"><div class="line"></div><div class="label">For ${esc(data.companyName || "Company")}<br><em>Authorized Signatory</em></div></div>`);
  parts.push(`<div class="signature-line"><div class="line"></div><div class="label">Date: ${formatDate(data.lastUpdated)}<br>Place: _______________</div></div>`);
  parts.push(`</div>`);
  parts.push(`</div>`);

  return parts.join("\n");
}

// ============================================================
// GENERIC FALLBACK
// ============================================================
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

// ============================================================
// DISPATCHER
// ============================================================
export function generateDocumentPreview(
  template: DocumentTemplate,
  data: Record<string, string>
): string {
  switch (template.id) {
    case "rental-agreement":
      return buildRentalAgreementPreview(data);
    case "nda":
      return buildNDAPreview(data);
    case "employment-contract":
      return buildEmploymentContractPreview(data);
    case "freelance-agreement":
      return buildFreelanceAgreementPreview(data);
    case "partnership-deed":
      return buildPartnershipDeedPreview(data);
    case "legal-notice":
      return buildLegalNoticePreview(data);
    case "affidavit":
      return buildAffidavitPreview(data);
    case "terms-of-service":
      return buildTermsOfServicePreview(data);
    default:
      return buildGenericPreview(template, data);
  }
}
