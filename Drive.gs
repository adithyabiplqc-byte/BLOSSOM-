/**
 * Google Apps Script - Drive.gs
 * Standalone Web App for Handling Google Drive Uploads & Storage (A7 Module & B9 Module)
 * 
 * Deployment Instructions:
 * 1. Open Google Drive (https://drive.google.com).
 * 2. Click "New" > "More" > "Google Apps Script" (or go to https://script.google.com).
 * 3. Delete any default code, paste this entire file's content into the editor.
 * 4. Save the project as "Blossom Drive Upload Service".
 * 5. Click "Deploy" > "New deployment".
 * 6. Click the gear icon (Select type) and choose "Web app".
 * 7. Set:
 *    - Description: "Blossom Drive File Upload API"
 *    - Execute as: "Me" (your Google account)
 *    - Who has access: "Anyone"
 * 8. Click "Deploy", click "Authorize access" (grant required Google Drive permissions).
 * 9. Copy the generated "Web app URL" (ends in /exec) and save it.
 * 10. Paste this URL into your application's connection settings under "Drive Web App URL" (in Setup or Admin panel).
 */

function doGet(e) {
  return ContentService.createTextOutput("Google Drive Apps Script Web App is active and running! Send a POST request to upload documents.")
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    var postData = JSON.parse(e.postData.contents);
    var action = postData.action;
    var params = postData.params || [];
    
    if (action === 'api_ping') {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "Drive Apps Script is responding perfectly!"
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'api_uploadSOPFile') {
      var fileName = params[0];
      var base64Data = params[1];
      var mimeType = params[2];
      var category = params[3] || "SOP";
      
      var result = uploadFileToDrive(fileName, base64Data, mimeType, category);
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: "Unknown action: " + action
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: "Error processing request: " + err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Decodes base64 file data and saves it in a structured Google Drive folder hierarchy.
 */
function uploadFileToDrive(fileName, base64Data, mimeType, category) {
  try {
    // Strip header prefix if present (e.g. data:application/pdf;base64,)
    if (base64Data.indexOf(",") > -1) {
      base64Data = base64Data.split(",")[1];
    }
    
    var decoded = Utilities.base64Decode(base64Data);
    var blob = Utilities.newBlob(decoded, mimeType, fileName);
    
    // Find or create the main folder
    var mainFolderName = "Blossom Quality Documents";
    var mainFolders = DriveApp.getFoldersByName(mainFolderName);
    var mainFolder;
    if (mainFolders.hasNext()) {
      mainFolder = mainFolders.next();
    } else {
      mainFolder = DriveApp.createFolder(mainFolderName);
    }
    
    // Determine sub-folder category
    var subFolderName = category || "Others";
    var standardCategories = {
      "SOP": "SOP",
      "SUPPLIER AUDIT": "Inspection Reports",
      "CHANNEL PARTNER AUDIT": "Inspection Reports",
      "SHOP AUDIT": "Inspection Reports",
      "OTHER AUDITS": "Others",
      "INSPECTION REPORTS": "Inspection Reports",
      "SPECIFICATIONS": "Specifications",
      "TEST REPORTS": "Test Reports",
      "LAB REPORTS": "Lab Reports",
      "WORK INSTRUCTIONS": "Work Instructions",
      "DRAWINGS": "Drawings",
      "QUALITY MANUALS": "Quality Manuals",
      "OTHERS": "Others",
      "OTHER": "Others"
    };
    
    var resolvedFolder = standardCategories[subFolderName.toUpperCase()] || subFolderName;
    
    // Find or create category sub-folder
    var subFolders = mainFolder.getFoldersByName(resolvedFolder);
    var subFolder;
    if (subFolders.hasNext()) {
      subFolder = subFolders.next();
    } else {
      subFolder = mainFolder.createFolder(resolvedFolder);
    }
    
    // Create the file in the category sub-folder
    var file = subFolder.createFile(blob);
    
    try {
      // Set access permissions to allow anyone with the link to view the PDF/document
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (shareErr) {
      // Non-blocking warning if sharing permission is restricted by organization policy
      console.warn("Setting sharing permissions failed: " + shareErr.toString());
    }
    
    return {
      success: true,
      url: file.getUrl(),
      name: file.getName(),
      id: file.getId(),
      downloadUrl: "https://drive.google.com/uc?export=download&id=" + file.getId()
    };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}
