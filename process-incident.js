import { cleanAndParseRawText } from "./utils/parser.js";
import { sortIncidents } from "./utils/sorter.js";

export default function handlerProcessIncident(req) {
  /* if (req.method !== "POST") {
    return res.status(405).json({ result: "Method Not Allowed" });
  } */
  console.log("masuk handlerProcessIncident", req);

  try {
    const { dataRaw } = req.body;

    if (!dataRaw) {
      return res.status(400).json({ result: "Data kosong!" });
    }

    const dataClean = cleanAndParseRawText(dataRaw);

    if (!dataClean || dataClean.length === 0) {
      return res
        .status(200)
        .json({ result: "Tidak ada data FTTH yang ditemukan." });
    }

    const finalString = sortIncidents(dataClean);

    return res.status(200).json({
      status: "success",
      result: finalString,
    });
  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({ result: `Server Error: ${error.message}` });
  }
}
