/**
 * Stamp duty rates for all Indian states and union territories.
 * Rates are approximate and based on the Indian Stamp Act, 1899
 * and respective state stamp acts.
 *
 * IMPORTANT: These rates are for informational purposes only.
 * Stamp duty must be verified with local authorities before execution.
 *
 * Last comprehensively reviewed: July 2026
 */

export interface StampDutyInfo {
  state: string;
  rentAgreement: {
    rate: string;        // e.g., "1% of annual rent" or "₹500 flat"
    maxCap?: string;     // e.g., "Max ₹25,000"
    notes?: string;      // e.g., "Plus ₹100 e-stamp fee"
  };
  nda: {
    rate: string;        // e.g., "₹100 (Article 5(h))"
    notes?: string;
  };
  affidavit: {
    rate: string;        // e.g., "₹10 (Article 5)"
    notes?: string;
  };
  partnership: {
    rate: string;
    notes?: string;
  };
  generalAgreement: {
    rate: string;
    notes?: string;
  };
  updatedDate: string;  // last verified date
}

/**
 * Returns the stamp duty information for a given state key.
 * Falls back to general guidance (Delhi/NCT) if state not found.
 */
export function getStampDuty(stateKey: string): StampDutyInfo | undefined {
  return STAMP_DUTY_RATES[stateKey];
}

/**
 * Compute percentage-based stamp duty for rental agreements.
 * Returns the calculated amount or null if not percentage-based.
 */
export function calculateRentAgreementDuty(
  stateKey: string,
  monthlyRent: number,
  durationMonths: number
): { amount: number; description: string } | null {
  const info = getStampDuty(stateKey);
  if (!info) return null;

  const rate = info.rentAgreement.rate;
  const annualRent = monthlyRent * 12;

  // Handle percentage-based rates
  if (rate.includes("% of annual rent")) {
    const match = rate.match(/([\d.]+)%/);
    if (match) {
      const pct = parseFloat(match[1]);
      const duty = Math.round((annualRent * pct) / 100);

      // Check for max cap
      if (info.rentAgreement.maxCap) {
        const capMatch = info.rentAgreement.maxCap.match(/₹([\d,]+)/);
        if (capMatch) {
          const cap = parseInt(capMatch[1].replace(/,/g, ""));
          if (duty > cap) {
            return {
              amount: cap,
              description: `${pct}% of annual rent (capped at ₹${cap.toLocaleString("en-IN")}) = ₹${cap.toLocaleString("en-IN")}`,
            };
          }
        }
      }

      return {
        amount: duty,
        description: `${pct}% of annual rent (₹${annualRent.toLocaleString("en-IN")}) = ₹${duty.toLocaleString("en-IN")}`,
      };
    }
  }

  // Handle percentage of total rent for full duration
  if (rate.includes("% of total rent")) {
    const match = rate.match(/([\d.]+)%/);
    if (match) {
      const pct = parseFloat(match[1]);
      const totalRent = monthlyRent * durationMonths;
      const duty = Math.round((totalRent * pct) / 100);
      return {
        amount: duty,
        description: `${pct}% of total rent (₹${totalRent.toLocaleString("en-IN")}) = ₹${duty.toLocaleString("en-IN")}`,
      };
    }
  }

  // Handle percentage of average annual rent
  if (rate.includes("% of avg annual rent")) {
    const match = rate.match(/([\d.]+)%/);
    if (match) {
      const pct = parseFloat(match[1]);
      const totalRent = monthlyRent * durationMonths;
      // Average annual rent = total rent spread over years
      const years = Math.max(1, durationMonths / 12);
      const avgAnnual = totalRent / years;
      const duty = Math.round((avgAnnual * pct) / 100);
      return {
        amount: duty,
        description: `${pct}% of avg annual rent (₹${Math.round(avgAnnual).toLocaleString("en-IN")}) = ₹${duty.toLocaleString("en-IN")}`,
      };
    }
  }

  // Flat fee or other — cannot calculate
  return null;
}

/**
 * Get the state display name from the state key.
 */
export function getStateName(stateKey: string): string {
  const info = STAMP_DUTY_RATES[stateKey];
  return info?.state ?? stateKey;
}

