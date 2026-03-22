var SHEET_NAME = 'Sheet1';

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    var body = JSON.parse(e.postData.contents);
    sheet.appendRow([
      body.id,
      body.date,
      body.workout,
      body.duration,
      JSON.stringify(body.data)
    ]);
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    var rows = sheet.getDataRange().getValues();
    var headers = rows[0];
    var sessions = rows.slice(1).map(function(row) {
      var obj = {};
      headers.forEach(function(h, i) { obj[h] = row[i]; });
      try { obj.data = JSON.parse(obj.data || '{}'); } catch (_) { obj.data = {}; }
      return obj;
    });
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, sessions: sessions }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
