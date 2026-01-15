const express = require("express");
const app = express();
const port = 5000;
const cors = require("cors");
const { cleanAndParseRawText } = require("./utils/parser");
const { sortIncidents } = require("./utils/sorter");

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Incident Listing KP API is running");
});
app.post("/api/process-incident", (req, res) => {
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
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
