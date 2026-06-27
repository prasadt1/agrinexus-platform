import { describe, it, expect } from "vitest";
import { parseFarmerLines } from "./parse-farmers";

describe("parseFarmerLines", () => {
  it("parses a bare phone number", () => {
    expect(parseFarmerLines("+919876543210")).toEqual([{ phone: "919876543210" }]);
  });

  it("strips spaces and the leading + from phones", () => {
    expect(parseFarmerLines("+91 98765 43210")).toEqual([{ phone: "919876543210" }]);
  });

  it("parses 'phone, name'", () => {
    expect(parseFarmerLines("+919876543210, Ramesh Patil")).toEqual([
      { phone: "919876543210", name: "Ramesh Patil" },
    ]);
  });

  it("parses 'name, phone' (order-agnostic)", () => {
    expect(parseFarmerLines("Ramesh Patil, +919876543210")).toEqual([
      { phone: "919876543210", name: "Ramesh Patil" },
    ]);
  });

  it("handles multiple lines and skips blanks", () => {
    const text = "+919876543210, Ramesh\n\n  \n918765432109, Sita";
    expect(parseFarmerLines(text)).toEqual([
      { phone: "919876543210", name: "Ramesh" },
      { phone: "918765432109", name: "Sita" },
    ]);
  });

  it("skips lines with no usable (>=10 digit) phone", () => {
    expect(parseFarmerLines("Ramesh\n12345")).toEqual([]);
  });

  it("keeps a name that itself contains a comma", () => {
    expect(parseFarmerLines("Patil, Ramesh, +919876543210")).toEqual([
      { phone: "919876543210", name: "Patil, Ramesh" },
    ]);
  });

  it("returns empty for empty input", () => {
    expect(parseFarmerLines("")).toEqual([]);
    expect(parseFarmerLines("   \n  ")).toEqual([]);
  });
});