// ============================================================
// STAMP DUTY RATES FOR ALL 28 STATES + 8 UNION TERRITORIES
// ============================================================

const STAMP_DUTY_RATES: Record<string, StampDutyInfo> = {
  // ==================== STATES ====================

  "andhra-pradesh": {
    state: "Andhra Pradesh",
    rentAgreement: {
      rate: "0.5% of total rent for the lease period",
      notes: "Minimum ₹1,000. E-stamp available via SHCIL.",
    },
    nda: {
      rate: "₹100 (Article 5(h) — General Agreement)",
      notes: "If not otherwise provided for in the Schedule.",
    },
    affidavit: {
      rate: "₹10 (Article 4)",
      notes: "Standard affidavit stamp duty.",
    },
    partnership: {
      rate: "1% of capital contribution, max ₹10,000",
      notes: "As per AP Stamp Act amendment.",
    },
    generalAgreement: {
      rate: "₹100 (Article 5(h))",
      notes: "General agreement / MoU.",
    },
    updatedDate: "2026-07-01",
  },

  "arunachal-pradesh": {
    state: "Arunachal Pradesh",
    rentAgreement: {
      rate: "₹50 flat (up to 11 months)",
      notes: "Higher for longer duration. Low stamp duty regime.",
    },
    nda: {
      rate: "₹50 (Article 5)",
      notes: "General agreement stamp.",
    },
    affidavit: {
      rate: "₹5 (Article 4)",
    },
    partnership: {
      rate: "₹500 flat",
      notes: "Simplified regime.",
    },
    generalAgreement: {
      rate: "₹50 (Article 5)",
    },
    updatedDate: "2026-07-01",
  },

  "assam": {
    state: "Assam",
    rentAgreement: {
      rate: "1% of annual rent",
      notes: "Minimum ₹500.",
    },
    nda: {
      rate: "₹100 (Article 5(h))",
    },
    affidavit: {
      rate: "₹10 (Article 4)",
    },
    partnership: {
      rate: "1% of capital, max ₹5,000",
    },
    generalAgreement: {
      rate: "₹100 (Article 5(h))",
    },
    updatedDate: "2026-07-01",
  },

  "bihar": {
    state: "Bihar",
    rentAgreement: {
      rate: "2% of annual rent",
      notes: "Minimum ₹500. Tenancy agreement stamp.",
    },
    nda: {
      rate: "₹200 (Article 5(h))",
    },
    affidavit: {
      rate: "₹10 (Article 4)",
    },
    partnership: {
      rate: "2% of capital, max ₹10,000",
    },
    generalAgreement: {
      rate: "₹200 (Article 5(h))",
    },
    updatedDate: "2026-07-01",
  },

  "chhattisgarh": {
    state: "Chhattisgarh",
    rentAgreement: {
      rate: "1% of annual rent",
      notes: "Minimum ₹200.",
    },
    nda: {
      rate: "₹100 (Article 5(h))",
    },
    affidavit: {
      rate: "₹10 (Article 4)",
    },
    partnership: {
      rate: "1% of capital, max ₹5,000",
    },
    generalAgreement: {
      rate: "₹100 (Article 5(h))",
    },
    updatedDate: "2026-07-01",
  },

  "goa": {
    state: "Goa",
    rentAgreement: {
      rate: "1% of annual rent",
      notes: "Minimum ₹500. Goa follows the Indian Stamp Act, 1899.",
    },
    nda: {
      rate: "₹100 (Article 5(h))",
    },
    affidavit: {
      rate: "₹10 (Article 4)",
    },
    partnership: {
      rate: "1% of capital, max ₹10,000",
    },
    generalAgreement: {
      rate: "₹100 (Article 5(h))",
    },
    updatedDate: "2026-07-01",
  },

  "gujarat": {
    state: "Gujarat",
    rentAgreement: {
      rate: "1% of total rent for the lease period",
      notes: "Minimum ₹500. Gujarat Stamp Act, 1958 applies.",
    },
    nda: {
      rate: "₹100 (Article 5(h))",
    },
    affidavit: {
      rate: "₹20 (Article 4)",
    },
    partnership: {
      rate: "1% of capital, max ₹10,000",
    },
    generalAgreement: {
      rate: "₹100 (Article 5(h))",
    },
    updatedDate: "2026-07-01",
  },

  "haryana": {
    state: "Haryana",
    rentAgreement: {
      rate: "1.5% of annual rent",
      notes: "Minimum ₹500. E-stamp available.",
    },
    nda: {
      rate: "₹100 (Article 5(h))",
    },
    affidavit: {
      rate: "₹10 (Article 4)",
    },
    partnership: {
      rate: "1.5% of capital, max ₹10,000",
    },
    generalAgreement: {
      rate: "₹100 (Article 5(h))",
    },
    updatedDate: "2026-07-01",
  },

  "himachal-pradesh": {
    state: "Himachal Pradesh",
    rentAgreement: {
      rate: "1% of annual rent",
      notes: "Minimum ₹200.",
    },
    nda: {
      rate: "₹100 (Article 5(h))",
    },
    affidavit: {
      rate: "₹10 (Article 4)",
    },
    partnership: {
      rate: "1% of capital, max ₹5,000",
    },
    generalAgreement: {
      rate: "₹100 (Article 5(h))",
    },
    updatedDate: "2026-07-01",
  },

  "jharkhand": {
    state: "Jharkhand",
    rentAgreement: {
      rate: "1% of annual rent",
      notes: "Minimum ₹500.",
    },
    nda: {
      rate: "₹100 (Article 5(h))",
    },
    affidavit: {
      rate: "₹10 (Article 4)",
    },
    partnership: {
      rate: "1% of capital, max ₹5,000",
    },
    generalAgreement: {
      rate: "₹100 (Article 5(h))",
    },
    updatedDate: "2026-07-01",
  },

  "karnataka": {
    state: "Karnataka",
    rentAgreement: {
      rate: "0.5% of annual rent",
      maxCap: "Max ₹25,000",
      notes: "Karnataka Stamp Act, 1957. E-stamp available via Kaveri Online.",
    },
    nda: {
      rate: "₹100 (Article 5(h))",
    },
    affidavit: {
      rate: "₹20 (Article 4)",
    },
    partnership: {
      rate: "0.5% of capital, max ₹50,000",
      notes: "As per Karnataka Stamp Act.",
    },
    generalAgreement: {
      rate: "₹200 (Article 5(h))",
    },
    updatedDate: "2026-07-01",
  },

  "kerala": {
    state: "Kerala",
    rentAgreement: {
      rate: "0.5% of annual rent",
      maxCap: "Max ₹25,000",
      notes: "Kerala Stamp Act, 1959. E-stamp available.",
    },
    nda: {
      rate: "₹100 (Article 5(h))",
    },
    affidavit: {
      rate: "₹10 (Article 4)",
    },
    partnership: {
      rate: "0.5% of capital, max ₹25,000",
    },
    generalAgreement: {
      rate: "₹100 (Article 5(h))",
    },
    updatedDate: "2026-07-01",
  },

  "madhya-pradesh": {
    state: "Madhya Pradesh",
    rentAgreement: {
      rate: "1% of annual rent",
      notes: "Minimum ₹500.",
    },
    nda: {
      rate: "₹100 (Article 5(h))",
    },
    affidavit: {
      rate: "₹10 (Article 4)",
    },
    partnership: {
      rate: "1% of capital, max ₹10,000",
    },
    generalAgreement: {
      rate: "₹100 (Article 5(h))",
    },
    updatedDate: "2026-07-01",
  },

  "maharashtra": {
    state: "Maharashtra",
    rentAgreement: {
      rate: "0.25% of total rent for the lease period",
      maxCap: "Max ₹25,000 (₹25 lakhs for commercial)",
      notes: "Maharashtra Stamp Act, 1958. Leave & license agreement: 0.25% of total rent. E-stamp via GRAS.",
    },
    nda: {
      rate: "₹500 (Article 5(h) — General Agreement)",
      notes: "Maharashtra charges higher for general agreements.",
    },
    affidavit: {
      rate: "₹100 (Article 4)",
      notes: "Standard affidavit in Maharashtra.",
    },
    partnership: {
      rate: "1% of capital, max ₹15,000",
      notes: "As per Bombay Stamp Act (applicable in MH).",
    },
    generalAgreement: {
      rate: "₹500 (Article 5(h))",
    },
    updatedDate: "2026-07-01",
  },

  "manipur": {
    state: "Manipur",
    rentAgreement: {
      rate: "₹50 flat (up to 11 months)",
      notes: "Low stamp duty regime.",
    },
    nda: {
      rate: "₹50 (Article 5)",
    },
    affidavit: {
      rate: "₹5 (Article 4)",
    },
    partnership: {
      rate: "₹500 flat",
    },
    generalAgreement: {
      rate: "₹50 (Article 5)",
    },
    updatedDate: "2026-07-01",
  },

  "meghalaya": {
    state: "Meghalaya",
    rentAgreement: {
      rate: "₹50 flat (up to 11 months)",
      notes: "Low stamp duty regime.",
    },
    nda: {
      rate: "₹50 (Article 5)",
    },
    affidavit: {
      rate: "₹5 (Article 4)",
    },
    partnership: {
      rate: "₹500 flat",
    },
    generalAgreement: {
      rate: "₹50 (Article 5)",
    },
    updatedDate: "2026-07-01",
  },

  "mizoram": {
    state: "Mizoram",
    rentAgreement: {
      rate: "₹50 flat (up to 11 months)",
      notes: "Low stamp duty regime.",
    },
    nda: {
      rate: "₹50 (Article 5)",
    },
    affidavit: {
      rate: "₹5 (Article 4)",
    },
    partnership: {
      rate: "₹500 flat",
    },
    generalAgreement: {
      rate: "₹50 (Article 5)",
    },
    updatedDate: "2026-07-01",
  },

  "nagaland": {
    state: "Nagaland",
    rentAgreement: {
      rate: "₹50 flat (up to 11 months)",
      notes: "Low stamp duty regime.",
    },
    nda: {
      rate: "₹50 (Article 5)",
    },
    affidavit: {
      rate: "₹5 (Article 4)",
    },
    partnership: {
      rate: "₹500 flat",
    },
    generalAgreement: {
      rate: "₹50 (Article 5)",
    },
    updatedDate: "2026-07-01",
  },

  "odisha": {
    state: "Odisha",
    rentAgreement: {
      rate: "1% of annual rent",
      notes: "Minimum ₹200.",
    },
    nda: {
      rate: "₹100 (Article 5(h))",
    },
    affidavit: {
      rate: "₹10 (Article 4)",
    },
    partnership: {
      rate: "1% of capital, max ₹10,000",
    },
    generalAgreement: {
      rate: "₹100 (Article 5(h))",
    },
    updatedDate: "2026-07-01",
  },

  "punjab": {
    state: "Punjab",
    rentAgreement: {
      rate: "2% of annual rent",
      notes: "Minimum ₹500. Punjab Stamp Act.",
    },
    nda: {
      rate: "₹100 (Article 5(h))",
    },
    affidavit: {
      rate: "₹10 (Article 4)",
    },
    partnership: {
      rate: "2% of capital, max ₹10,000",
    },
    generalAgreement: {
      rate: "₹100 (Article 5(h))",
    },
    updatedDate: "2026-07-01",
  },

  "rajasthan": {
    state: "Rajasthan",
    rentAgreement: {
      rate: "1% of annual rent",
      notes: "Minimum ₹500. Rajasthan Stamp Act, 1998.",
    },
    nda: {
      rate: "₹100 (Article 5(h))",
    },
    affidavit: {
      rate: "₹10 (Article 4)",
    },
    partnership: {
      rate: "1% of capital, max ₹10,000",
    },
    generalAgreement: {
      rate: "₹100 (Article 5(h))",
    },
    updatedDate: "2026-07-01",
  },

  "sikkim": {
    state: "Sikkim",
    rentAgreement: {
      rate: "₹100 flat (up to 11 months)",
      notes: "Sikkim follows a simplified stamp duty regime.",
    },
    nda: {
      rate: "₹100 (Article 5)",
    },
    affidavit: {
      rate: "₹20 (Article 4)",
    },
    partnership: {
      rate: "₹1,000 flat",
    },
    generalAgreement: {
      rate: "₹100 (Article 5)",
    },
    updatedDate: "2026-07-01",
  },

  "tamil-nadu": {
    state: "Tamil Nadu",
    rentAgreement: {
      rate: "1% of annual rent",
      notes: "Minimum ₹500. E-stamp available via TN e-Stamp portal.",
    },
    nda: {
      rate: "₹100 (Article 5(h))",
    },
    affidavit: {
      rate: "₹20 (Article 4)",
    },
    partnership: {
      rate: "1% of capital, max ₹10,000",
    },
    generalAgreement: {
      rate: "₹100 (Article 5(h))",
    },
    updatedDate: "2026-07-01",
  },

  "telangana": {
    state: "Telangana",
    rentAgreement: {
      rate: "0.5% of total rent for the lease period",
      notes: "Minimum ₹500. E-stamp available.",
    },
    nda: {
      rate: "₹100 (Article 5(h))",
    },
    affidavit: {
      rate: "₹10 (Article 4)",
    },
    partnership: {
      rate: "0.5% of capital, max ₹10,000",
    },
    generalAgreement: {
      rate: "₹100 (Article 5(h))",
    },
    updatedDate: "2026-07-01",
  },

  "tripura": {
    state: "Tripura",
    rentAgreement: {
      rate: "₹50 flat (up to 11 months)",
      notes: "Low stamp duty regime.",
    },
    nda: {
      rate: "₹50 (Article 5)",
    },
    affidavit: {
      rate: "₹5 (Article 4)",
    },
    partnership: {
      rate: "₹500 flat",
    },
    generalAgreement: {
      rate: "₹50 (Article 5)",
    },
    updatedDate: "2026-07-01",
  },

  "uttar-pradesh": {
    state: "Uttar Pradesh",
    rentAgreement: {
      rate: "2% of annual rent",
      notes: "Minimum ₹200. UP Stamp Act, 2008.",
    },
    nda: {
      rate: "₹200 (Article 5(h))",
    },
    affidavit: {
      rate: "₹10 (Article 4)",
    },
    partnership: {
      rate: "2% of capital, max ₹10,000",
    },
    generalAgreement: {
      rate: "₹200 (Article 5(h))",
    },
    updatedDate: "2026-07-01",
  },

  "uttarakhand": {
    state: "Uttarakhand",
    rentAgreement: {
      rate: "1% of annual rent",
      notes: "Minimum ₹500.",
    },
    nda: {
      rate: "₹100 (Article 5(h))",
    },
    affidavit: {
      rate: "₹10 (Article 4)",
    },
    partnership: {
      rate: "1% of capital, max ₹5,000",
    },
    generalAgreement: {
      rate: "₹100 (Article 5(h))",
    },
    updatedDate: "2026-07-01",
  },

  "west-bengal": {
    state: "West Bengal",
    rentAgreement: {
      rate: "1% of annual rent",
      notes: "Minimum ₹500. West Bengal Stamp Act.",
    },
    nda: {
      rate: "₹100 (Article 5(h))",
    },
    affidavit: {
      rate: "₹10 (Article 4)",
    },
    partnership: {
      rate: "1% of capital, max ₹10,000",
    },
    generalAgreement: {
      rate: "₹100 (Article 5(h))",
    },
    updatedDate: "2026-07-01",
  },

  // ==================== UNION TERRITORIES ====================

  "delhi": {
    state: "Delhi (NCT)",
    rentAgreement: {
      rate: "2% of avg annual rent",
      notes: "Minimum ₹500. Delhi Stamp Act. E-stamp via SHCIL.",
    },
    nda: {
      rate: "₹100 (Article 5(h))",
    },
    affidavit: {
      rate: "₹10 (Article 4)",
    },
    partnership: {
      rate: "2% of capital, max ₹25,000",
    },
    generalAgreement: {
      rate: "₹100 (Article 5(h))",
    },
    updatedDate: "2026-07-01",
  },

  "chandigarh": {
    state: "Chandigarh",
    rentAgreement: {
      rate: "1.5% of annual rent",
      notes: "Minimum ₹500. Follows Punjab pattern.",
    },
    nda: {
      rate: "₹100 (Article 5(h))",
    },
    affidavit: {
      rate: "₹10 (Article 4)",
    },
    partnership: {
      rate: "1.5% of capital, max ₹10,000",
    },
    generalAgreement: {
      rate: "₹100 (Article 5(h))",
    },
    updatedDate: "2026-07-01",
  },

  "puducherry": {
    state: "Puducherry",
    rentAgreement: {
      rate: "1% of annual rent",
      notes: "Minimum ₹200.",
    },
    nda: {
      rate: "₹100 (Article 5(h))",
    },
    affidavit: {
      rate: "₹10 (Article 4)",
    },
    partnership: {
      rate: "1% of capital, max ₹10,000",
    },
    generalAgreement: {
      rate: "₹100 (Article 5(h))",
    },
    updatedDate: "2026-07-01",
  },

  "dadra-nagar-haveli": {
    state: "Dadra & Nagar Haveli",
    rentAgreement: {
      rate: "1% of annual rent",
      notes: "Minimum ₹200. Follows Central Stamp Act.",
    },
    nda: {
      rate: "₹100 (Article 5(h))",
    },
    affidavit: {
      rate: "₹10 (Article 4)",
    },
    partnership: {
      rate: "1% of capital, max ₹10,000",
    },
    generalAgreement: {
      rate: "₹100 (Article 5(h))",
    },
    updatedDate: "2026-07-01",
  },

  "daman-diu": {
    state: "Daman & Diu",
    rentAgreement: {
      rate: "1% of annual rent",
      notes: "Minimum ₹200.",
    },
    nda: {
      rate: "₹100 (Article 5(h))",
    },
    affidavit: {
      rate: "₹10 (Article 4)",
    },
    partnership: {
      rate: "1% of capital, max ₹5,000",
    },
    generalAgreement: {
      rate: "₹100 (Article 5(h))",
    },
    updatedDate: "2026-07-01",
  },

  "lakshadweep": {
    state: "Lakshadweep",
    rentAgreement: {
      rate: "₹50 flat (up to 11 months)",
      notes: "Low stamp duty regime.",
    },
    nda: {
      rate: "₹50 (Article 5)",
    },
    affidavit: {
      rate: "₹5 (Article 4)",
    },
    partnership: {
      rate: "₹500 flat",
    },
    generalAgreement: {
      rate: "₹50 (Article 5)",
    },
    updatedDate: "2026-07-01",
  },

  "andaman-nicobar": {
    state: "Andaman & Nicobar Islands",
    rentAgreement: {
      rate: "₹50 flat (up to 11 months)",
      notes: "Low stamp duty regime.",
    },
    nda: {
      rate: "₹50 (Article 5)",
    },
    affidavit: {
      rate: "₹5 (Article 4)",
    },
    partnership: {
      rate: "₹500 flat",
    },
    generalAgreement: {
      rate: "₹50 (Article 5)",
    },
    updatedDate: "2026-07-01",
  },

  "jammu-kashmir": {
    state: "Jammu & Kashmir",
    rentAgreement: {
      rate: "1% of annual rent",
      notes: "Minimum ₹100. Post-reorganization, follows J&K Stamp Act.",
    },
    nda: {
      rate: "₹100 (Article 5(h))",
    },
    affidavit: {
      rate: "₹10 (Article 4)",
    },
    partnership: {
      rate: "1% of capital, max ₹10,000",
    },
    generalAgreement: {
      rate: "₹100 (Article 5(h))",
    },
    updatedDate: "2026-07-01",
  },

  "ladakh": {
    state: "Ladakh",
    rentAgreement: {
      rate: "₹50 flat (up to 11 months)",
      notes: "UT regime — rates pending full notification.",
    },
    nda: {
      rate: "₹50 (Article 5)",
    },
    affidavit: {
      rate: "₹5 (Article 4)",
    },
    partnership: {
      rate: "₹500 flat",
    },
    generalAgreement: {
      rate: "₹50 (Article 5)",
    },
    updatedDate: "2026-07-01",
  },
};

