const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");
const { runInNewContext } = require("node:vm");
const assert = require("node:assert/strict");
const test = require("node:test");
const ts = require("typescript");

const compiled = ts.transpileModule(readFileSync(resolve(__dirname, "../src/lib/space-filters.ts"), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;
const context = { exports: {} };
runInNewContext(compiled, context);
const { filterSpaces } = context.exports;
const defaults = { building: "", floor: "", onlyAvailable: false, query: "", types: [], amenities: [], minCapacity: "", maxCapacity: "", approval: "" };
const spaces = [
  { id: "a", name: "Аудитория А-101", code: "А-101", description: null, building_code: "A", floor_number: 1, space_type: "classroom", capacity: 12, amenities: ["Wi-Fi", "Проектор"], requires_approval: false, is_available: true },
  { id: "b", name: "Лаборатория", code: "Л-305", description: "Работа над проектами", building_code: "A", floor_number: 3, space_type: "laboratory", capacity: 20, amenities: ["Wi-Fi", "Компьютеры"], requires_approval: true, is_available: false },
  { id: "c", name: "Переговорная", code: "П-1", description: null, building_code: "B", floor_number: 1, space_type: "meeting_room", capacity: 6, amenities: ["Wi-Fi"], requires_approval: false, is_available: true },
];
const ids = (filters = {}) => Array.from(filterSpaces(spaces, { ...defaults, ...filters }), (space) => space.id);

test("empty filters return all rooms", () => assert.deepEqual(ids(), ["a", "b", "c"]));
test("equipment requires every selected amenity", () => {
  assert.deepEqual(ids({ amenities: ["Wi-Fi", "Проектор"] }), ["a"]);
  assert.deepEqual(ids({ amenities: ["Проектор", "Компьютеры"] }), []);
});
test("capacity boundaries are inclusive; inverted ranges return no rooms", () => {
  assert.deepEqual(ids({ minCapacity: "12", maxCapacity: "20" }), ["a", "b"]);
  assert.deepEqual(ids({ maxCapacity: "6" }), ["c"]);
  assert.deepEqual(ids({ minCapacity: "20", maxCapacity: "6" }), []);
});
test("room types use OR while independent filters use AND", () => {
  assert.deepEqual(ids({ types: ["classroom", "laboratory"], floor: 3 }), ["b"]);
  assert.deepEqual(ids({ building: "A", floor: 1, amenities: ["Проектор"], onlyAvailable: true }), ["a"]);
});
test("search ignores case and surrounding whitespace", () => {
  assert.deepEqual(ids({ query: "  а-101 " }), ["a"]);
  assert.deepEqual(ids({ query: "ПРОЕКТАМИ" }), ["b"]);
});
test("approval and availability filters compose", () => {
  assert.deepEqual(ids({ approval: "request" }), ["b"]);
  assert.deepEqual(ids({ approval: "request", onlyAvailable: true }), []);
  assert.deepEqual(ids({ approval: "instant" }), ["a", "c"]);
});
