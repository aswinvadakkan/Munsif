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
  {
    id: "employment-contract",
    name: "Employment Contract",
    nameHi: "रोजगार अनुबंध",
    description:
      "Generate an employment agreement compliant with Indian labour laws.",
    descriptionHi:
      "भारतीय श्रम कानूनों के अनुरूप रोजगार समझौता तैयार करें।",
    icon: "💼",
    category: "employment",
    estimatedTime: "6–8 min",
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
          },
          {
            id: "employeeName",
            label: "Employee Full Name",
            labelHi: "कर्मचारी का पूरा नाम",
            type: "text",
            required: true,
          },
          {
            id: "employeePan",
            label: "Employee PAN",
            labelHi: "कर्मचारी का पैन",
            type: "text",
            required: false,
          },
        ],
      },
      {
        id: "role",
        title: "Role & Compensation",
        titleHi: "भूमिका और मुआवजा",
        fields: [
          {
            id: "jobTitle",
            label: "Job Title",
            labelHi: "पद का नाम",
            type: "text",
            required: true,
          },
          {
            id: "salary",
            label: "Annual CTC (₹)",
            labelHi: "वार्षिक सीटीसी (₹)",
            type: "number",
            required: true,
          },
          {
            id: "joiningDate",
            label: "Joining Date",
            labelHi: "कार्यभार ग्रहण तिथि",
            type: "date",
            required: true,
          },
          {
            id: "probationMonths",
            label: "Probation Period (months)",
            labelHi: "परिवीक्षा अवधि (महीने)",
            type: "number",
            required: true,
          },
          {
            id: "workLocation",
            label: "Work Location",
            labelHi: "कार्य स्थान",
            type: "text",
            required: true,
          },
        ],
      },
    ],
  },
  {
    id: "freelance-agreement",
    name: "Freelance / Service Agreement",
    nameHi: "फ्रीलांस / सेवा अनुबंध",
    description:
      "Define scope, deliverables, and payment terms for freelance engagements.",
    descriptionHi:
      "फ्रीलांस कार्यों के लिए कार्यक्षेत्र, डिलीवरेबल्स और भुगतान शर्तें परिभाषित करें।",
    icon: "✍️",
    category: "business",
    estimatedTime: "5–7 min",
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
          },
          {
            id: "freelancerName",
            label: "Freelancer / Service Provider",
            labelHi: "फ्रीलांसर / सेवा प्रदाता",
            type: "text",
            required: true,
          },
        ],
      },
      {
        id: "scope",
        title: "Scope & Payment",
        titleHi: "कार्यक्षेत्र और भुगतान",
        fields: [
          {
            id: "serviceDescription",
            label: "Service Description",
            labelHi: "सेवा विवरण",
            type: "textarea",
            required: true,
          },
          {
            id: "totalAmount",
            label: "Total Project Fee (₹)",
            labelHi: "कुल परियोजना शुल्क (₹)",
            type: "number",
            required: true,
          },
          {
            id: "paymentTerms",
            label: "Payment Terms",
            labelHi: "भुगतान शर्तें",
            type: "select",
            required: true,
            options: [
              { value: "upfront", label: "100% Upfront", labelHi: "100% अग्रिम" },
              {
                value: "5050",
                label: "50% Advance, 50% on Completion",
                labelHi: "50% अग्रिम, 50% पूर्णता पर",
              },
              { value: "milestone", label: "Milestone-based", labelHi: "माइलस्टोन आधारित" },
              { value: "net30", label: "Net 30 Days", labelHi: "नेट 30 दिन" },
            ],
          },
          {
            id: "startDate",
            label: "Start Date",
            labelHi: "प्रारंभ तिथि",
            type: "date",
            required: true,
          },
          {
            id: "endDate",
            label: "Expected End Date",
            labelHi: "अपेक्षित समाप्ति तिथि",
            type: "date",
            required: true,
          },
        ],
      },
    ],
  },
  {
    id: "partnership-deed",
    name: "Partnership Deed",
    nameHi: "साझेदारी विलेख",
    description:
      "Formalize your business partnership with a comprehensive deed covering roles, profit sharing, and exit terms.",
    descriptionHi:
      "भूमिकाओं, लाभ वितरण और निकास शर्तों को कवर करने वाले व्यापक विलेख के साथ अपनी व्यावसायिक साझेदारी को औपचारिक बनाएं।",
    icon: "🤝",
    category: "business",
    estimatedTime: "6–8 min",
    price: 599,
    formSteps: [
      {
        id: "parties",
        title: "Partners",
        titleHi: "साझेदार",
        fields: [
          {
            id: "partner1Name",
            label: "Partner 1 Full Name",
            labelHi: "साझेदार 1 का पूरा नाम",
            type: "text",
            required: true,
          },
          {
            id: "partner2Name",
            label: "Partner 2 Full Name",
            labelHi: "साझेदार 2 का पूरा नाम",
            type: "text",
            required: true,
          },
          {
            id: "firmName",
            label: "Partnership Firm Name",
            labelHi: "साझेदारी फर्म का नाम",
            type: "text",
            required: true,
          },
        ],
      },
      {
        id: "terms",
        title: "Business Terms",
        titleHi: "व्यावसायिक शर्तें",
        fields: [
          {
            id: "businessType",
            label: "Nature of Business",
            labelHi: "व्यवसाय की प्रकृति",
            type: "textarea",
            required: true,
          },
          {
            id: "capitalContribution",
            label: "Capital Contribution per Partner (₹)",
            labelHi: "प्रति साझेदार पूंजी योगदान (₹)",
            type: "number",
            required: true,
          },
          {
            id: "profitShare",
            label: "Profit Sharing Ratio (Partner 1 : Partner 2)",
            labelHi: "लाभ वितरण अनुपात",
            type: "text",
            required: true,
            placeholder: "e.g., 50:50",
          },
          {
            id: "startDate",
            label: "Partnership Start Date",
            labelHi: "साझेदारी प्रारंभ तिथि",
            type: "date",
            required: true,
          },
          {
            id: "registeredAddress",
            label: "Registered Office Address",
            labelHi: "पंजीकृत कार्यालय का पता",
            type: "textarea",
            required: true,
          },
        ],
      },
    ],
  },
  {
    id: "legal-notice",
    name: "Legal Notice",
    nameHi: "कानूनी नोटिस",
    description:
      "Draft a formal legal notice for disputes, breaches, or claims under Indian law.",
    descriptionHi:
      "भारतीय कानून के तहत विवादों, उल्लंघनों या दावों के लिए औपचारिक कानूनी नोटिस तैयार करें।",
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
            label: "Your Name (Sender)",
            labelHi: "आपका नाम (प्रेषक)",
            type: "text",
            required: true,
          },
          {
            id: "senderAddress",
            label: "Your Address",
            labelHi: "आपका पता",
            type: "textarea",
            required: true,
          },
          {
            id: "recipientName",
            label: "Recipient Name",
            labelHi: "प्राप्तकर्ता का नाम",
            type: "text",
            required: true,
          },
          {
            id: "recipientAddress",
            label: "Recipient Address",
            labelHi: "प्राप्तकर्ता का पता",
            type: "textarea",
            required: true,
          },
        ],
      },
      {
        id: "notice",
        title: "Notice Content",
        titleHi: "नोटिस सामग्री",
        fields: [
          {
            id: "subject",
            label: "Subject / Matter",
            labelHi: "विषय",
            type: "text",
            required: true,
          },
          {
            id: "facts",
            label: "Facts & Grounds",
            labelHi: "तथ्य और आधार",
            type: "textarea",
            required: true,
          },
          {
            id: "relief",
            label: "Relief / Demand Sought",
            labelHi: "मांगी गई राहत",
            type: "textarea",
            required: true,
          },
          {
            id: "deadlineDays",
            label: "Response Deadline (days)",
            labelHi: "जवाब की अंतिम तिथि (दिन)",
            type: "number",
            required: true,
          },
        ],
      },
    ],
  },
  {
    id: "affidavit",
    name: "Affidavit",
    nameHi: "शपथ पत्र",
    description:
      "Create a sworn affidavit for name changes, address proof, income declaration, and more.",
    descriptionHi:
      "नाम परिवर्तन, पता प्रमाण, आय घोषणा आदि के लिए शपथ पत्र बनाएं।",
    icon: "📝",
    category: "personal",
    estimatedTime: "4–6 min",
    price: 199,
    formSteps: [
      {
        id: "declarant",
        title: "Declarant Details",
        titleHi: "घोषणाकर्ता विवरण",
        fields: [
          {
            id: "declarantName",
            label: "Full Name",
            labelHi: "पूरा नाम",
            type: "text",
            required: true,
          },
          {
            id: "declarantAddress",
            label: "Address",
            labelHi: "पता",
            type: "textarea",
            required: true,
          },
          {
            id: "declarantAge",
            label: "Age",
            labelHi: "आयु",
            type: "number",
            required: true,
          },
        ],
      },
      {
        id: "declaration",
        title: "Declaration Content",
        titleHi: "घोषणा सामग्री",
        fields: [
          {
            id: "affidavitType",
            label: "Type of Affidavit",
            labelHi: "शपथ पत्र का प्रकार",
            type: "select",
            required: true,
            options: [
              { value: "name-change", label: "Name Change", labelHi: "नाम परिवर्तन" },
              { value: "address-proof", label: "Address Proof", labelHi: "पता प्रमाण" },
              { value: "income-declaration", label: "Income Declaration", labelHi: "आय घोषणा" },
              { value: "other", label: "Other", labelHi: "अन्य" },
            ],
          },
          {
            id: "declarationText",
            label: "Declaration Statement",
            labelHi: "घोषणा विवरण",
            type: "textarea",
            required: true,
          },
        ],
      },
    ],
  },
  {
    id: "terms-of-service",
    name: "Terms of Service",
    nameHi: "सेवा की शर्तें",
    description:
      "Generate comprehensive Terms of Service for your website, app, or SaaS product.",
    descriptionHi:
      "अपनी वेबसाइट, ऐप या SaaS उत्पाद के लिए व्यापक सेवा शर्तें तैयार करें।",
    icon: "📋",
    category: "business",
    estimatedTime: "6–8 min",
    price: 349,
    formSteps: [
      {
        id: "business",
        title: "Business Details",
        titleHi: "व्यावसायिक विवरण",
        fields: [
          {
            id: "companyName",
            label: "Company / Business Name",
            labelHi: "कंपनी / व्यवसाय का नाम",
            type: "text",
            required: true,
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
            id: "serviceType",
            label: "Type of Service",
            labelHi: "सेवा का प्रकार",
            type: "select",
            required: true,
            options: [
              { value: "saas", label: "SaaS", labelHi: "SaaS" },
              { value: "ecommerce", label: "E-Commerce", labelHi: "ई-कॉमर्स" },
              { value: "marketplace", label: "Marketplace", labelHi: "मार्केटप्लेस" },
              { value: "content", label: "Content / Media", labelHi: "सामग्री / मीडिया" },
              { value: "other", label: "Other", labelHi: "अन्य" },
            ],
          },
          {
            id: "contactEmail",
            label: "Contact Email",
            labelHi: "संपर्क ईमेल",
            type: "email",
            required: true,
            placeholder: "e.g., legal@company.com",
          },
        ],
      },
      {
        id: "terms",
        title: "Key Terms",
        titleHi: "मुख्य शर्तें",
        fields: [
          {
            id: "paymentModel",
            label: "Payment Model",
            labelHi: "भुगतान मॉडल",
            type: "select",
            required: true,
            options: [
              { value: "subscription", label: "Subscription", labelHi: "सदस्यता" },
              { value: "one-time", label: "One-Time Purchase", labelHi: "एक बार की खरीद" },
              { value: "free", label: "Free Service", labelHi: "मुफ्त सेवा" },
              { value: "freemium", label: "Freemium", labelHi: "फ्रीमियम" },
            ],
          },
          {
            id: "refundPolicy",
            label: "Refund Policy",
            labelHi: "वापसी नीति",
            type: "select",
            required: true,
            options: [
              { value: "no-refund", label: "No Refunds", labelHi: "कोई वापसी नहीं" },
              { value: "7-days", label: "7-Day Refund", labelHi: "7-दिन की वापसी" },
              { value: "30-days", label: "30-Day Refund", labelHi: "30-दिन की वापसी" },
              { value: "custom", label: "Custom Policy", labelHi: "कस्टम नीति" },
            ],
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
