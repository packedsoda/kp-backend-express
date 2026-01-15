import { VALID_CATEGORIES, LOCATION_KEYWORDS, STOP_WORDS } from "./config.js";

function parseDurationToMinutes(text) {
  if (!text) return 0;
  text = text.toUpperCase();

  let days = 0;
  let hours = 0;
  let minutes = 0;

  const matchHari = text.match(/(\d+)\s*HARI/);
  const matchJam = text.match(/(\d+)\s*JAM/);
  const matchMenit = text.match(/(\d+)\s*MENIT/);

  if (matchHari) days = parseInt(matchHari[1], 10);
  if (matchJam) hours = parseInt(matchJam[1], 10);
  if (matchMenit) minutes = parseInt(matchMenit[1], 10);

  return days * 24 * 60 + hours * 60 + minutes;
}

function extractLocation(text) {
  if (!text) return "Z_UNKNOWN";
  text = text.toUpperCase();

  text = text.replace(/(REG)(\d)/g, "$1 $2");

  text = text.replace(/[-_./:;]/g, " ");

  const words = text.trim().split(/\s+/);

  for (const kw of LOCATION_KEYWORDS) {
    if (text.includes(kw)) {
      const kwParts = kw.split(/\s+/);
      let startIndex = -1;

      for (let i = 0; i < words.length; i++) {
        if (words[i] === kwParts[0]) {
          if (kwParts.length > 1) {
            if (i + 1 < words.length && words[i + 1] === kwParts[1]) {
              startIndex = i;
              break;
            }
          } else {
            startIndex = i;
            break;
          }
        }
      }

      if (startIndex !== -1) {
        const kwLen = kwParts.length;
        const candidateWords = words.slice(startIndex + kwLen);
        const extractedParts = [...kwParts];

        for (const w of candidateWords) {
          if (w.length > 4 && /\d/.test(w)) break;

          if (STOP_WORDS.includes(w)) break;

          if (w.includes("_")) break;

          extractedParts.push(w);

          if (extractedParts.length >= kwLen + 2) {
            break;
          }
        }

        return extractedParts.join(" ").trim();
      }
    }
  }

  return "Z_UNKNOWN";
}

export function cleanAndParseRawText(rawText) {
  const lines = rawText.split(/\r?\n/);
  const idList = [];
  const dataRows = [];

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    if (/^\d{10,12}$/.test(line)) {
      idList.push(line);
    } else {
      for (const cat of VALID_CATEGORIES) {
        if (line.startsWith(cat)) {
          dataRows.push(line);
          break;
        }
      }
    }
  }

  const minLen = Math.min(idList.length, dataRows.length);
  const parsedResults = [];

  for (let i = 0; i < minLen; i++) {
    const rowText = dataRows[i];
    const ticketId = idList[i];
    let category = "";
    let description = rowText;

    for (const cat of VALID_CATEGORIES) {
      if (rowText.startsWith(cat)) {
        category = cat;
        description = rowText.substring(cat.length).trim();
        break;
      }
    }

    if (!category.includes("FTTH")) continue;

    let durationText = "-";
    const durMatch = description.match(
      /(\d+\s*HARI\s*)?(\d+\s*JAM\s*)?(\d+\s*MENIT)/
    );
    if (durMatch) {
      durationText = durMatch[0];
    }

    let cleanDesc = description;
    const splitMatch = description.split(/OPEN(\s+|\d)/);
    if (splitMatch.length > 1) {
      cleanDesc = splitMatch[0].trim();
    }
    if (cleanDesc.endsWith("OPEN")) {
      cleanDesc = cleanDesc.slice(0, -4).trim();
    }

    const menit = parseDurationToMinutes(durationText);
    const lokasi = extractLocation(cleanDesc);

    parsedResults.push({
      durasi_text: durationText,
      id: ticketId,
      kategori: category,
      deskripsi: cleanDesc,
      sort_minutes: menit,
      sort_location: lokasi,
    });
  }

  return parsedResults;
}
