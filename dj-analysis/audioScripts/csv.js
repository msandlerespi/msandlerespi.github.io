function generateAndDownloadCSV(data, filename) {
  // Create CSV header from object keys
  const headers = Object.keys(data[0]);
  const csvRows = [];
  csvRows.push(headers.join(','));

  // Convert each object to a CSV row
  for (const row of data) {
    const values = headers.map(header => {
      // Handle potential commas within data by quoting values
      let value = row[header];
      if (typeof value === 'string' && value.includes(',')) {
        value = `"${value}"`;
      }
      return value;
    });
    csvRows.push(values.join(','));
  }

  // Join rows with newline characters
  const csvString = csvRows.join('\n');

  // Create a Blob and trigger download
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) { // Check for download attribute support
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename || 'data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    // Fallback for browsers without download attribute (less common now)
    alert('Your browser does not support automatic downloads. Please save the content manually.');
    window.open('data:text/csv;charset=utf-8,' + encodeURIComponent(csvString));
  }
}
