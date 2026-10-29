import type { DirectorResidentialAddress } from "../form1/form1DraftStorage";

export type PersonReviewRow = {
  name: string;
  description: string;
};

/** One director or incorporator rendered as its own summary list under the section heading. */
export type PersonReviewGroup = {
  key: string;
  caption: string;
  editHref: string;
  rows: PersonReviewRow[];
};

type PersonName = {
  firstName: string;
  middleName: string;
  lastName: string;
};

const NOT_PROVIDED = "Not provided";

const PROVINCE_CODES: Record<string, string> = {
  Alberta: "AB",
  "British Columbia": "BC",
  Manitoba: "MB",
  "New Brunswick": "NB",
  "Newfoundland and Labrador": "NL",
  "Northwest Territories": "NT",
  "Nova Scotia": "NS",
  Nunavut: "NU",
  Ontario: "ON",
  "Prince Edward Island": "PE",
  Quebec: "QC",
  Saskatchewan: "SK",
  Yukon: "YT",
};

function joinWords(parts: Array<string | undefined>) {
  return parts
    .map((part) => part?.trim() ?? "")
    .filter(Boolean)
    .join(" ");
}

export function formatPersonName(person: PersonName) {
  return (
    joinWords([person.firstName, person.middleName, person.lastName]) ||
    NOT_PROVIDED
  );
}

/** Canada Post style: street line, "CITY, PROV POSTAL", country — one line each, uppercase. */
export function formatMailingAddress(address: DirectorResidentialAddress) {
  let lines: string[];
  if (address.addressType === "canadian") {
    const unit = address.unitNumber.trim();
    const civic = `${address.streetNumber.trim()}${address.streetNumberSuffix.trim()}`;
    const number = unit && civic ? `${unit}-${civic}` : unit || civic;
    const province =
      PROVINCE_CODES[address.provinceState] ?? address.provinceState.trim();
    const cityLine = [
      address.cityTown.trim(),
      joinWords([province, address.postalCode]),
    ]
      .filter(Boolean)
      .join(", ");
    lines = [
      joinWords([
        number,
        address.streetName,
        address.streetType,
        address.streetDirection,
      ]),
      cityLine,
      address.country.trim() || "Canada",
    ];
    if (!lines[0] && !cityLine) {
      return NOT_PROVIDED;
    }
  } else if (address.addressType) {
    const cityLine = [
      address.cityTown.trim(),
      joinWords([address.provinceState, address.postalCode]),
    ]
      .filter(Boolean)
      .join(", ");
    lines = [
      address.addressLine1.trim(),
      address.addressLine2.trim(),
      cityLine,
      address.country.trim(),
    ];
    if (!lines[0] && !cityLine) {
      return NOT_PROVIDED;
    }
  } else {
    return NOT_PROVIDED;
  }
  return lines.filter(Boolean).join("\n").toUpperCase();
}