/**
 * List of all state keys for use in dropdowns.
 */
export const STATE_KEYS = Object.keys(STAMP_DUTY_RATES);

/**
 * State key → display name mapping for dropdowns.
 */
export const STATE_OPTIONS = Object.entries(STAMP_DUTY_RATES).map(
  ([key, info]) => ({
    value: key,
    label: info.state,
  })
);

/**
 * Document types for the stamp duty calculator widget.
 */
export type StampDutyDocType =
  | "rent-agreement"
  | "nda"
  | "affidavit"
  | "partnership"
  | "general-agreement";

export const DOC_TYPE_LABELS: Record<StampDutyDocType, string> = {
  "rent-agreement": "Rental Agreement",
  nda: "Non-Disclosure Agreement (NDA)",
  affidavit: "Affidavit",
  partnership: "Partnership Deed",
  "general-agreement": "General Agreement",
};

/**
 * Get the stamp duty rate string for a specific document type and state.
 */
export function getRateForDocType(
  stateKey: string,
  docType: StampDutyDocType
): string | null {
  const info = getStampDuty(stateKey);
  if (!info) return null;

  switch (docType) {
    case "rent-agreement":
      return info.rentAgreement.rate;
    case "nda":
      return info.nda.rate;
    case "affidavit":
      return info.affidavit.rate;
    case "partnership":
      return info.partnership.rate;
    case "general-agreement":
      return info.generalAgreement.rate;
    default:
      return null;
  }
}

