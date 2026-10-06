import { getHodQuestionsForFaculty } from "../controllers/hodController.js";
import { getDbPool } from "../config/db.js";

async function main() {
  const db = await getDbPool();
  const [facs] = await db.query("SELECT username, name, department, designation FROM faculty LIMIT 5");
  console.log("Faculty sample:", facs);

  if (facs.length > 0) {
    const username = facs[0].username;
    console.log("Testing getHodQuestionsForFaculty for:", username);

    const mockReq = {
      params: { username },
      session: { username: "hod_cse", role: "hod", department: "CSE" },
    };
    const mockRes = {
      status(code) {
        console.log("Res Status Code:", code);
        return this;
      },
      json(data) {
        console.log("Res JSON:", JSON.stringify(data, null, 2));
        return this;
      },
    };

    await getHodQuestionsForFaculty(mockReq, mockRes);
  }
  process.exit(0);
}

main().catch(console.error);
