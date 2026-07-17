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

export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  {
    id: "rental-agreement",
    name: "Rental Agreement",
    nameHi: "किराया अनुबंध",
    description: "Create a legally grounded residential rental agreement compliant with Indian tenancy norms.",
    descriptionHi: "भारतीय किरायेदारी मानदंडों के अनुरूप आवासीय किराया अनुबंध बनाएं।",
    icon: "🏠",
    category: "property",
    formSteps: [
      {
        id: "parties",
        title: "Parties Involved",
        titleHi: "संबंधित पक्ष",
        fields: [
          { id: "landlordName", label: "Landlord Full Name", labelHi: "मकान मालिक का पूरा नाम", type: "text", required: true },
          { id: "tenantName", label: "Tenant Full Name", labelHi: "किराएदार का पूरा नाम", type: "text", required: true },
          { id: "landlordPan", label: "Landlord PAN", labelHi: "मकान मालिक का पैन", type: "text", required: false },
          { id: "tenantPan", label: "Tenant PAN", labelHi: "किराएदार का पैन", type: "text", required: false },
        ],
      },
      {
        id: "property",
        title: "Property Details",
        titleHi: "संपत्ति विवरण",
        fields: [
          { id: "address", label: "Full Property Address", labelHi: "पूरा पता", type: "textarea", required: true },
          { id: "propertyType", label: "Property Type", labelHi: "संपत्ति का प्रकार", type: "select", required: true, options: [
            { value: "apartment", label: "Apartment / Flat", labelHi: "अपार्टमेंट / फ्लैट" },
            { value: "house", label: "Independent House", labelHi: "स्वतंत्र घर" },
            { value: "villa", label: "Villa", labelHi: "विला" },
          ]},
          { id: "furnishing", label: "Furnishing Status", labelHi: "साज-सज्जा की स्थिति", type: "select", required: true, options: [
            { value: "unfurnished", label: "Unfurnished", labelHi: "असज्जित" },
            { value: "semi-furnished", label: "Semi-Furnished", labelHi: "अर्ध-सज्जित" },
            { value: "fully-furnished", label: "Fully Furnished", labelHi: "पूर्णतः सज्जित" },
          ]},
        ],
      },
      {
        id: "terms",
        title: "Rental Terms",
        titleHi: "किराया शर्तें",
        fields: [
          { id: "monthlyRent", label: "Monthly Rent (₹)", labelHi: "मासिक किराया (₹)", type: "number", required: true },
          { id: "securityDeposit", label: "Security Deposit (₹)", labelHi: "सुरक्षा जमा (₹)", type: "number", required: true },
          { id: "leaseStart", label: "Lease Start Date", labelHi: "लीज़ प्रारंभ तिथि", type: "date", required: true },
          { id: "leaseDuration", label: "Lease Duration (months)", labelHi: "लीज़ अवधि (महीने)", type: "number", required: true },
          { id: "noticePeriod", label: "Notice Period (days)", labelHi: "नोटिस अवधि (दिन)", type: "number", required: true },
        ],
      },
    ],
  },
  {
    id: "nda",
    name: "Non-Disclosure Agreement",
    nameHi: "गैर-प्रकटीकरण समझौता",
    description: "Protect your business secrets with an NDA tailored for Indian startups and SMEs.",
    descriptionHi: "भारतीय स्टार्टअप और एसएमई के लिए अनुकूलित गैर-प्रकटीकरण समझौता।",
    icon: "🔒",
    category: "business",
    formSteps: [
      {
        id: "parties",
        title: "Parties Involved",
        titleHi: "संबंधित पक्ष",
        fields: [
          { id: "disclosingParty", label: "Disclosing Party Name", labelHi: "प्रकटकर्ता पक्ष का नाम", type: "text", required: true },
          { id: "receivingParty", label: "Receiving Party Name", labelHi: "प्राप्तकर्ता पक्ष का नाम", type: "text", required: true },
        ],
      },
      {
        id: "scope",
        title: "Agreement Scope",
        titleHi: "समझौते का दायरा",
        fields: [
          { id: "purpose", label: "Purpose of Disclosure", labelHi: "प्रकटीकरण का उद्देश्य", type: "textarea", required: true },
          { id: "duration", label: "Confidentiality Duration (months)", labelHi: "गोपनीयता अवधि (महीने)", type: "number", required: true },
          { id: "jurisdiction", label: "Jurisdiction City", labelHi: "अधिकार क्षेत्र शहर", type: "text", required: true, placeholder: "e.g., Mumbai" },
        ],
      },
    ],
  },
  {
    id: "employment-contract",
    name: "Employment Contract",
    nameHi: "रोजगार अनुबंध",
    description: "Generate an employment agreement compliant with Indian labour laws.",
    descriptionHi: "भारतीय श्रम कानूनों के अनुरूप रोजगार समझौता तैयार करें।",
    icon: "💼",
    category: "employment",
    formSteps: [
      {
        id: "parties",
        title: "Employer & Employee",
        titleHi: "नियोक्ता और कर्मचारी",
        fields: [
          { id: "employerName", label: "Company / Employer Name", labelHi: "कंपनी / नियोक्ता का नाम", type: "text", required: true },
          { id: "employeeName", label: "Employee Full Name", labelHi: "कर्मचारी का पूरा नाम", type: "text", required: true },
          { id: "employeePan", label: "Employee PAN", labelHi: "कर्मचारी का पैन", type: "text", required: false },
        ],
      },
      {
        id: "role",
        title: "Role & Compensation",
        titleHi: "भूमिका और मुआवजा",
        fields: [
          { id: "jobTitle", label: "Job Title", labelHi: "पद का नाम", type: "text", required: true },
          { id: "salary", label: "Annual CTC (₹)", labelHi: "वार्षिक सीटीसी (₹)", type: "number", required: true },
          { id: "joiningDate", label: "Joining Date", labelHi: "कार्यभार ग्रहण तिथि", type: "date", required: true },
          { id: "probationMonths", label: "Probation Period (months)", labelHi: "परिवीक्षा अवधि (महीने)", type: "number", required: true },
          { id: "workLocation", label: "Work Location", labelHi: "कार्य स्थान", type: "text", required: true },
        ],
      },
    ],
  },
  {
    id: "freelance-contract",
    name: "Freelance / Service Agreement",
    nameHi: "फ्रीलांस / सेवा अनुबंध",
    description: "Define scope, deliverables, and payment terms for freelance engagements.",
    descriptionHi: "फ्रीलांस कार्यों के लिए कार्यक्षेत्र, डिलीवरेबल्स और भुगतान शर्तें परिभाषित करें।",
    icon: "✍️",
    category: "business",
    formSteps: [
      {
        id: "parties",
        title: "Parties Involved",
        titleHi: "संबंधित पक्ष",
        fields: [
          { id: "clientName", label: "Client Name / Company", labelHi: "ग्राहक नाम / कंपनी", type: "text", required: true },
          { id: "freelancerName", label: "Freelancer / Service Provider", labelHi: "फ्रीलांसर / सेवा प्रदाता", type: "text", required: true },
        ],
      },
      {
        id: "scope",
        title: "Scope & Payment",
        titleHi: "कार्यक्षेत्र और भुगतान",
        fields: [
          { id: "serviceDescription", label: "Service Description", labelHi: "सेवा विवरण", type: "textarea", required: true },
          { id: "totalAmount", label: "Total Project Fee (₹)", labelHi: "कुल परियोजना शुल्क (₹)", type: "number", required: true },
          { id: "paymentTerms", label: "Payment Terms", labelHi: "भुगतान शर्तें", type: "select", required: true, options: [
            { value: "upfront", label: "100% Upfront", labelHi: "100% अग्रिम" },
            { value: "5050", label: "50% Advance, 50% on Completion", labelHi: "50% अग्रिम, 50% पूर्णता पर" },
            { value: "milestone", label: "Milestone-based", labelHi: "माइलस्टोन आधारित" },
            { value: "net30", label: "Net 30 Days", labelHi: "नेट 30 दिन" },
          ]},
          { id: "startDate", label: "Start Date", labelHi: "प्रारंभ तिथि", type: "date", required: true },
          { id: "endDate", label: "Expected End Date", labelHi: "अपेक्षित समाप्ति तिथि", type: "date", required: true },
        ],
      },
    ],
  },
  {
    id: "power-of-attorney",
    name: "Power of Attorney",
    nameHi: "मुख्तारनामा",
    description: "Authorize someone to act on your behalf with a legally valid PoA document.",
    descriptionHi: "कानूनी रूप से वैध मुख्तारनामा दस्तावेज़ के साथ किसी को अपनी ओर से कार्य करने के लिए अधिकृत करें।",
    icon: "📜",
    category: "personal",
    formSteps: [
      {
        id: "parties",
        title: "Parties Involved",
        titleHi: "संबंधित पक्ष",
        fields: [
          { id: "principalName", label: "Your Name (Principal)", labelHi: "आपका नाम (प्रधान)", type: "text", required: true },
          { id: "agentName", label: "Attorney / Agent Name", labelHi: "अटॉर्नी / एजेंट का नाम", type: "text", required: true },
          { id: "relationship", label: "Relationship", labelHi: "संबंध", type: "text", required: true },
        ],
      },
      {
        id: "scope",
        title: "Powers Granted",
        titleHi: "प्रदत्त शक्तियां",
        fields: [
          { id: "poaType", label: "Type of PoA", labelHi: "मुख्तारनामा का प्रकार", type: "select", required: true, options: [
            { value: "general", label: "General", labelHi: "सामान्य" },
            { value: "specific", label: "Specific / Limited", labelHi: "विशिष्ट / सीमित" },
          ]},
          { id: "powersDescription", label: "Powers Granted (Description)", labelHi: "प्रदत्त शक्तियां (विवरण)", type: "textarea", required: true },
          { id: "effectiveDate", label: "Effective Date", labelHi: "प्रभावी तिथि", type: "date", required: true },
          { id: "expiryDate", label: "Expiry Date (if any)", labelHi: "समाप्ति तिथि (यदि कोई हो)", type: "date", required: false },
        ],
      },
    ],
  },
  {
    id: "legal-notice",
    name: "Legal Notice",
    nameHi: "कानूनी नोटिस",
    description: "Draft a formal legal notice for disputes, breaches, or claims under Indian law.",
    descriptionHi: "भारतीय कानून के तहत विवादों, उल्लंघनों या दावों के लिए औपचारिक कानूनी नोटिस तैयार करें।",
    icon: "⚖️",
    category: "personal",
    formSteps: [
      {
        id: "parties",
        title: "Sender & Recipient",
        titleHi: "प्रेषक और प्राप्तकर्ता",
        fields: [
          { id: "senderName", label: "Your Name (Sender)", labelHi: "आपका नाम (प्रेषक)", type: "text", required: true },
          { id: "senderAddress", label: "Your Address", labelHi: "आपका पता", type: "textarea", required: true },
          { id: "recipientName", label: "Recipient Name", labelHi: "प्राप्तकर्ता का नाम", type: "text", required: true },
          { id: "recipientAddress", label: "Recipient Address", labelHi: "प्राप्तकर्ता का पता", type: "textarea", required: true },
        ],
      },
      {
        id: "notice",
        title: "Notice Content",
        titleHi: "नोटिस सामग्री",
        fields: [
          { id: "subject", label: "Subject / Matter", labelHi: "विषय", type: "text", required: true },
          { id: "facts", label: "Facts & Grounds", labelHi: "तथ्य और आधार", type: "textarea", required: true },
          { id: "relief", label: "Relief / Demand Sought", labelHi: "मांगी गई राहत", type: "textarea", required: true },
          { id: "deadlineDays", label: "Response Deadline (days)", labelHi: "जवाब की अंतिम तिथि (दिन)", type: "number", required: true },
        ],
      },
    ],
  },
  {
    id: "affidavit",
    name: "Affidavit",
    nameHi: "शपथ पत्र",
    description: "Create a sworn affidavit for name changes, address proof, income declaration, and more.",
    descriptionHi: "नाम परिवर्तन, पता प्रमाण, आय घोषणा आदि के लिए शपथ पत्र बनाएं।",
    icon: "📝",
    category: "personal",
    formSteps: [
      {
        id: "declarant",
        title: "Declarant Details",
        titleHi: "घोषणाकर्ता विवरण",
        fields: [
          { id: "declarantName", label: "Full Name", labelHi: "पूरा नाम", type: "text", required: true },
          { id: "declarantAddress", label: "Address", labelHi: "पता", type: "textarea", required: true },
          { id: "declarantAge", label: "Age", labelHi: "आयु", type: "number", required: true },
        ],
      },
      {
        id: "declaration",
        title: "Declaration Content",
        titleHi: "घोषणा सामग्री",
        fields: [
          { id: "affidavitType", label: "Type of Affidavit", labelHi: "शपथ पत्र का प्रकार", type: "select", required: true, options: [
            { value: "name-change", label: "Name Change", labelHi: "नाम परिवर्तन" },
            { value: "address-proof", label: "Address Proof", labelHi: "पता प्रमाण" },
            { value: "income-declaration", label: "Income Declaration", labelHi: "आय घोषणा" },
            { value: "other", label: "Other", labelHi: "अन्य" },
          ]},
          { id: "declarationText", label: "Declaration Statement", labelHi: "घोषणा विवरण", type: "textarea", required: true },
        ],
      },
    ],
  },
  {
    id: "partnership-deed",
    name: "Partnership Deed",
    nameHi: "साझेदारी विलेख",
    description: "Formalize your business partnership with a comprehensive deed covering roles, profit sharing, and exit terms.",
    descriptionHi: "भूमिकाओं, लाभ वितरण और निकास शर्तों को कवर करने वाले व्यापक विलेख के साथ अपनी व्यावसायिक साझेदारी को औपचारिक बनाएं।",
    icon: "🤝",
    category: "business",
    formSteps: [
      {
        id: "parties",
        title: "Partners",
        titleHi: "साझेदार",
        fields: [
          { id: "partner1Name", label: "Partner 1 Full Name", labelHi: "साझेदार 1 का पूरा नाम", type: "text", required: true },
          { id: "partner2Name", label: "Partner 2 Full Name", labelHi: "साझेदार 2 का पूरा नाम", type: "text", required: true },
          { id: "firmName", label: "Partnership Firm Name", labelHi: "साझेदारी फर्म का नाम", type: "text", required: true },
        ],
      },
      {
        id: "terms",
        title: "Business Terms",
        titleHi: "व्यावसायिक शर्तें",
        fields: [
          { id: "businessType", label: "Nature of Business", labelHi: "व्यवसाय की प्रकृति", type: "textarea", required: true },
          { id: "capitalContribution", label: "Capital Contribution per Partner (₹)", labelHi: "प्रति साझेदार पूंजी योगदान (₹)", type: "number", required: true },
          { id: "profitShare", label: "Profit Sharing Ratio (Partner 1 : Partner 2)", labelHi: "लाभ वितरण अनुपात", type: "text", required: true, placeholder: "e.g., 50:50" },
          { id: "startDate", label: "Partnership Start Date", labelHi: "साझेदारी प्रारंभ तिथि", type: "date", required: true },
          { id: "registeredAddress", label: "Registered Office Address", labelHi: "पंजीकृत कार्यालय का पता", type: "textarea", required: true },
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
