/**
 * Document template registry.
 * Defines all 8 document types with metadata, icons, descriptions, and form schemas.
 *
 * This is the single source of truth for document types — used by the
 * selection grid, questionnaire flow, and PDF generation.
 */

export interface DocumentTemplate {
  id: string;
  name: string;
  nameHi: string; // Hindi name
  description: string;
  descriptionHi: string;
  icon: string; // Emoji icon for quick visual
  category: "business" | "personal" | "employment" | "property";
  estimatedTime: string; // e.g. "5-7 min"
  price: number; // in INR
  formSteps: FormStep[];
}

export interface FormStep {
  id: string;
  title: string;
  titleHi: string;
  fields: FormField[];
}

export interface FormField {
  id: string;
  label: string;
  labelHi: string;
  type: "text" | "textarea" | "date" | "select" | "number" | "email" | "phone";
  required: boolean;
  placeholder?: string;
  placeholderHi?: string;
  options?: { value: string; label: string; labelHi: string }[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };
}

// Indian states for jurisdiction/governing law dropdowns
const INDIAN_STATES = [
  { value: "andhra-pradesh", label: "Andhra Pradesh", labelHi: "आंध्र प्रदेश" },
  { value: "arunachal-pradesh", label: "Arunachal Pradesh", labelHi: "अरुणाचल प्रदेश" },
  { value: "assam", label: "Assam", labelHi: "असम" },
  { value: "bihar", label: "Bihar", labelHi: "बिहार" },
  { value: "chhattisgarh", label: "Chhattisgarh", labelHi: "छत्तीसगढ़" },
  { value: "goa", label: "Goa", labelHi: "गोवा" },
  { value: "gujarat", label: "Gujarat", labelHi: "गुजरात" },
  { value: "haryana", label: "Haryana", labelHi: "हरियाणा" },
  { value: "himachal-pradesh", label: "Himachal Pradesh", labelHi: "हिमाचल प्रदेश" },
  { value: "jharkhand", label: "Jharkhand", labelHi: "झारखंड" },
  { value: "karnataka", label: "Karnataka", labelHi: "कर्नाटक" },
  { value: "kerala", label: "Kerala", labelHi: "केरल" },
  { value: "madhya-pradesh", label: "Madhya Pradesh", labelHi: "मध्य प्रदेश" },
  { value: "maharashtra", label: "Maharashtra", labelHi: "महाराष्ट्र" },
  { value: "manipur", label: "Manipur", labelHi: "मणिपुर" },
  { value: "meghalaya", label: "Meghalaya", labelHi: "मेघालय" },
  { value: "mizoram", label: "Mizoram", labelHi: "मिज़ोरम" },
  { value: "nagaland", label: "Nagaland", labelHi: "नागालैंड" },
  { value: "odisha", label: "Odisha", labelHi: "ओडिशा" },
  { value: "punjab", label: "Punjab", labelHi: "पंजाब" },
  { value: "rajasthan", label: "Rajasthan", labelHi: "राजस्थान" },
  { value: "sikkim", label: "Sikkim", labelHi: "सिक्किम" },
  { value: "tamil-nadu", label: "Tamil Nadu", labelHi: "तमिल नाडु" },
  { value: "telangana", label: "Telangana", labelHi: "तेलंगाना" },
  { value: "tripura", label: "Tripura", labelHi: "त्रिपुरा" },
  { value: "uttar-pradesh", label: "Uttar Pradesh", labelHi: "उत्तर प्रदेश" },
  { value: "uttarakhand", label: "Uttarakhand", labelHi: "उत्तराखंड" },
  { value: "west-bengal", label: "West Bengal", labelHi: "पश्चिम बंगाल" },
  { value: "delhi", label: "Delhi (NCT)", labelHi: "दिल्ली" },
  { value: "chandigarh", label: "Chandigarh", labelHi: "चंडीगढ़" },
  { value: "puducherry", label: "Puducherry", labelHi: "पुडुचेरी" },
];