function formatDollars(amount: string) {
  const raw = amount.trim().replace(/[$,\s]/g, "");
  const value = Number(raw);
  if (!raw || Number.isNaN(value)) {
    return amount.trim();
  }
  const hasCents = raw.includes(".");
  return `$${value.toLocaleString("en-CA", {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

/** e.g. "2 shares at $5,000, Class A". */
export function formatShareSummary(shares: {
  numberOfShares: string;
  amountToBePaid: string;
  classDesignation: string;
}) {
  const count = shares.numberOfShares.trim();
  const shareLabel = count
    ? `${count} ${count === "1" ? "share" : "shares"}`
    : "";
  const amount = shares.amountToBePaid.trim()
    ? formatDollars(shares.amountToBePaid)
    : "";
  const className = shares.classDesignation.trim();
  const countAndAmount =
    shareLabel && amount ? `${shareLabel} at ${amount}` : shareLabel || amount;
  return [countAndAmount, className].filter(Boolean).join(", ") || NOT_PROVIDED;
}

export function formatResidency(residentCanadian: string) {
  if (residentCanadian === "yes") return "Resident Canadian";
  if (residentCanadian === "no") return "Not a resident Canadian";
  return NOT_PROVIDED;
}

export function formatYesNoAnswer(value: string) {
  if (value === "yes") return "Yes";
  if (value === "no") return "No";
  return NOT_PROVIDED;
}

export function displayValue(value: string) {
  return value.trim() || NOT_PROVIDED;
}

type ShareFields = {
  numberOfShares: string;
  classDesignation: string;
  amountToBePaid: string;
};

type ReviewDirector = PersonName &
  ShareFields & {
    id: string;
    email: string;
    residentCanadian: string;
    alsoIncorporator: string;
    address: DirectorResidentialAddress;
  };

type ReviewIncorporator = PersonName &
  ShareFields & {
    id: string;
    type: string;
    linkedDirectorId: string;
    residentCanadian?: string;
    address: DirectorResidentialAddress;
    corporationName: string;
    ocn: string;
    signerPosition: string;
  };

export function buildDirectorGroups(
  directors: ReviewDirector[],
  options: { editHref: (id: string) => string; includeShares: boolean },
): PersonReviewGroup[] {
  return directors.map((director, index) => {
    const rows: PersonReviewRow[] = [
      { name: "Name", description: formatPersonName(director) },
      { name: "Email", description: displayValue(director.email) },
      {
        name: "Residency",
        description: formatResidency(director.residentCanadian),
      },
      {
        name: "Also an incorporator",
        description: formatYesNoAnswer(director.alsoIncorporator),
      },
    ];
    if (options.includeShares && director.alsoIncorporator === "yes") {
      rows.push({ name: "Shares", description: formatShareSummary(director) });
    }
    rows.push({
      name: "Address",
      description: formatMailingAddress(director.address),
    });
    return {
      key: director.id,
      caption: `Director ${index + 1}`,
      editHref: options.editHref(director.id),
      rows,
    };
  });
}

export function buildIncorporatorGroups<D extends ReviewDirector>(
  incorporators: ReviewIncorporator[],
  directors: D[],
  options: {
    editHref: (id: string) => string;
    includeShares: boolean;
    labels?: { shares?: string; address?: string };
  },
): PersonReviewGroup[] {
  const sharesLabel = options.labels?.shares ?? "Shares";
  const addressLabel = options.labels?.address ?? "Address";
  return incorporators.map((incorporator, index) => {
    const rows: PersonReviewRow[] = [];
    if (incorporator.type === "corporation") {
      const signer = joinWords([
        incorporator.firstName,
        incorporator.middleName,
        incorporator.lastName,
      ]);
      const position = incorporator.signerPosition.trim();
      rows.push(
        {
          name: "Corporation name",
          description: displayValue(incorporator.corporationName),
        },
        {
          name: "Ontario Corporation Number",
          description: displayValue(incorporator.ocn),
        },
        {
          name: "Signing officer",
          description:
            [signer, position].filter(Boolean).join(", ") || NOT_PROVIDED,
        },
      );
    } else {
      const director = incorporator.linkedDirectorId
        ? directors.find((entry) => entry.id === incorporator.linkedDirectorId)
        : undefined;
      rows.push({
        name: "Name",
        description: formatPersonName(director ?? incorporator),
      });
      if (director) {
        rows.push({ name: "Email", description: displayValue(director.email) });
      }
      rows.push(
        {
          name: "Residency",
          description: formatResidency(
            director?.residentCanadian || incorporator.residentCanadian || "",
          ),
        },
        { name: "Also an incorporator", description: "Yes" },
      );
      if (director) {
        rows.push({ name: "First director", description: "Yes" });
      }
      if (options.includeShares) {
        rows.push({
          name: sharesLabel,
          description: formatShareSummary(incorporator),
        });
      }
      rows.push({
        name: addressLabel,
        description: formatMailingAddress((director ?? incorporator).address),
      });
      return {
        key: incorporator.id,
        caption: `Incorporator ${index + 1}`,
        editHref: options.editHref(incorporator.id),
        rows,
      };
    }
    if (options.includeShares) {
      rows.push({
        name: sharesLabel,
        description: formatShareSummary(incorporator),
      });
    }
    return {
      key: incorporator.id,
      caption: `Incorporator ${index + 1}`,
      editHref: options.editHref(incorporator.id),
      rows,
    };
  });
}
