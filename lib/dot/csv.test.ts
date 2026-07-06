import { describe, it, expect } from "vitest";
import { parseRosterCsv, eligibleDrivers } from "./csv";

const HEADER = "driver_id,name,cdl_number,company,status";

describe("parseRosterCsv", () => {
  it("parses a clean roster", () => {
    const csv = `${HEADER}
D-1,James Carter,TX1,Acme,active
D-2,Maria Lopez,TX2,Acme,active`;
    const r = parseRosterCsv(csv);
    expect(r.drivers).toHaveLength(2);
    expect(r.errors).toHaveLength(0);
    expect(r.drivers[0].driverId).toBe("D-1");
    expect(r.drivers[0].status).toBe("active");
  });

  it("de-duplicates on driver_id (first wins)", () => {
    const csv = `${HEADER}
D-1,James,TX1,Acme,active
D-1,James Dupe,TX1,Acme,active
D-2,Maria,TX2,Acme,active`;
    const r = parseRosterCsv(csv);
    expect(r.drivers).toHaveLength(2);
    expect(r.duplicatesRemoved).toBe(1);
    expect(r.drivers[0].name).toBe("James");
  });

  it("reports rows with missing required fields", () => {
    const csv = `${HEADER}
D-1,,TX1,Acme,active
D-2,Maria,TX2,Acme,active`;
    const r = parseRosterCsv(csv);
    expect(r.drivers).toHaveLength(1);
    expect(r.errors).toHaveLength(1);
    expect(r.errors[0].row).toBe(1);
  });

  it("detects missing columns", () => {
    const csv = `driver_id,name,company,status
D-1,James,Acme,active`;
    const r = parseRosterCsv(csv);
    expect(r.missingColumns).toContain("cdl_number");
    expect(r.drivers).toHaveLength(0);
  });

  it("handles quoted fields with commas and a BOM", () => {
    const csv = `﻿${HEADER}
D-1,"Carter, James",TX1,"Acme, Inc",active`;
    const r = parseRosterCsv(csv);
    expect(r.drivers[0].name).toBe("Carter, James");
    expect(r.drivers[0].company).toBe("Acme, Inc");
  });

  it("tolerates reordered and differently-cased headers", () => {
    const csv = `Status,Driver_ID,CDL_Number,Name,Company
active,D-1,TX1,James,Acme`;
    const r = parseRosterCsv(csv);
    expect(r.drivers).toHaveLength(1);
    expect(r.drivers[0].driverId).toBe("D-1");
  });
});

describe("eligibleDrivers", () => {
  it("keeps only active drivers", () => {
    const csv = `${HEADER}
D-1,A,TX1,Acme,active
D-2,B,TX2,Acme,inactive
D-3,C,TX3,Acme,active`;
    const { drivers } = parseRosterCsv(csv);
    expect(eligibleDrivers(drivers)).toHaveLength(2);
  });
});