export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  // ============================================================
  // 1. RENTAL AGREEMENT (complete — DO NOT MODIFY)
  // ============================================================
  {
    id: "rental-agreement",
    name: "Rental Agreement",
    nameHi: "किराया अनुबंध",
    description:
      "Create a legally grounded residential or commercial rental agreement compliant with Indian tenancy norms.",
    descriptionHi:
      "भारतीय किरायेदारी मानदंडों के अनुरूप आवासीय या वाणिज्यिक किराया अनुबंध बनाएं।",
    icon: "🏠",
    category: "property",
    estimatedTime: "5–7 min",
    price: 499,
    formSteps: [
      {
        id: "parties",
        title: "Parties Involved",
        titleHi: "संबंधित पक्ष",
        fields: [
          {
            id: "landlordName",
            label: "Landlord Full Name",
            labelHi: "मकान मालिक का पूरा नाम",
            type: "text",
            required: true,
            placeholder: "e.g., Rajesh Sharma",
          },
          {
            id: "landlordAddress",
            label: "Landlord Address",
            labelHi: "मकान मालिक का पता",
            type: "textarea",
            required: true,
            placeholder: "Full address of the landlord",
          },
          {
            id: "tenantName",
            label: "Tenant Full Name",
            labelHi: "किराएदार का पूरा नाम",
            type: "text",
            required: true,
            placeholder: "e.g., Priya Patel",
          },
          {
            id: "tenantAddress",
            label: "Tenant Address",
            labelHi: "किराएदार का पता",
            type: "textarea",
            required: true,
            placeholder: "Current/permanent address of the tenant",
          },
        ],
      },
      {
        id: "property",
        title: "Property Details",
        titleHi: "संपत्ति विवरण",
        fields: [
          {
            id: "propertyAddress",
            label: "Full Property Address",
            labelHi: "संपत्ति का पूरा पता",
            type: "textarea",
            required: true,
            placeholder: "Complete address of the rented property",
          },
          {
            id: "propertyType",
            label: "Property Type",
            labelHi: "संपत्ति का प्रकार",
            type: "select",
            required: true,
            options: [
              { value: "residential", label: "Residential", labelHi: "आवासीय" },
              { value: "commercial", label: "Commercial", labelHi: "वाणिज्यिक" },
            ],
          },
          {
            id: "furnishing",
            label: "Furnishing Status",
            labelHi: "साज-सज्जा की स्थिति",
            type: "select",
            required: true,
            options: [
              { value: "unfurnished", label: "Unfurnished", labelHi: "असज्जित" },
              { value: "semi-furnished", label: "Semi-Furnished", labelHi: "अर्ध-सज्जित" },
              { value: "fully-furnished", label: "Fully Furnished", labelHi: "पूर्णतः सज्जित" },
            ],
          },
        ],
      },
      {
        id: "terms",
        title: "Rental Terms",
        titleHi: "किराया शर्तें",
        fields: [
          {
            id: "monthlyRent",
            label: "Monthly Rent (₹)",
            labelHi: "मासिक किराया (₹)",
            type: "number",
            required: true,
            placeholder: "e.g., 15000",
          },
          {
            id: "securityDeposit",
            label: "Security Deposit (₹)",
            labelHi: "सुरक्षा जमा (₹)",
            type: "number",
            required: true,
            placeholder: "e.g., 30000",
          },
          {
            id: "leaseStart",
            label: "Lease Start Date",
            labelHi: "लीज़ प्रारंभ तिथि",
            type: "date",
            required: true,
          },
          {
            id: "leaseDuration",
            label: "Lease Duration (months)",
            labelHi: "लीज़ अवधि (महीने)",
            type: "number",
            required: true,
            placeholder: "e.g., 11",
          },
          {
            id: "noticePeriod",
            label: "Notice Period (days)",
            labelHi: "नोटिस अवधि (दिन)",
            type: "number",
            required: true,
            placeholder: "e.g., 30",
          },
        ],
      },
      {
        id: "clauses",
        title: "Additional Clauses",
        titleHi: "अतिरिक्त खंड",
        fields: [
          {
            id: "petPolicy",
            label: "Pet Policy",
            labelHi: "पालतू जानवर नीति",
            type: "select",
            required: true,
            options: [
              { value: "yes", label: "Pets Allowed", labelHi: "पालतू जानवरों की अनुमति" },
              { value: "no", label: "No Pets Allowed", labelHi: "पालतू जानवरों की अनुमति नहीं" },
            ],
          },
          {
            id: "subletting",
            label: "Subletting Allowed",
            labelHi: "उप-किराए की अनुमति",
            type: "select",
            required: true,
            options: [
              { value: "yes", label: "Yes, subletting allowed", labelHi: "हाँ, अनुमति है" },
              { value: "no", label: "No, subletting not allowed", labelHi: "नहीं, अनुमति नहीं है" },
            ],
          },
          {
            id: "maintenance",
            label: "Maintenance Responsibility",
            labelHi: "रखरखाव की जिम्मेदारी",
            type: "select",
            required: true,
            options: [
              { value: "landlord", label: "Landlord", labelHi: "मकान मालिक" },
              { value: "tenant", label: "Tenant", labelHi: "किराएदार" },
              { value: "shared", label: "Shared", labelHi: "साझा" },
            ],
          },
          {
            id: "specialConditions",
            label: "Special Conditions",
            labelHi: "विशेष शर्तें",
            type: "textarea",
            required: false,
            placeholder: "Any additional terms or conditions (optional)",
          },
        ],
      },
    ],
  },

  // ============================================================
  // 2. NDA (complete — DO NOT MODIFY)
  // ============================================================
  {
    id: "nda",
    name: "Non-Disclosure Agreement",
    nameHi: "गैर-प्रकटीकरण समझौता",
    description:
      "Protect your business secrets with an NDA tailored for Indian startups and SMEs.",
    descriptionHi:
      "भारतीय स्टार्टअप और एसएमई के लिए अनुकूलित गैर-प्रकटीकरण समझौता।",
    icon: "🔒",
    category: "business",
    estimatedTime: "4–6 min",
    price: 299,
    formSteps: [
      {
        id: "parties",
        title: "Parties Involved",
        titleHi: "संबंधित पक्ष",
        fields: [
          {
            id: "disclosingParty",
            label: "Disclosing Party Name",
            labelHi: "प्रकटकर्ता पक्ष का नाम",
            type: "text",
            required: true,
            placeholder: "e.g., TechVentures Pvt Ltd",
          },
          {
            id: "disclosingPartyAddress",
            label: "Disclosing Party Address",
            labelHi: "प्रकटकर्ता पक्ष का पता",
            type: "textarea",
            required: true,
            placeholder: "Registered address of the disclosing party",
          },
          {
            id: "receivingParty",
            label: "Receiving Party Name",
            labelHi: "प्राप्तकर्ता पक्ष का नाम",
            type: "text",
            required: true,
            placeholder: "e.g., John Doe / ABC Corp",
          },
          {
            id: "receivingPartyAddress",
            label: "Receiving Party Address",
            labelHi: "प्राप्तकर्ता पक्ष का पता",
            type: "textarea",
            required: true,
            placeholder: "Address of the receiving party",
          },
        ],
      },
      {
        id: "scope",
        title: "Agreement Scope",
        titleHi: "समझौते का दायरा",
        fields: [
          {
            id: "purpose",
            label: "Purpose of Disclosure",
            labelHi: "प्रकटीकरण का उद्देश्य",
            type: "textarea",
            required: true,
            placeholder:
              "e.g., Evaluation of potential business collaboration, software development project discussion",
          },
          {
            id: "duration",
            label: "Confidentiality Duration (months)",
            labelHi: "गोपनीयता अवधि (महीने)",
            type: "number",
            required: true,
            placeholder: "e.g., 24",
          },
          {
            id: "governingState",
            label: "Governing State",
            labelHi: "शासकीय राज्य",
            type: "select",
            required: true,
            options: INDIAN_STATES,
          },
        ],
      },
      {
        id: "terms",
        title: "Additional Terms",
        titleHi: "अतिरिक्त शर्तें",
        fields: [
          {
            id: "nonSolicitation",
            label: "Includes Non-Solicitation Clause",
            labelHi: "गैर-अनुरोध खंड शामिल",
            type: "select",
            required: true,
            options: [
              { value: "yes", label: "Yes, include non-solicitation", labelHi: "हाँ, शामिल करें" },
              { value: "no", label: "No", labelHi: "नहीं" },
            ],
          },
          {
            id: "nonCompete",
            label: "Includes Non-Compete Clause",
            labelHi: "गैर-प्रतिस्पर्धा खंड शामिल",
            type: "select",
            required: true,
            options: [
              { value: "yes", label: "Yes, include non-compete", labelHi: "हाँ, शामिल करें" },
              { value: "no", label: "No", labelHi: "नहीं" },
            ],
          },
          {
            id: "remediesClause",
            label: "Remedies Clause",
            labelHi: "उपचार खंड",
            type: "select",
            required: true,
            options: [
              { value: "standard", label: "Standard (Injunction + Damages)", labelHi: "मानक" },
              { value: "arbitration", label: "Arbitration", labelHi: "मध्यस्थता" },
            ],
          },
          {
            id: "specialConditions",
            label: "Special Conditions",
            labelHi: "विशेष शर्तें",
            type: "textarea",
            required: false,
            placeholder: "Any additional terms or conditions (optional)",
          },
        ],
      },
    ],
  },

  // ============================================================
  // 3. EMPLOYMENT CONTRACT (4 steps)
  // ============================================================
  {
    id: "employment-contract",
    name: "Employment Contract",
    nameHi: "रोजगार अनुबंध",
    description:
      "Generate an employment agreement compliant with Indian labour laws including the Industrial Employment (Standing Orders) Act and Shops & Establishments Act.",
    descriptionHi:
      "औद्योगिक रोजगार (स्थायी आदेश) अधिनियम और दुकान एवं स्थापना अधिनियम सहित भारतीय श्रम कानूनों के अनुरूप रोजगार समझौता तैयार करें।",
    icon: "💼",
    category: "employment",
    estimatedTime: "7–9 min",
    price: 599,
    formSteps: [
      {
        id: "parties",
        title: "Employer & Employee",
        titleHi: "नियोक्ता और कर्मचारी",
        fields: [
          {
            id: "employerName",
            label: "Company / Employer Name",
            labelHi: "कंपनी / नियोक्ता का नाम",
            type: "text",
            required: true,
            placeholder: "e.g., Acme India Pvt Ltd",
          },
          {
            id: "employerAddress",
            label: "Employer Address",
            labelHi: "नियोक्ता का पता",
            type: "textarea",
            required: true,
            placeholder: "Registered office address of the employer",
          },
          {
            id: "employeeName",
            label: "Employee Full Name",
            labelHi: "कर्मचारी का पूरा नाम",
            type: "text",
            required: true,
            placeholder: "e.g., Amit Verma",
          },
          {
            id: "employeeAddress",
            label: "Employee Address",
            labelHi: "कर्मचारी का पता",
            type: "textarea",
            required: true,
            placeholder: "Current residential address of the employee",
          },
          {
            id: "jobTitle",
            label: "Position / Job Title",
            labelHi: "पद / नौकरी का शीर्षक",
            type: "text",
            required: true,
            placeholder: "e.g., Senior Software Engineer",
          },
        ],
      },
      {
        id: "engagement",
        title: "Engagement Details",
        titleHi: "अनुबंध विवरण",
        fields: [
          {
            id: "startDate",
            label: "Start Date",
            labelHi: "प्रारंभ तिथि",
            type: "date",
            required: true,
          },
          {
            id: "employmentType",
            label: "Employment Type",
            labelHi: "रोजगार का प्रकार",
            type: "select",
            required: true,
            options: [
              { value: "full-time", label: "Full-Time", labelHi: "पूर्णकालिक" },
              { value: "part-time", label: "Part-Time", labelHi: "अंशकालिक" },
              { value: "contract", label: "Contract", labelHi: "अनुबंधित" },
            ],
          },
          {
            id: "probationMonths",
            label: "Probation Period (months)",
            labelHi: "परिवीक्षा अवधि (महीने)",
            type: "number",
            required: true,
            placeholder: "e.g., 6",
          },
        ],
      },
      {
        id: "compensation",
        title: "Compensation & Benefits",
        titleHi: "मुआवजा और लाभ",
        fields: [
          {
            id: "salary",
            label: "Salary (₹ per annum)",
            labelHi: "वेतन (₹ प्रति वर्ष)",
            type: "number",
            required: true,
            placeholder: "e.g., 600000",
          },
          {
            id: "workingHours",
            label: "Working Hours",
            labelHi: "कार्य घंटे",
            type: "text",
            required: true,
            placeholder: "e.g., 9:00 AM to 6:00 PM, Monday to Friday",
          },
          {
            id: "leaveDays",
            label: "Leave Policy (days/year)",
            labelHi: "छुट्टी नीति (दिन/वर्ष)",
            type: "number",
            required: true,
            placeholder: "e.g., 24",
          },
          {
            id: "noticeDays",
            label: "Notice Period (days)",
            labelHi: "नोटिस अवधि (दिन)",
            type: "number",
            required: true,
            placeholder: "e.g., 30",
          },
        ],
      },
      {
        id: "clauses",
        title: "Additional Clauses",
        titleHi: "अतिरिक्त खंड",
        fields: [
          {
            id: "benefits",
            label: "Benefits & Perks",
            labelHi: "लाभ और सुविधाएं",
            type: "textarea",
            required: false,
            placeholder: "e.g., Health insurance, PF, gratuity, stock options, travel allowance",
          },
          {
            id: "confidentiality",
            label: "Confidentiality Clause",
            labelHi: "गोपनीयता खंड",
            type: "select",
            required: true,
            options: [
              { value: "yes", label: "Yes, include confidentiality obligations", labelHi: "हाँ, गोपनीयता दायित्व शामिल करें" },
              { value: "no", label: "No", labelHi: "नहीं" },
            ],
          },
          {
            id: "nonCompete",
            label: "Non-Compete Clause",
            labelHi: "गैर-प्रतिस्पर्धा खंड",
            type: "select",
            required: true,
            options: [
              { value: "yes", label: "Yes, include non-compete", labelHi: "हाँ, गैर-प्रतिस्पर्धा शामिल करें" },
              { value: "no", label: "No", labelHi: "नहीं" },
            ],
          },
          {
            id: "specialTerms",
            label: "Special Terms",
            labelHi: "विशेष शर्तें",
            type: "textarea",
            required: false,
            placeholder: "Any additional special terms or conditions (optional)",
          },
        ],
      },
    ],
  },

  // ============================================================
  // 4. FREELANCE AGREEMENT (4 steps)
  // ============================================================
  {
    id: "freelance-agreement",
    name: "Freelance / Service Agreement",
    nameHi: "फ्रीलांस / सेवा अनुबंध",
    description:
      "Define scope, deliverables, and payment terms for freelance engagements governed by the Indian Contract Act.",
    descriptionHi:
      "भारतीय अनुबंध अधिनियम द्वारा शासित फ्रीलांस कार्यों के लिए कार्यक्षेत्र, डिलीवरेबल्स और भुगतान शर्तें परिभाषित करें।",
    icon: "✍️",
    category: "business",
    estimatedTime: "6–8 min",
    price: 399,
    formSteps: [
      {
        id: "parties",
        title: "Parties Involved",
        titleHi: "संबंधित पक्ष",
        fields: [
          {
            id: "clientName",
            label: "Client Name / Company",
            labelHi: "ग्राहक नाम / कंपनी",
            type: "text",
            required: true,
            placeholder: "e.g., GlobalTech Solutions",
          },
          {
            id: "clientAddress",
            label: "Client Address",
            labelHi: "ग्राहक का पता",
            type: "textarea",
            required: true,
            placeholder: "Registered/business address of the client",
          },
          {
            id: "freelancerName",
            label: "Freelancer / Service Provider Name",
            labelHi: "फ्रीलांसर / सेवा प्रदाता का नाम",
            type: "text",
            required: true,
            placeholder: "e.g., Neha Gupta",
          },
          {
            id: "freelancerAddress",
            label: "Freelancer Address",
            labelHi: "फ्रीलांसर का पता",
            type: "textarea",
            required: true,
            placeholder: "Address of the freelancer/service provider",
          },
        ],
      },
      {
        id: "scope",
        title: "Project Scope",
        titleHi: "परियोजना का दायरा",
        fields: [
          {
            id: "projectDescription",
            label: "Project Description",
            labelHi: "परियोजना विवरण",
            type: "textarea",
            required: true,
            placeholder: "Describe the project, its objectives, and context",
          },
          {
            id: "deliverables",
            label: "Deliverables",
            labelHi: "डिलीवरेबल्स",
            type: "textarea",
            required: true,
            placeholder: "List all deliverables with specifications and acceptance criteria",
          },
          {
            id: "timeline",
            label: "Timeline / Deadline",
            labelHi: "समय-सीमा / अंतिम तिथि",
            type: "text",
            required: true,
            placeholder: "e.g., 8 weeks from start date, or specific date",
          },
        ],
      },
      {
        id: "payment",
        title: "Payment Terms",
        titleHi: "भुगतान शर्तें",
        fields: [
          {
            id: "totalFee",
            label: "Total Project Fee (₹)",
            labelHi: "कुल परियोजना शुल्क (₹)",
            type: "number",
            required: true,
            placeholder: "e.g., 150000",
          },
          {
            id: "paymentSchedule",
            label: "Payment Schedule",
            labelHi: "भुगतान अनुसूची",
            type: "select",
            required: true,
            options: [
              { value: "upfront", label: "100% Upfront", labelHi: "100% अग्रिम" },
              { value: "milestone", label: "Milestone-Based", labelHi: "माइलस्टोन आधारित" },
              { value: "completion", label: "100% on Completion", labelHi: "पूर्णता पर 100%" },
            ],
          },
          {
            id: "latePaymentPenalty",
            label: "Late Payment Penalty (%)",
            labelHi: "विलंब भुगतान दंड (%)",
            type: "number",
            required: false,
            placeholder: "e.g., 2 (percentage per month)",
          },
        ],
      },
      {
        id: "legal",
        title: "Legal & IP Terms",
        titleHi: "कानूनी और आईपी शर्तें",
        fields: [
          {
            id: "ipOwnership",
            label: "IP Ownership",
            labelHi: "आईपी स्वामित्व",
            type: "select",
            required: true,
            options: [
              { value: "client", label: "Client owns all IP", labelHi: "सभी आईपी ग्राहक का" },
              { value: "freelancer", label: "Freelancer retains IP", labelHi: "फ्रीलांसर आईपी बनाए रखेगा" },
              { value: "shared", label: "Shared / Joint Ownership", labelHi: "साझा / संयुक्त स्वामित्व" },
            ],
          },
          {
            id: "revisionRounds",
            label: "Revision Rounds",
            labelHi: "संशोधन राउंड",
            type: "number",
            required: true,
            placeholder: "e.g., 3",
          },
          {
            id: "terminationNotice",
            label: "Termination Notice (days)",
            labelHi: "समाप्ति सूचना (दिन)",
            type: "number",
            required: true,
            placeholder: "e.g., 15",
          },
          {
            id: "specialTerms",
            label: "Special Terms",
            labelHi: "विशेष शर्तें",
            type: "textarea",
            required: false,
            placeholder: "Any additional terms or conditions (optional)",
          },
        ],
      },
    ],
  },

  // ============================================================
  // 5. PARTNERSHIP DEED (5 steps)
  // ============================================================
  {
    id: "partnership-deed",
    name: "Partnership Deed",
    nameHi: "साझेदारी विलेख",
    description:
      "Formalize your business partnership under the Indian Partnership Act, 1932 with a comprehensive deed covering roles, capital, profit sharing, and exit terms.",
    descriptionHi:
      "भारतीय साझेदारी अधिनियम, 1932 के तहत भूमिकाओं, पूंजी, लाभ वितरण और निकास शर्तों को कवर करने वाले व्यापक विलेख के साथ अपनी व्यावसायिक साझेदारी को औपचारिक बनाएं।",
    icon: "🤝",
    category: "business",
    estimatedTime: "8–10 min",
    price: 599,
    formSteps: [
      {
        id: "firm",
        title: "Firm Details",
        titleHi: "फर्म विवरण",
        fields: [
          {
            id: "firmName",
            label: "Firm Name",
            labelHi: "फर्म का नाम",
            type: "text",
            required: true,
            placeholder: "e.g., Sharma & Sons Enterprises",
          },
          {
            id: "businessAddress",
            label: "Business Address",
            labelHi: "व्यावसायिक पता",
            type: "textarea",
            required: true,
            placeholder: "Principal place of business / registered office",
          },
          {
            id: "natureOfBusiness",
            label: "Nature of Business",
            labelHi: "व्यवसाय की प्रकृति",
            type: "textarea",
            required: true,
            placeholder: "Describe the business activities, products, or services of the firm",
          },
        ],
      },
      {
        id: "partners",
        title: "Partner Details",
        titleHi: "साझेदार विवरण",
        fields: [
          {
            id: "partner1Name",
            label: "Partner 1 Full Name",
            labelHi: "साझेदार 1 का पूरा नाम",
            type: "text",
            required: true,
            placeholder: "e.g., Rajesh Sharma",
          },
          {
            id: "partner1Address",
            label: "Partner 1 Address",
            labelHi: "साझेदार 1 का पता",
            type: "textarea",
            required: true,
            placeholder: "Residential address of Partner 1",
          },
          {
            id: "partner2Name",
            label: "Partner 2 Full Name",
            labelHi: "साझेदार 2 का पूरा नाम",
            type: "text",
            required: true,
            placeholder: "e.g., Suresh Patel",
          },
          {
            id: "partner2Address",
            label: "Partner 2 Address",
            labelHi: "साझेदार 2 का पता",
            type: "textarea",
            required: true,
            placeholder: "Residential address of Partner 2",
          },
        ],
      },
      {
        id: "capital",
        title: "Capital & Profit Sharing",
        titleHi: "पूंजी और लाभ वितरण",
        fields: [
          {
            id: "partner1Capital",
            label: "Capital Contribution — Partner 1 (₹)",
            labelHi: "पूंजी योगदान — साझेदार 1 (₹)",
            type: "number",
            required: true,
            placeholder: "e.g., 500000",
          },
          {
            id: "partner2Capital",
            label: "Capital Contribution — Partner 2 (₹)",
            labelHi: "पूंजी योगदान — साझेदार 2 (₹)",
            type: "number",
            required: true,
            placeholder: "e.g., 500000",
          },
          {
            id: "profitSharingRatio",
            label: "Profit Sharing Ratio (e.g., 50:50)",
            labelHi: "लाभ वितरण अनुपात (जैसे, 50:50)",
            type: "text",
            required: true,
            placeholder: "e.g., 50:50 or 60:40",
          },
        ],
      },
      {
        id: "duration",
        title: "Duration & Banking",
        titleHi: "अवधि और बैंकिंग",
        fields: [
          {
            id: "startDate",
            label: "Partnership Start Date",
            labelHi: "साझेदारी प्रारंभ तिथि",
            type: "date",
            required: true,
          },
          {
            id: "partnershipDuration",
            label: "Duration (years or 'at will')",
            labelHi: "अवधि (वर्ष या 'इच्छानुसार')",
            type: "text",
            required: true,
            placeholder: "e.g., 5 or at will",
          },
          {
            id: "bankDetails",
            label: "Bank Account Details",
            labelHi: "बैंक खाता विवरण",
            type: "textarea",
            required: true,
            placeholder: "Bank name, branch, account number, IFSC code of the partnership firm",
          },
        ],
      },
      {
        id: "governance",
        title: "Dispute Resolution & Dissolution",
        titleHi: "विवाद समाधान और विघटन",
        fields: [
          {
            id: "disputeResolution",
            label: "Dispute Resolution Mechanism",
            labelHi: "विवाद समाधान तंत्र",
            type: "select",
            required: true,
            options: [
              { value: "arbitration", label: "Arbitration", labelHi: "मध्यस्थता" },
              { value: "mediation", label: "Mediation", labelHi: "मध्यस्थता (Mediation)" },
              { value: "court", label: "Court of Law", labelHi: "न्यायालय" },
            ],
          },
          {
            id: "dissolutionTerms",
            label: "Dissolution Terms",
            labelHi: "विघटन की शर्तें",
            type: "textarea",
            required: false,
            placeholder: "Conditions and procedure for dissolution of the partnership",
          },
          {
            id: "specialClauses",
            label: "Special Clauses",
            labelHi: "विशेष खंड",
            type: "textarea",
            required: false,
            placeholder: "Any additional special clauses or conditions (optional)",
          },
        ],
      },
    ],
  },

  // ============================================================
  // 6. LEGAL NOTICE (3 steps)
  // ============================================================
  {
    id: "legal-notice",
    name: "Legal Notice",
    nameHi: "कानूनी नोटिस",
    description:
      "Draft a formal legal notice for disputes, breaches, or claims with proper legal basis under Indian law.",
    descriptionHi:
      "भारतीय कानून के तहत उचित कानूनी आधार के साथ विवादों, उल्लंघनों या दावों के लिए औपचारिक कानूनी नोटिस तैयार करें।",
    icon: "⚖️",
    category: "personal",
    estimatedTime: "5–7 min",
    price: 249,
    formSteps: [
      {
        id: "parties",
        title: "Sender & Recipient",
        titleHi: "प्रेषक और प्राप्तकर्ता",
        fields: [
          {
            id: "senderName",
            label: "Sender Name",
            labelHi: "प्रेषक का नाम",
            type: "text",
            required: true,
            placeholder: "e.g., Vikram Desai",
          },
          {
            id: "senderAddress",
            label: "Sender Address",
            labelHi: "प्रेषक का पता",
            type: "textarea",
            required: true,
            placeholder: "Full address of the sender",
          },
          {
            id: "recipientName",
            label: "Recipient Name",
            labelHi: "प्राप्तकर्ता का नाम",
            type: "text",
            required: true,
            placeholder: "e.g., XYZ Corporation / Mr. Singh",
          },
          {
            id: "recipientAddress",
            label: "Recipient Address",
            labelHi: "प्राप्तकर्ता का पता",
            type: "textarea",
            required: true,
            placeholder: "Full address of the recipient",
          },
          {
            id: "noticeDate",
            label: "Date of Notice",
            labelHi: "नोटिस की तिथि",
            type: "date",
            required: true,
          },
        ],
      },
      {
        id: "grievance",
        title: "Grievance Details",
        titleHi: "शिकायत विवरण",
        fields: [
          {
            id: "subject",
            label: "Subject / Reference",
            labelHi: "विषय / संदर्भ",
            type: "text",
            required: true,
            placeholder: "e.g., Legal Notice for Non-Payment of Dues",
          },
          {
            id: "grievanceNature",
            label: "Nature of Grievance",
            labelHi: "शिकायत की प्रकृति",
            type: "textarea",
            required: true,
            placeholder: "e.g., Non-payment of invoice, breach of contract, recovery of dues, cheque bounce",
          },
          {
            id: "legalBasis",
            label: "Legal Basis",
            labelHi: "कानूनी आधार",
            type: "textarea",
            required: true,
            placeholder: "e.g., Section 138 of the Negotiable Instruments Act, 1881; Breach under Section 73 of the Indian Contract Act, 1872",
          },
        ],
      },
      {
        id: "relief",
        title: "Relief & Service",
        titleHi: "राहत और सेवा",
        fields: [
          {
            id: "reliefSought",
            label: "Relief Sought",
            labelHi: "मांगी गई राहत",
            type: "textarea",
            required: true,
            placeholder: "e.g., Pay ₹50,000 within 15 days along with interest at 18% p.a.",
          },
          {
            id: "deadlineDays",
            label: "Deadline for Response (days)",
            labelHi: "जवाब की अंतिम तिथि (दिन)",
            type: "number",
            required: true,
            placeholder: "e.g., 15",
          },
          {
            id: "sentVia",
            label: "Sent Via",
            labelHi: "भेजा गया माध्यम",
            type: "select",
            required: true,
            options: [
              { value: "registered-post", label: "Registered Post (AD)", labelHi: "रजिस्टर्ड डाक (AD)" },
              { value: "email", label: "Email", labelHi: "ईमेल" },
              { value: "both", label: "Both (Registered Post + Email)", labelHi: "दोनों (रजिस्टर्ड डाक + ईमेल)" },
            ],
          },
        ],
      },
    ],
  },

  // ============================================================
  // 7. AFFIDAVIT (3 steps)
  // ============================================================
  {
    id: "affidavit",
    name: "Affidavit",
    nameHi: "शपथ पत्र",
    description:
      "Create a sworn affidavit for name changes, address proof, income declaration, and more under the Indian Oaths Act, 1969.",
    descriptionHi:
      "भारतीय शपथ अधिनियम, 1969 के तहत नाम परिवर्तन, पता प्रमाण, आय घोषणा आदि के लिए शपथ पत्र बनाएं।",
    icon: "📝",
    category: "personal",
    estimatedTime: "4–6 min",
    price: 199,
    formSteps: [
      {
        id: "deponent",
        title: "Deponent Details",
        titleHi: "शपथकर्ता विवरण",
        fields: [
          {
            id: "deponentName",
            label: "Deponent Full Name",
            labelHi: "शपथकर्ता का पूरा नाम",
            type: "text",
            required: true,
            placeholder: "e.g., Ananya Iyer",
          },
          {
            id: "parentName",
            label: "Father's / Mother's Name",
            labelHi: "पिता / माता का नाम",
            type: "text",
            required: true,
            placeholder: "e.g., S/o Ramesh Iyer or D/o Ramesh Iyer",
          },
          {
            id: "deponentAge",
            label: "Age",
            labelHi: "आयु",
            type: "number",
            required: true,
            placeholder: "e.g., 34",
          },
          {
            id: "deponentAddress",
            label: "Address",
            labelHi: "पता",
            type: "textarea",
            required: true,
            placeholder: "Full residential address of the deponent",
          },
        ],
      },
      {
        id: "declaration",
        title: "Declaration Content",
        titleHi: "घोषणा सामग्री",
        fields: [
          {
            id: "affidavitPurpose",
            label: "Purpose of Affidavit",
            labelHi: "शपथ पत्र का उद्देश्य",
            type: "textarea",
            required: true,
            placeholder: "e.g., Name change from 'Ananya Gupta' to 'Ananya Iyer' post-marriage; Address proof for passport application; Income declaration for education loan",
          },
          {
            id: "statementOfFacts",
            label: "Statement of Facts (Sworn Statement)",
            labelHi: "तथ्यों का विवरण (शपथ कथन)",
            type: "textarea",
            required: true,
            placeholder: "Detailed sworn statement of facts that the deponent affirms to be true",
          },
          {
            id: "courtAuthority",
            label: "Court / Authority Where Submitted",
            labelHi: "न्यायालय / प्राधिकरण जहां प्रस्तुत",
            type: "text",
            required: true,
            placeholder: "e.g., Hon'ble High Court of Karnataka, or Passport Seva Kendra, Bengaluru",
          },
        ],
      },
      {
        id: "verification",
        title: "Verification & Notary",
        titleHi: "सत्यापन और नोटरी",
        fields: [
          {
            id: "affidavitDate",
            label: "Date",
            labelHi: "दिनांक",
            type: "date",
            required: true,
          },
          {
            id: "affidavitPlace",
            label: "Place",
            labelHi: "स्थान",
            type: "text",
            required: true,
            placeholder: "e.g., Bengaluru",
          },
          {
            id: "notaryName",
            label: "Notary Name (optional)",
            labelHi: "नोटरी का नाम (वैकल्पिक)",
            type: "text",
            required: false,
            placeholder: "e.g., Shri K. Ramachandran, Notary Public",
          },
          {
            id: "notaryRegNumber",
            label: "Notary Registration Number (optional)",
            labelHi: "नोटरी पंजीकरण संख्या (वैकल्पिक)",
            type: "text",
            required: false,
            placeholder: "e.g., N-2024/KA/00123",
          },
        ],
      },
    ],
  },

  // ============================================================
  // 8. TERMS OF SERVICE / PRIVACY POLICY (4 steps)
  // ============================================================
  {
    id: "terms-of-service",
    name: "Terms of Service",
    nameHi: "सेवा की शर्तें",
    description:
      "Generate comprehensive Terms of Service and Privacy Policy for your website, app, or SaaS product compliant with the Information Technology Act, 2000 and IT Rules.",
    descriptionHi:
      "सूचना प्रौद्योगिकी अधिनियम, 2000 और आईटी नियमों के अनुरूप अपनी वेबसाइट, ऐप या SaaS उत्पाद के लिए व्यापक सेवा शर्तें और गोपनीयता नीति तैयार करें।",
    icon: "📋",
    category: "business",
    estimatedTime: "7–9 min",
    price: 349,
    formSteps: [
      {
        id: "business",
        title: "Business Details",
        titleHi: "व्यावसायिक विवरण",
        fields: [
          {
            id: "companyName",
            label: "Company Name",
            labelHi: "कंपनी का नाम",
            type: "text",
            required: true,
            placeholder: "e.g., TechVentures Pvt Ltd",
          },
          {
            id: "websiteUrl",
            label: "Website / App URL",
            labelHi: "वेबसाइट / ऐप URL",
            type: "text",
            required: true,
            placeholder: "e.g., https://example.com",
          },
          {
            id: "contactEmail",
            label: "Contact Email",
            labelHi: "संपर्क ईमेल",
            type: "email",
            required: true,
            placeholder: "e.g., legal@company.com",
          },
          {
            id: "businessAddress",
            label: "Business Address",
            labelHi: "व्यावसायिक पता",
            type: "textarea",
            required: true,
            placeholder: "Registered office address of the company",
          },
        ],
      },
      {
        id: "service",
        title: "Service Description",
        titleHi: "सेवा विवरण",
        fields: [
          {
            id: "serviceDescription",
            label: "Service Description",
            labelHi: "सेवा विवरण",
            type: "textarea",
            required: true,
            placeholder: "Describe what your website/app does, the services provided, and how users interact with it",
          },
          {
            id: "userObligations",
            label: "User Obligations",
            labelHi: "उपयोगकर्ता दायित्व",
            type: "textarea",
            required: true,
            placeholder: "e.g., Users must provide accurate information, must not misuse the platform, must be 18+ years old",
          },
          {
            id: "acceptableUse",
            label: "Acceptable Use Policy",
            labelHi: "स्वीकार्य उपयोग नीति",
            type: "textarea",
            required: true,
            placeholder: "e.g., No illegal activities, no spamming, no reverse engineering, no unauthorized access",
          },
        ],
      },
      {
        id: "privacy",
        title: "Data & Privacy",
        titleHi: "डेटा और गोपनीयता",
        fields: [
          {
            id: "dataCollected",
            label: "Types of Data Collected",
            labelHi: "एकत्रित डेटा के प्रकार",
            type: "textarea",
            required: true,
            placeholder: "e.g., Name, email, phone, IP address, device info, usage analytics, payment information",
          },
          {
            id: "thirdPartySharing",
            label: "Third-Party Data Sharing",
            labelHi: "तृतीय-पक्ष डेटा साझाकरण",
            type: "select",
            required: true,
            options: [
              { value: "yes", label: "Yes, data is shared with third parties", labelHi: "हाँ, तृतीय पक्षों के साथ डेटा साझा किया जाता है" },
              { value: "no", label: "No, data is not shared with third parties", labelHi: "नहीं, डेटा साझा नहीं किया जाता" },
            ],
          },
          {
            id: "cookiePolicy",
            label: "Cookie Policy",
            labelHi: "कुकी नीति",
            type: "select",
            required: true,
            options: [
              { value: "yes", label: "Yes, the site/app uses cookies", labelHi: "हाँ, साइट/ऐप कुकीज़ का उपयोग करता है" },
              { value: "no", label: "No, the site/app does not use cookies", labelHi: "नहीं, साइट/ऐप कुकीज़ का उपयोग नहीं करता" },
            ],
          },
          {
            id: "dataRetention",
            label: "Data Retention Period",
            labelHi: "डेटा अवधारण अवधि",
            type: "text",
            required: true,
            placeholder: "e.g., 2 years after account closure, or as required by law",
          },
        ],
      },
      {
        id: "legal",
        title: "Legal Terms",
        titleHi: "कानूनी शर्तें",
        fields: [
          {
            id: "limitationOfLiability",
            label: "Limitation of Liability",
            labelHi: "दायित्व की सीमा",
            type: "select",
            required: true,
            options: [
              { value: "standard", label: "Standard (to the extent permitted by law)", labelHi: "मानक (कानून द्वारा अनुमत सीमा तक)" },
              { value: "custom", label: "Custom", labelHi: "कस्टम" },
            ],
          },
          {
            id: "governingState",
            label: "Governing Law State",
            labelHi: "शासकीय कानून राज्य",
            type: "select",
            required: true,
            options: INDIAN_STATES,
          },
          {
            id: "disputeResolution",
            label: "Dispute Resolution",
            labelHi: "विवाद समाधान",
            type: "textarea",
            required: true,
            placeholder: "e.g., All disputes subject to the exclusive jurisdiction of courts in Bengaluru; parties shall first attempt mediation before litigation",
          },
          {
            id: "lastUpdated",
            label: "Last Updated Date",
            labelHi: "अंतिम अद्यतन तिथि",
            type: "date",
            required: true,
          },
        ],
      },
    ],
  },
];

export function getTemplateById(id: string): DocumentTemplate | undefined {
  return DOCUMENT_TEMPLATES.find((t) => t.id === id);
}

export function getTemplatesByCategory(
  category: DocumentTemplate["category"]
): DocumentTemplate[] {
  return DOCUMENT_TEMPLATES.filter((t) => t.category === category);
}
