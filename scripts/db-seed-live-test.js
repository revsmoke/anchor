import { seedLiveTestData } from "./live-test-seed-data.js";

const result = await seedLiveTestData();

console.log(`seeded live test user ${result.email}`);
console.log(JSON.stringify(result.counts, null, 2));
