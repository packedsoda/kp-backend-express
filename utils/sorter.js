export function sortIncidents(dataClean) {
  if (!dataClean || dataClean.length === 0) return "";

  const locationCounts = {};
  for (const item of dataClean) {
    const loc = item.sort_location;
    locationCounts[loc] = (locationCounts[loc] || 0) + 1;
  }

  const singles = [];
  const groups = [];

  for (const item of dataClean) {
    const loc = item.sort_location;

    if (loc === "Z_UNKNOWN") {
      singles.push(item);
    } else if (locationCounts[loc] === 1) {
      singles.push(item);
    } else {
      groups.push(item);
    }
  }

  singles.sort((a, b) => b.sort_minutes - a.sort_minutes);

  groups.sort((a, b) => {
    const locComparison = a.sort_location.localeCompare(b.sort_location);
    if (locComparison !== 0) {
      return locComparison;
    }
    return b.sort_minutes - a.sort_minutes;
  });

  const finalList = [...singles, ...groups];

  const outputLines = [];
  for (const item of finalList) {
    const block = `${item.durasi_text}\n${item.id}\n${item.kategori}\n${item.deskripsi}\n`;
    outputLines.push(block);
  }

  return outputLines.join("\n");
}