/**
 * Build the stamp duty info HTML section for document previews.
 */
export function buildStampDutySection(
  stateKey: string,
  docType: StampDutyDocType
): string {
  const info = getStampDuty(stateKey);
  if (!info) return "";

  let rate: string | null = null;
  let notes: string | undefined;

  switch (docType) {
    case "rent-agreement":
      rate = info.rentAgreement.rate;
      notes = info.rentAgreement.notes;
      break;
    case "nda":
      rate = info.nda.rate;
      notes = info.nda.notes;
      break;
    case "affidavit":
      rate = info.affidavit.rate;
      notes = info.affidavit.notes;
      break;
    case "partnership":
      rate = info.partnership.rate;
      notes = info.partnership.notes;
      break;
    case "general-agreement":
      rate = info.generalAgreement.rate;
      notes = info.generalAgreement.notes;
      break;
  }

  if (!rate) return "";

  const parts: string[] = [];
  parts.push(`<div class="stamp-duty-section">`);
  parts.push(`<h2>STAMP DUTY INFORMATION</h2>`);
  parts.push(`<table class="terms">`);
  parts.push(`<tr><td><strong>State:</strong></td><td>${esc(info.state)}</td></tr>`);
  parts.push(`<tr><td><strong>Applicable Stamp Duty:</strong></td><td>${esc(rate)}</td></tr>`);
  if (info.rentAgreement.maxCap && docType === "rent-agreement") {
    parts.push(`<tr><td><strong>Maximum Cap:</strong></td><td>${esc(info.rentAgreement.maxCap)}</td></tr>`);
  }
  if (notes) {
    parts.push(`<tr><td><strong>Note:</strong></td><td>${esc(notes)}</td></tr>`);
  }
  parts.push(`</table>`);
  parts.push(`<p class="ica-ref">Stamp duty must be paid in ${esc(info.state)} as per the Indian Stamp Act, 1899 and applicable state stamp legislation. This rate is approximate and should be verified with local stamp authorities before execution. E-stamping facilities may be available — check your state's e-stamp portal.</p>`);
  parts.push(`<p class="stamp-disclaimer">⚠️ <em>Rates are indicative as of ${esc(info.updatedDate)}. Actual stamp duty may vary based on the specific nature, value, and duration of the document. Always confirm with the local sub-registrar or e-stamp vendor.</em></p>`);
  parts.push(`</div>`);

  return parts.join("\n");
}

// Reuse the esc function pattern — inline to avoid circular dependency
function esc(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
