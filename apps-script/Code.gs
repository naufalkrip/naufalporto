/**
 * ============================================================================
 * GOOGLE APPS SCRIPT WEB APP - MAIN CONTROLLER & DATABASE API
 * Portfolio Website Backend (Single-File Unified Architecture)
 * ============================================================================
 */

// ========================================
// CONFIGURATION
// ========================================

/**
 * Retrieve configuration values from Google Apps Script Script Properties.
 * Never hard-code secrets or database IDs in client-side code.
 */
function getAppConfig() {
  const props = PropertiesService.getScriptProperties();
  return {
    spreadsheetId: props.getProperty('SPREADSHEET_ID') || '',
    driveRootFolderId: props.getProperty('DRIVE_ROOT_FOLDER_ID') || '',
    authSecret: props.getProperty('AUTH_SECRET') || 'portfolio_super_secure_auth_secret_2026',
    tokenExpiryHours: 24
  };
}

// ========================================
// RESPONSE HELPERS
// ========================================

/**
 * Return JSON response formatted for Google Apps Script Web App
 */
function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Standard success response builder
 */
function successResponse(data, message) {
  return {
    success: true,
    message: message || 'Success',
    data: data !== undefined ? data : {}
  };
}

/**
 * Standard error response builder (never exposes internal server stack traces or secrets)
 */
function errorResponse(message) {
  return {
    success: false,
    message: message || 'Request failed'
  };
}

// ========================================
// SECURITY
// ========================================

/**
 * Hash password with SHA-256 and secret salt
 */
function hashPassword(password, salt) {
  const config = getAppConfig();
  const input = (salt || config.authSecret) + ':' + password;
  const rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, input, Utilities.Charset.UTF_8);
  let hashStr = '';
  for (let i = 0; i < rawHash.length; i++) {
    let byteVal = rawHash[i];
    if (byteVal < 0) byteVal += 256;
    let byteHex = byteVal.toString(16);
    if (byteHex.length === 1) byteHex = '0' + byteHex;
    hashStr += byteHex;
  }
  return hashStr;
}

/**
 * Generate clean unique identifier with prefix
 */
function generateId(prefix) {
  const cleanPrefix = prefix ? prefix + '_' : 'id_';
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return cleanPrefix + timestamp + '_' + random;
}

/**
 * Sanitize string input against injection and control characters
 */
function sanitizeInput(val) {
  if (val === null || val === undefined) return '';
  if (typeof val !== 'string') return val;
  return val.trim();
}

/**
 * Validate input fields
 */
function validateInput(val, fieldName, required) {
  if (required && (val === null || val === undefined || String(val).trim() === '')) {
    throw new Error('Field "' + fieldName + '" is required');
  }
  return sanitizeInput(val);
}

// ========================================
// AUTHENTICATION
// ========================================

/**
 * Login admin user with username & password verification
 */
function loginAdmin(username, password) {
  const cleanUser = sanitizeInput(username);
  const cleanPass = String(password || '');

  if (!cleanUser || !cleanPass) {
    return errorResponse('Username and password are required');
  }

  const sheet = getSheet('ADMIN');
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return errorResponse('Admin database table is empty. Please run setup first.');
  }

  const headers = data[0].map(h => String(h).trim());
  const userIdx = headers.indexOf('username');
  const passIdx = headers.indexOf('password_hash');
  const roleIdx = headers.indexOf('role');
  const statusIdx = headers.indexOf('status');
  const idIdx = headers.indexOf('id');
  const updatedIdx = headers.indexOf('updated_at');

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (String(row[userIdx]).trim().toLowerCase() === cleanUser.toLowerCase()) {
      const status = String(row[statusIdx] || 'active').toLowerCase();
      if (status !== 'active') {
        return errorResponse('This admin account has been deactivated');
      }

      const storedHash = String(row[passIdx]).trim();
      const inputHash = hashPassword(cleanPass);

      if (storedHash === inputHash) {
        const config = getAppConfig();
        const now = new Date().toISOString();
        if (updatedIdx !== -1) {
          sheet.getRange(i + 1, updatedIdx + 1).setValue(now);
        }

        // Generate tamper-evident session token
        const tokenPayload = {
          uid: String(row[idIdx]),
          username: String(row[userIdx]),
          role: String(row[roleIdx] || 'admin'),
          exp: Date.now() + (config.tokenExpiryHours * 60 * 60 * 1000)
        };
        const token = Utilities.base64EncodeWebSafe(JSON.stringify(tokenPayload));

        logActivity(row[userIdx], 'LOGIN', 'Admin', String(row[idIdx]), 'Successful administrator authentication');

        return successResponse({
          token: token,
          admin: {
            id: String(row[idIdx]),
            username: String(row[userIdx]),
            role: String(row[roleIdx] || 'admin')
          }
        }, 'Login successful');
      } else {
        return errorResponse('Invalid username or password');
      }
    }
  }

  return errorResponse('Invalid username or password');
}

/**
 * Validate active session token
 */
function validateSession(token) {
  if (!token) return errorResponse('Missing authorization token');

  try {
    const decoded = Utilities.newBlob(Utilities.base64DecodeWebSafe(token)).getDataAsString();
    const payload = JSON.parse(decoded);

    if (!payload.exp || Date.now() > payload.exp) {
      return errorResponse('Session expired. Please log in again.');
    }

    return successResponse({
      id: payload.uid,
      username: payload.username,
      role: payload.role
    }, 'Session is valid');
  } catch (err) {
    return errorResponse('Invalid session token');
  }
}

/**
 * Logout admin
 */
function logoutAdmin(token) {
  return successResponse({}, 'Successfully logged out');
}

/**
 * Guard internal handler: verify token or throw unauthorized error
 */
function verifyAuth(token) {
  const result = validateSession(token);
  if (!result.success) {
    throw new Error(result.message || 'Unauthorized access');
  }
  return result.data;
}

/**
 * Extract and verify token from parameter object
 */
function verifyAuthFromParams(params) {
  const token = params.token || (params.headers && params.headers.Authorization);
  return verifyAuth(token);
}

// ========================================
// SPREADSHEET
// ========================================

/**
 * Retrieve primary Spreadsheet instance
 */
function getSpreadsheet() {
  const config = getAppConfig();
  if (config.spreadsheetId) {
    try {
      return SpreadsheetApp.openById(config.spreadsheetId);
    } catch (e) {
      Logger.log('Could not open spreadsheet by ID: ' + e.message);
    }
  }

  try {
    return SpreadsheetApp.getActiveSpreadsheet();
  } catch (e) {
    throw new Error('Spreadsheet not found. Please set SPREADSHEET_ID in Script Properties or link to active spreadsheet.');
  }
}

/**
 * Retrieve specific sheet by name
 */
function getSheet(sheetName) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    throw new Error('Sheet "' + sheetName + '" not found. Please run setupSpreadsheet() to initialize tables.');
  }
  return sheet;
}

/**
 * Convert sheet rows into array of objects using headers
 */
function sheetDataToObjectArray(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  const headers = data[0].map(h => String(h).trim());
  const results = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const hasValue = row.some(cell => cell !== '' && cell !== null && cell !== undefined);
    if (!hasValue) continue;

    const obj = {};
    headers.forEach((header, colIdx) => {
      obj[header] = row[colIdx];
    });
    results.push(obj);
  }

  return results;
}

/**
 * Find 1-indexed row number by primary ID
 */
function findRowIndexById(sheet, id) {
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return -1;

  const idCol = data[0].indexOf('id');
  if (idCol === -1) return -1;

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idCol]).trim() === String(id).trim()) {
      return i + 1;
    }
  }
  return -1;
}

// ========================================
// PROFILE
// ========================================

/**
 * Get profile record
 */
function getProfile() {
  const sheet = getSheet('PROFILE');
  const items = sheetDataToObjectArray(sheet);
  if (items.length === 0) {
    return successResponse(null, 'No profile record found');
  }
  return successResponse(items[0], 'Profile retrieved successfully');
}

/**
 * Update profile record
 */
function updateProfile(data) {
  const sheet = getSheet('PROFILE');
  const sheetData = sheet.getDataRange().getValues();
  if (sheetData.length <= 1) {
    return errorResponse('PROFILE sheet header not found');
  }

  const headers = sheetData[0].map(h => String(h).trim());
  const now = new Date().toISOString();
  const targetRow = sheetData.length > 1 ? 2 : sheet.getLastRow() + 1;
  const rowValues = [];

  headers.forEach(header => {
    if (header === 'id') {
      rowValues.push(sheetData.length > 1 ? sheetData[1][headers.indexOf('id')] || 'profile_main' : 'profile_main');
    } else if (header === 'updated_at') {
      rowValues.push(now);
    } else if (data[header] !== undefined) {
      rowValues.push(data[header]);
    } else {
      const colIdx = headers.indexOf(header);
      const existingVal = sheetData.length > 1 ? sheetData[1][colIdx] : '';
      rowValues.push(existingVal);
    }
  });

  sheet.getRange(targetRow, 1, 1, headers.length).setValues([rowValues]);
  logActivity(data.admin_user || 'admin', 'UPDATE', 'PROFILE', 'profile_main', 'Updated profile information');

  return successResponse(getProfile().data, 'Profile updated successfully');
}

// ========================================
// PORTFOLIO CATEGORIES
// ========================================

/**
 * Get portfolio categories
 */
function getPortfolioCategories(status) {
  const sheet = getSheet('PORTFOLIO_CATEGORIES');
  let items = sheetDataToObjectArray(sheet);

  if (status && status !== 'all') {
    items = items.filter(c => String(c.status).toLowerCase() === status.toLowerCase());
  }

  items.sort((a, b) => (Number(a.display_order) || 0) - (Number(b.display_order) || 0));
  return successResponse(items, 'Categories retrieved');
}

/**
 * Create new portfolio category
 */
function createPortfolioCategory(data) {
  const sheet = getSheet('PORTFOLIO_CATEGORIES');
  const headers = sheet.getDataRange().getValues()[0].map(h => String(h).trim());
  const id = generateId('cat');
  const now = new Date().toISOString();

  const row = headers.map(header => {
    switch (header) {
      case 'id': return id;
      case 'name_id': return data.name_id || data.name || '';
      case 'name_en': return data.name_en || data.name || '';
      case 'slug': return data.slug || String(data.name_en || data.name_id || data.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      case 'subtitle_id': return data.subtitle_id || data.subtitle || '';
      case 'subtitle_en': return data.subtitle_en || data.subtitle || '';
      case 'description_id': return data.description_id || data.description || '';
      case 'description_en': return data.description_en || data.description || '';
      case 'cover_image': return data.cover_image || '';
      case 'display_order': return Number(data.display_order) || (sheet.getLastRow());
      case 'status': return data.status || 'published';
      case 'created_at': return now;
      case 'updated_at': return now;
      default: return data[header] !== undefined ? data[header] : '';
    }
  });

  sheet.appendRow(row);
  logActivity(data.admin_user || 'admin', 'CREATE', 'PORTFOLIO_CATEGORIES', id, 'Created category ' + (data.name_en || data.name_id));
  return successResponse({ id: id, ...data }, 'Category created successfully');
}

/**
 * Update existing portfolio category
 */
function updatePortfolioCategory(data) {
  if (!data.id) return errorResponse('Missing category ID');

  const sheet = getSheet('PORTFOLIO_CATEGORIES');
  const rowIndex = findRowIndexById(sheet, data.id);
  if (rowIndex === -1) return errorResponse('Category not found with ID: ' + data.id);

  const headers = sheet.getDataRange().getValues()[0].map(h => String(h).trim());
  const now = new Date().toISOString();

  headers.forEach((header, colIdx) => {
    if (header === 'id' || header === 'created_at') return;
    if (header === 'updated_at') {
      sheet.getRange(rowIndex, colIdx + 1).setValue(now);
    } else if (data[header] !== undefined) {
      sheet.getRange(rowIndex, colIdx + 1).setValue(data[header]);
    }
  });

  logActivity(data.admin_user || 'admin', 'UPDATE', 'PORTFOLIO_CATEGORIES', data.id, 'Updated category');
  return successResponse({ id: data.id, ...data }, 'Category updated successfully');
}

/**
 * Delete portfolio category
 */
function deletePortfolioCategory(id) {
  if (!id) return errorResponse('Missing category ID');
  const sheet = getSheet('PORTFOLIO_CATEGORIES');
  const rowIndex = findRowIndexById(sheet, id);
  if (rowIndex === -1) return errorResponse('Category not found');

  sheet.deleteRow(rowIndex);
  logActivity('admin', 'DELETE', 'PORTFOLIO_CATEGORIES', id, 'Deleted category');
  return successResponse({ id: id }, 'Category deleted successfully');
}

// ========================================
// PORTFOLIO PROJECTS
// ========================================

/**
 * Get portfolios by category
 */
function getPortfoliosByCategory(categoryId, status) {
  const sheet = getSheet('PORTFOLIO');
  let items = sheetDataToObjectArray(sheet);

  if (categoryId) {
    items = items.filter(p => String(p.category_id) === String(categoryId));
  }
  if (status && status !== 'all') {
    items = items.filter(p => String(p.status).toLowerCase() === status.toLowerCase());
  }

  // Attach associated media & links
  const mediaSheet = getSheet('PORTFOLIO_MEDIA');
  const allMedia = sheetDataToObjectArray(mediaSheet);
  const linksSheet = getSheet('PORTFOLIO_LINKS');
  const allLinks = sheetDataToObjectArray(linksSheet);

  items = items.map(p => {
    const pMedia = allMedia
      .filter(m => String(m.portfolio_id) === String(p.id) && (status === 'all' ? true : String(m.status) === 'published'))
      .sort((a, b) => (Number(a.display_order) || 0) - (Number(b.display_order) || 0));

    const pLinks = allLinks
      .filter(l => String(l.portfolio_id) === String(p.id) && (status === 'all' ? true : String(l.status) === 'published'))
      .sort((a, b) => (Number(a.display_order) || 0) - (Number(b.display_order) || 0));

    return {
      ...p,
      media_count: pMedia.length > 0 ? pMedia.length : 1,
      media: pMedia,
      links: pLinks
    };
  });

  items.sort((a, b) => {
    const featA = a.featured === true || String(a.featured).toLowerCase() === 'true' ? 1 : 0;
    const featB = b.featured === true || String(b.featured).toLowerCase() === 'true' ? 1 : 0;
    if (featA !== featB) return featB - featA;
    return (Number(a.display_order) || 0) - (Number(b.display_order) || 0);
  });

  return successResponse(items, 'Portfolios retrieved');
}

/**
 * Get portfolio item detail by ID
 */
function getPortfolioDetail(portfolioId) {
  if (!portfolioId) return errorResponse('Missing portfolio ID');
  const sheet = getSheet('PORTFOLIO');
  const items = sheetDataToObjectArray(sheet);
  const found = items.find(i => String(i.id) === String(portfolioId));
  if (!found) return errorResponse('Portfolio item not found');

  const mediaSheet = getSheet('PORTFOLIO_MEDIA');
  const pMedia = sheetDataToObjectArray(mediaSheet)
    .filter(m => String(m.portfolio_id) === String(portfolioId))
    .sort((a, b) => (Number(a.display_order) || 0) - (Number(b.display_order) || 0));

  const linksSheet = getSheet('PORTFOLIO_LINKS');
  const pLinks = sheetDataToObjectArray(linksSheet)
    .filter(l => String(l.portfolio_id) === String(portfolioId))
    .sort((a, b) => (Number(a.display_order) || 0) - (Number(b.display_order) || 0));

  return successResponse({
    ...found,
    media: pMedia,
    links: pLinks
  }, 'Portfolio detail retrieved');
}

/**
 * Create new portfolio project
 */
function createPortfolio(data) {
  const sheet = getSheet('PORTFOLIO');
  const headers = sheet.getDataRange().getValues()[0].map(h => String(h).trim());
  const id = generateId('port');
  const now = new Date().toISOString();

  const row = headers.map(header => {
    switch (header) {
      case 'id': return id;
      case 'category_id': return data.category_id || '';
      case 'title_id': return data.title_id || data.title || '';
      case 'title_en': return data.title_en || data.title || '';
      case 'description_id': return data.description_id || data.description || '';
      case 'description_en': return data.description_en || data.description || '';
      case 'year': return data.year || new Date().getFullYear().toString();
      case 'cover_image': return data.cover_image || '';
      case 'status': return data.status || 'published';
      case 'display_order': return Number(data.display_order) || (sheet.getLastRow());
      case 'featured': return Boolean(data.featured);
      case 'created_at': return now;
      case 'updated_at': return now;
      default: return data[header] !== undefined ? data[header] : '';
    }
  });

  sheet.appendRow(row);
  logActivity(data.admin_user || 'admin', 'CREATE', 'PORTFOLIO', id, 'Created project ' + (data.title_en || data.title_id));
  return successResponse({ id: id, ...data }, 'Portfolio created successfully');
}

/**
 * Update existing portfolio project
 */
function updatePortfolio(data) {
  if (!data.id) return errorResponse('Missing portfolio ID');
  const sheet = getSheet('PORTFOLIO');
  const rowIndex = findRowIndexById(sheet, data.id);
  if (rowIndex === -1) return errorResponse('Portfolio item not found');

  const headers = sheet.getDataRange().getValues()[0].map(h => String(h).trim());
  const now = new Date().toISOString();

  headers.forEach((header, colIdx) => {
    if (header === 'id' || header === 'created_at') return;
    if (header === 'updated_at') {
      sheet.getRange(rowIndex, colIdx + 1).setValue(now);
    } else if (data[header] !== undefined) {
      sheet.getRange(rowIndex, colIdx + 1).setValue(data[header]);
    }
  });

  logActivity(data.admin_user || 'admin', 'UPDATE', 'PORTFOLIO', data.id, 'Updated portfolio project');
  return successResponse({ id: data.id, ...data }, 'Portfolio updated successfully');
}

/**
 * Delete portfolio project
 */
function deletePortfolio(id) {
  if (!id) return errorResponse('Missing portfolio ID');
  const sheet = getSheet('PORTFOLIO');
  const rowIndex = findRowIndexById(sheet, id);
  if (rowIndex === -1) return errorResponse('Portfolio item not found');

  sheet.deleteRow(rowIndex);
  logActivity('admin', 'DELETE', 'PORTFOLIO', id, 'Deleted portfolio project');
  return successResponse({ id: id }, 'Portfolio deleted successfully');
}

// ========================================
// PORTFOLIO MEDIA
// ========================================

/**
 * Get media items for a portfolio
 */
function getPortfolioMedia(portfolioId, status) {
  const sheet = getSheet('PORTFOLIO_MEDIA');
  let items = sheetDataToObjectArray(sheet);

  if (portfolioId) {
    items = items.filter(m => String(m.portfolio_id) === String(portfolioId));
  }
  if (status && status !== 'all') {
    items = items.filter(m => String(m.status).toLowerCase() === status.toLowerCase());
  }

  items.sort((a, b) => (Number(a.display_order) || 0) - (Number(b.display_order) || 0));
  return successResponse(items, 'Portfolio media retrieved');
}

/**
 * Add media item to a portfolio project
 */
function addPortfolioMedia(data) {
  if (!data.portfolio_id) return errorResponse('Missing portfolio_id for media');
  const sheet = getSheet('PORTFOLIO_MEDIA');
  const headers = sheet.getDataRange().getValues()[0].map(h => String(h).trim());
  const id = generateId('media');
  const now = new Date().toISOString();

  const row = headers.map(header => {
    switch (header) {
      case 'id': return id;
      case 'portfolio_id': return data.portfolio_id;
      case 'media_type': return data.media_type || 'image';
      case 'media_url': return data.media_url || '';
      case 'thumbnail_url': return data.thumbnail_url || data.media_url || '';
      case 'title_id': return data.title_id || data.title || '';
      case 'title_en': return data.title_en || data.title || '';
      case 'description_id': return data.description_id || data.description || '';
      case 'description_en': return data.description_en || data.description || '';
      case 'display_order': return Number(data.display_order) || (sheet.getLastRow());
      case 'status': return data.status || 'published';
      case 'created_at': return now;
      case 'updated_at': return now;
      default: return data[header] !== undefined ? data[header] : '';
    }
  });

  sheet.appendRow(row);
  logActivity(data.admin_user || 'admin', 'CREATE', 'PORTFOLIO_MEDIA', id, 'Added media to project ' + data.portfolio_id);
  return successResponse({ id: id, ...data }, 'Media added successfully');
}

/**
 * Update media item
 */
function updatePortfolioMedia(data) {
  if (!data.id) return errorResponse('Missing media ID');
  const sheet = getSheet('PORTFOLIO_MEDIA');
  const rowIndex = findRowIndexById(sheet, data.id);
  if (rowIndex === -1) return errorResponse('Media item not found');

  const headers = sheet.getDataRange().getValues()[0].map(h => String(h).trim());
  const now = new Date().toISOString();

  headers.forEach((header, colIdx) => {
    if (header === 'id' || header === 'created_at') return;
    if (header === 'updated_at') {
      sheet.getRange(rowIndex, colIdx + 1).setValue(now);
    } else if (data[header] !== undefined) {
      sheet.getRange(rowIndex, colIdx + 1).setValue(data[header]);
    }
  });

  return successResponse({ id: data.id, ...data }, 'Media updated successfully');
}

/**
 * Delete media item
 */
function deletePortfolioMedia(id) {
  if (!id) return errorResponse('Missing media ID');
  const sheet = getSheet('PORTFOLIO_MEDIA');
  const rowIndex = findRowIndexById(sheet, id);
  if (rowIndex === -1) return errorResponse('Media not found');

  sheet.deleteRow(rowIndex);
  logActivity('admin', 'DELETE', 'PORTFOLIO_MEDIA', id, 'Deleted media item');
  return successResponse({ id: id }, 'Media deleted successfully');
}

/**
 * Reorder media items in a project
 */
function reorderPortfolioMedia(orderMap) {
  if (!orderMap || !Array.isArray(orderMap)) return errorResponse('Invalid orderMap format');
  const sheet = getSheet('PORTFOLIO_MEDIA');
  const headers = sheet.getDataRange().getValues()[0].map(h => String(h).trim());
  const orderCol = headers.indexOf('display_order');
  if (orderCol === -1) return errorResponse('display_order column not found');

  orderMap.forEach(item => {
    const rowIndex = findRowIndexById(sheet, item.id);
    if (rowIndex !== -1) {
      sheet.getRange(rowIndex, orderCol + 1).setValue(Number(item.order));
    }
  });

  return successResponse({}, 'Media order updated successfully');
}

// ========================================
// PORTFOLIO LINKS
// ========================================

/**
 * Get external links for a portfolio project
 */
function getPortfolioLinks(portfolioId, status) {
  const sheet = getSheet('PORTFOLIO_LINKS');
  let items = sheetDataToObjectArray(sheet);

  if (portfolioId) {
    items = items.filter(l => String(l.portfolio_id) === String(portfolioId));
  }
  if (status && status !== 'all') {
    items = items.filter(l => String(l.status).toLowerCase() === status.toLowerCase());
  }

  items.sort((a, b) => (Number(a.display_order) || 0) - (Number(b.display_order) || 0));
  return successResponse(items, 'Portfolio links retrieved');
}

/**
 * Add external link to portfolio
 */
function addPortfolioLink(data) {
  if (!data.portfolio_id) return errorResponse('Missing portfolio_id');
  const sheet = getSheet('PORTFOLIO_LINKS');
  const headers = sheet.getDataRange().getValues()[0].map(h => String(h).trim());
  const id = generateId('link');
  const now = new Date().toISOString();

  const row = headers.map(header => {
    switch (header) {
      case 'id': return id;
      case 'portfolio_id': return data.portfolio_id;
      case 'label_id': return data.label_id || data.label || '';
      case 'label_en': return data.label_en || data.label || '';
      case 'url': return data.url || '';
      case 'icon': return data.icon || 'globe';
      case 'display_order': return Number(data.display_order) || (sheet.getLastRow());
      case 'status': return data.status || 'published';
      case 'created_at': return now;
      case 'updated_at': return now;
      default: return data[header] !== undefined ? data[header] : '';
    }
  });

  sheet.appendRow(row);
  return successResponse({ id: id, ...data }, 'Link added successfully');
}

/**
 * Update external link
 */
function updatePortfolioLink(data) {
  if (!data.id) return errorResponse('Missing link ID');
  const sheet = getSheet('PORTFOLIO_LINKS');
  const rowIndex = findRowIndexById(sheet, data.id);
  if (rowIndex === -1) return errorResponse('Link not found');

  const headers = sheet.getDataRange().getValues()[0].map(h => String(h).trim());
  const now = new Date().toISOString();

  headers.forEach((header, colIdx) => {
    if (header === 'id' || header === 'created_at') return;
    if (header === 'updated_at') {
      sheet.getRange(rowIndex, colIdx + 1).setValue(now);
    } else if (data[header] !== undefined) {
      sheet.getRange(rowIndex, colIdx + 1).setValue(data[header]);
    }
  });

  return successResponse({ id: data.id, ...data }, 'Link updated successfully');
}

/**
 * Delete external link
 */
function deletePortfolioLink(id) {
  if (!id) return errorResponse('Missing link ID');
  const sheet = getSheet('PORTFOLIO_LINKS');
  const rowIndex = findRowIndexById(sheet, id);
  if (rowIndex === -1) return errorResponse('Link not found');

  sheet.deleteRow(rowIndex);
  return successResponse({ id: id }, 'Link deleted successfully');
}

// ========================================
// EXPERIENCE
// ========================================

/**
 * Get experience records
 */
function getExperience(status) {
  const sheet = getSheet('EXPERIENCE');
  let items = sheetDataToObjectArray(sheet);

  if (status && status !== 'all') {
    items = items.filter(e => String(e.status).toLowerCase() === status.toLowerCase());
  }

  items.sort((a, b) => (Number(a.display_order) || 0) - (Number(b.display_order) || 0));
  return successResponse(items, 'Experiences retrieved successfully');
}

/**
 * Create new experience record
 */
function createExperience(data) {
  const sheet = getSheet('EXPERIENCE');
  const headers = sheet.getDataRange().getValues()[0].map(h => String(h).trim());
  const id = generateId('exp');
  const now = new Date().toISOString();

  const row = headers.map(header => {
    switch (header) {
      case 'id': return id;
      case 'year_start': return data.year_start || '';
      case 'year_end': return data.year_end || '';
      case 'is_current': return Boolean(data.is_current);
      case 'position_id': return data.position_id || data.position || '';
      case 'position_en': return data.position_en || data.position || '';
      case 'company': return data.company || '';
      case 'location': return data.location || '';
      case 'description_id': return data.description_id || data.description || '';
      case 'description_en': return data.description_en || data.description || '';
      case 'company_logo': return data.company_logo || '';
      case 'display_order': return Number(data.display_order) || (sheet.getLastRow());
      case 'status': return data.status || 'published';
      case 'created_at': return now;
      case 'updated_at': return now;
      default: return data[header] !== undefined ? data[header] : '';
    }
  });

  sheet.appendRow(row);
  logActivity(data.admin_user || 'admin', 'CREATE', 'EXPERIENCE', id, 'Added experience at ' + data.company);
  return successResponse({ id: id, ...data }, 'Experience created successfully');
}

/**
 * Update experience record
 */
function updateExperience(data) {
  if (!data.id) return errorResponse('Missing experience ID');
  const sheet = getSheet('EXPERIENCE');
  const rowIndex = findRowIndexById(sheet, data.id);
  if (rowIndex === -1) return errorResponse('Experience not found');

  const headers = sheet.getDataRange().getValues()[0].map(h => String(h).trim());
  const now = new Date().toISOString();

  headers.forEach((header, colIdx) => {
    if (header === 'id' || header === 'created_at') return;
    if (header === 'updated_at') {
      sheet.getRange(rowIndex, colIdx + 1).setValue(now);
    } else if (data[header] !== undefined) {
      sheet.getRange(rowIndex, colIdx + 1).setValue(data[header]);
    }
  });

  logActivity(data.admin_user || 'admin', 'UPDATE', 'EXPERIENCE', data.id, 'Updated experience record');
  return successResponse({ id: data.id, ...data }, 'Experience updated successfully');
}

/**
 * Delete experience record
 */
function deleteExperience(id) {
  if (!id) return errorResponse('Missing experience ID');
  const sheet = getSheet('EXPERIENCE');
  const rowIndex = findRowIndexById(sheet, id);
  if (rowIndex === -1) return errorResponse('Experience not found');

  sheet.deleteRow(rowIndex);
  logActivity('admin', 'DELETE', 'EXPERIENCE', id, 'Deleted experience record');
  return successResponse({ id: id }, 'Experience deleted successfully');
}

// ========================================
// SOCIALS
// ========================================

/**
 * Get social platform links
 */
function getSocials(status) {
  const sheet = getSheet('SOCIALS');
  let items = sheetDataToObjectArray(sheet);

  if (status && status !== 'all') {
    items = items.filter(s => String(s.status).toLowerCase() === status.toLowerCase());
  }

  items.sort((a, b) => (Number(a.display_order) || 0) - (Number(b.display_order) || 0));
  return successResponse(items, 'Social platforms retrieved successfully');
}

/**
 * Create social platform record
 */
function createSocial(data) {
  const sheet = getSheet('SOCIALS');
  const headers = sheet.getDataRange().getValues()[0].map(h => String(h).trim());
  const id = generateId('soc');
  const now = new Date().toISOString();

  const row = headers.map(header => {
    switch (header) {
      case 'id': return id;
      case 'platform': return data.platform || 'other';
      case 'label_id': return data.label_id || data.label || '';
      case 'label_en': return data.label_en || data.label || '';
      case 'username': return data.username || '';
      case 'url': return data.url || '';
      case 'icon': return data.icon || '';
      case 'display_order': return Number(data.display_order) || (sheet.getLastRow());
      case 'status': return data.status || 'active';
      case 'created_at': return now;
      case 'updated_at': return now;
      default: return data[header] !== undefined ? data[header] : '';
    }
  });

  sheet.appendRow(row);
  logActivity(data.admin_user || 'admin', 'CREATE', 'SOCIALS', id, 'Added social platform ' + data.platform);
  return successResponse({ id: id, ...data }, 'Social platform created successfully');
}

/**
 * Update social platform record
 */
function updateSocial(data) {
  if (!data.id) return errorResponse('Missing social platform ID');
  const sheet = getSheet('SOCIALS');
  const rowIndex = findRowIndexById(sheet, data.id);
  if (rowIndex === -1) return errorResponse('Social platform not found');

  const headers = sheet.getDataRange().getValues()[0].map(h => String(h).trim());
  const now = new Date().toISOString();

  headers.forEach((header, colIdx) => {
    if (header === 'id' || header === 'created_at') return;
    if (header === 'updated_at') {
      sheet.getRange(rowIndex, colIdx + 1).setValue(now);
    } else if (data[header] !== undefined) {
      sheet.getRange(rowIndex, colIdx + 1).setValue(data[header]);
    }
  });

  logActivity(data.admin_user || 'admin', 'UPDATE', 'SOCIALS', data.id, 'Updated social platform');
  return successResponse({ id: data.id, ...data }, 'Social platform updated successfully');
}

/**
 * Delete social platform record
 */
function deleteSocial(id) {
  if (!id) return errorResponse('Missing social ID');
  const sheet = getSheet('SOCIALS');
  const rowIndex = findRowIndexById(sheet, id);
  if (rowIndex === -1) return errorResponse('Social platform not found');

  sheet.deleteRow(rowIndex);
  logActivity('admin', 'DELETE', 'SOCIALS', id, 'Deleted social platform');
  return successResponse({ id: id }, 'Social platform deleted successfully');
}

// ========================================
// SETTINGS
// ========================================

/**
 * Get all website settings as a key-value dictionary
 */
function getSettings() {
  const sheet = getSheet('SETTINGS');
  const items = sheetDataToObjectArray(sheet);
  const settingsMap = {};

  items.forEach(item => {
    let val = item.value;
    if (val === 'true') val = true;
    if (val === 'false') val = false;
    settingsMap[item.key] = val;
  });

  return successResponse(settingsMap, 'Settings retrieved successfully');
}

/**
 * Update settings in batch
 */
function updateSettings(data) {
  const sheet = getSheet('SETTINGS');
  const rows = sheet.getDataRange().getValues();
  const now = new Date().toISOString();

  Object.keys(data).forEach(key => {
    if (key === 'admin_user') return;
    let found = false;
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][0]).trim() === key) {
        sheet.getRange(i + 1, 2).setValue(String(data[key]));
        sheet.getRange(i + 1, 4).setValue(now);
        found = true;
        break;
      }
    }
    if (!found) {
      sheet.appendRow([key, String(data[key]), 'Custom setting', now]);
    }
  });

  logActivity(data.admin_user || 'admin', 'UPDATE', 'SETTINGS', 'global', 'Updated website settings');
  return successResponse(getSettings().data, 'Settings updated successfully');
}

// ========================================
// GOOGLE DRIVE
// ========================================

/**
 * Get or create folder hierarchy inside Google Drive
 */
function getOrCreateDriveFolder(subfolderName) {
  const config = getAppConfig();
  let rootFolder = null;

  if (config.driveRootFolderId) {
    try {
      rootFolder = DriveApp.getFolderById(config.driveRootFolderId);
    } catch (e) {
      Logger.log('Could not open root folder by ID: ' + e.message);
    }
  }

  if (!rootFolder) {
    const existing = DriveApp.getFoldersByName('Portfolio Assets');
    if (existing.hasNext()) {
      rootFolder = existing.next();
    } else {
      rootFolder = DriveApp.createFolder('Portfolio Assets');
    }
  }

  const sub = subfolderName || 'Uploads';
  const subIter = rootFolder.getFoldersByName(sub);
  if (subIter.hasNext()) {
    return subIter.next();
  } else {
    return rootFolder.createFolder(sub);
  }
}

/**
 * Upload base64 encoded image to Google Drive and return accessible direct URL
 */
function uploadImageToDrive(data) {
  if (!data || !data.base64Data) {
    return errorResponse('No image data provided for upload');
  }

  try {
    const folderType = data.folder || 'Portfolio';
    const filename = data.filename || ('file_' + new Date().getTime() + '.jpg');
    let mimeType = data.mimeType || 'image/jpeg';

    let cleanBase64 = data.base64Data;
    if (cleanBase64.indexOf(',') > -1) {
      const parts = cleanBase64.split(',');
      const match = parts[0].match(/:(.*?);/);
      if (match) mimeType = match[1];
      cleanBase64 = parts[1];
    }

    const decodedBytes = Utilities.base64Decode(cleanBase64);
    const blob = Utilities.newBlob(decodedBytes, mimeType, filename);
    const targetFolder = getOrCreateDriveFolder(folderType);
    const file = targetFolder.createFile(blob);

    // Set permission to anyone with link can view
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const fileId = file.getId();
    const directUrl = 'https://drive.google.com/uc?export=view&id=' + fileId;

    logActivity(data.admin_user || 'admin', 'UPLOAD', 'DRIVE', fileId, 'Uploaded asset ' + filename);

    return successResponse({
      fileId: fileId,
      url: directUrl,
      filename: filename
    }, 'File uploaded successfully to Google Drive');
  } catch (err) {
    return errorResponse('Failed to upload file to Google Drive: ' + (err.message || String(err)));
  }
}

/**
 * Delete file from Google Drive
 */
function deleteImageFromDrive(fileId) {
  if (!fileId) return errorResponse('Missing file ID');
  try {
    const file = DriveApp.getFileById(fileId);
    file.setTrashed(true);
    return successResponse({ fileId: fileId }, 'File deleted from Google Drive');
  } catch (err) {
    return errorResponse('Failed to delete file from Google Drive: ' + err.message);
  }
}

// ========================================
// ACTIVITY LOG
// ========================================

/**
 * Append entry to ACTIVITY_LOG sheet
 */
function logActivity(adminId, action, target, targetId, metadata) {
  try {
    const sheet = getSheet('ACTIVITY_LOG');
    const id = generateId('act');
    const timestamp = new Date().toISOString();
    sheet.appendRow([
      id,
      adminId || 'system',
      action || 'UNKNOWN',
      target || 'General',
      targetId || '',
      timestamp,
      typeof metadata === 'object' ? JSON.stringify(metadata) : String(metadata || '')
    ]);
  } catch (err) {
    Logger.log('Activity log record error: ' + err.message);
  }
}

/**
 * Retrieve recent activity logs
 */
function getActivityLogs(limit) {
  const sheet = getSheet('ACTIVITY_LOG');
  let items = sheetDataToObjectArray(sheet);
  items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  if (limit && Number(limit) > 0) {
    items = items.slice(0, Number(limit));
  }
  return successResponse(items, 'Activity logs retrieved');
}

// ========================================
// DATABASE INITIALIZATION & SETUP SCRIPT
// ========================================

/**
 * Run setupSpreadsheet() once inside Apps Script Editor to create all 10 sheets
 * with exact column schemas and initial demo records.
 */
function setupSpreadsheet() {
  const ss = getSpreadsheet();
  const now = new Date().toISOString();

  const sheetsDef = [
    {
      name: 'PROFILE',
      headers: [
        'id', 'name', 'professional_title_id', 'professional_title_en',
        'short_intro_id', 'short_intro_en', 'bio_id', 'bio_en',
        'profile_image', 'location', 'email', 'whatsapp', 'website',
        'instagram', 'linkedin', 'github', 'updated_at'
      ],
      initialRows: [
        [
          'profile_main',
          'Naufal',
          'Teknolog Kreatif & Desainer Digital',
          'Creative Technologist & Digital Designer',
          'Menciptakan produk digital elegan di persimpangan desain, teknologi, dan pengalaman visual.',
          'Building elegant digital products at the intersection of design, technology, and visual experiences.',
          'Saya adalah pengembang kreatif dengan pengalaman merancang antarmuka minimalis dan web modern berkinerja tinggi.',
          'I am a creative developer with hands-on experience designing and crafting high-performance web applications and minimalist digital interfaces.',
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
          'Jakarta, Indonesia',
          'contact@naufalporto.com',
          '+6281234567890',
          'https://naufalporto.com',
          'naufal',
          'naufal',
          'naufal',
          now
        ]
      ]
    },
    {
      name: 'PORTFOLIO_CATEGORIES',
      headers: [
        'id', 'name_id', 'name_en', 'slug', 'subtitle_id', 'subtitle_en',
        'description_id', 'description_en', 'cover_image', 'display_order',
        'status', 'created_at', 'updated_at'
      ],
      initialRows: [
        [
          'cat_web',
          'Pengembangan Web',
          'Web Development',
          'web-development',
          'Website & Aplikasi Interaktif',
          'Interactive Web Experiences & Systems',
          'Aplikasi web performa tinggi dengan arsitektur modern dan animasi halus.',
          'High-performance interactive web applications, architectural precision, and silky-smooth micro-animations.',
          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80',
          1,
          'published',
          now,
          now
        ],
        [
          'cat_design',
          'Desain Grafis',
          'Graphic Design',
          'graphic-design',
          'Identitas Visual & Branding',
          'Visual Identity & Editorial Craft',
          'Desain visual terstruktur, identitas merek, tipografi, dan layout editorial.',
          'Cohesive brand identity systems, architectural typography, and editorial publication layouts.',
          'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=900&q=80',
          2,
          'published',
          now,
          now
        ],
        [
          'cat_video',
          'Video & Motion',
          'Video & Motion',
          'video-motion',
          'Visual Bergerak & Sinematografi',
          'Cinematic Motion & Direction',
          'Produksi video sinematik, visual bergerak dinamis, dan tipografi kinetik.',
          'Cinematic motion design, expressive kinetic typography, and storytelling video narratives.',
          'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=900&q=80',
          3,
          'published',
          now,
          now
        ],
        [
          'cat_mkt',
          'Digital Marketing',
          'Digital Marketing',
          'digital-marketing',
          'Kampanye & Pertumbuhan Brand',
          'Campaign Strategy & Growth',
          'Kampanye digital berbasis data, strategi konten, dan optimasi konversi.',
          'Data-driven digital marketing campaigns, conversion-focused landing systems, and content ecosystems.',
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80',
          4,
          'published',
          now,
          now
        ]
      ]
    },
    {
      name: 'PORTFOLIO',
      headers: [
        'id', 'category_id', 'title_id', 'title_en', 'description_id', 'description_en',
        'year', 'cover_image', 'status', 'display_order', 'featured', 'created_at', 'updated_at'
      ],
      initialRows: [
        [
          'port_1',
          'cat_web',
          'Platform Portofolio Interaktif',
          'Interactive Portfolio Platform',
          'Website portofolio berkinerja tinggi dengan arsitektur Google Spreadsheet terintegrasi.',
          'High-performance creative portfolio website powered by unified Google Apps Script and Spreadsheet architecture.',
          '2026',
          'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
          'published',
          1,
          true,
          now,
          now
        ],
        [
          'port_2',
          'cat_design',
          'Sistem Identitas Monogram Lumina',
          'Lumina Monogram Identity System',
          'Sistem branding minimalis dengan tipografi khusus dan panduan desain menyeluruh.',
          'Minimalist corporate identity system featuring custom typography, stationery, and comprehensive design standards.',
          '2025',
          'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&w=1200&q=80',
          'published',
          1,
          true,
          now,
          now
        ]
      ]
    },
    {
      name: 'PORTFOLIO_MEDIA',
      headers: [
        'id', 'portfolio_id', 'media_type', 'media_url', 'thumbnail_url',
        'title_id', 'title_en', 'description_id', 'description_en',
        'display_order', 'status', 'created_at', 'updated_at'
      ],
      initialRows: [
        [
          'med_1',
          'port_1',
          'image',
          'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=400&q=80',
          'Tampilan Beranda Desktop',
          'Desktop Homepage Showcase',
          'Layout editorial dengan hero tipografi berskala besar',
          'Editorial layout showcasing responsive bold typographic scale',
          1,
          'published',
          now,
          now
        ],
        [
          'med_2',
          'port_1',
          'image',
          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80',
          'Dashboard Manajemen Konten',
          'Content Management Dashboard',
          'Panel kontrol dinamis untuk pengelolaan proyek dan profil',
          'Dynamic control panel for managing works, media, and platform links',
          2,
          'published',
          now,
          now
        ]
      ]
    },
    {
      name: 'PORTFOLIO_LINKS',
      headers: [
        'id', 'portfolio_id', 'label_id', 'label_en', 'url', 'icon',
        'display_order', 'status', 'created_at', 'updated_at'
      ],
      initialRows: [
        [
          'lnk_1',
          'port_1',
          'Buka Live Website',
          'Visit Live Experience',
          'https://alexanderbayu.dev',
          'globe',
          1,
          'published',
          now,
          now
        ],
        [
          'lnk_2',
          'port_1',
          'Repositori GitHub',
          'GitHub Source Code',
          'https://github.com/alexanderbayu',
          'github',
          2,
          'published',
          now,
          now
        ]
      ]
    },
    {
      name: 'EXPERIENCE',
      headers: [
        'id', 'year_start', 'year_end', 'is_current', 'position_id', 'position_en',
        'company', 'location', 'description_id', 'description_en',
        'company_logo', 'display_order', 'status', 'created_at', 'updated_at'
      ],
      initialRows: [
        [
          'exp_1',
          '2023',
          'Present',
          true,
          'Lead Creative Developer',
          'Lead Creative Developer',
          'Studio Lumina Creative',
          'Jakarta, ID',
          'Memimpin pengembangan platform digital modern dan pengalaman visual interaktif.',
          'Directing creative front-end architecture, bespoke interactive experiences, and design systems.',
          '',
          1,
          'published',
          now,
          now
        ],
        [
          'exp_2',
          '2021',
          '2023',
          false,
          'Senior Frontend Engineer',
          'Senior Frontend Engineer',
          'Nexus Digital Labs',
          'Singapore / Remote',
          'Membangun aplikasi web berperforma tinggi dan sistem desain modular.',
          'Built mission-critical web applications, optimized client-side rendering, and maintained modular design tokens.',
          '',
          2,
          'published',
          now,
          now
        ],
        [
          'exp_3',
          '2019',
          '2021',
          false,
          'UI/UX & Web Designer',
          'UI/UX & Web Designer',
          'Vanguard Media Studio',
          'Bandung, ID',
          'Merancang antarmuka pengguna, prototipe interaktif, dan identitas digital.',
          'Crafted responsive digital interfaces, interactive prototypes, and cohesive visual identities.',
          '',
          3,
          'published',
          now,
          now
        ]
      ]
    },
    {
      name: 'SOCIALS',
      headers: [
        'id', 'platform', 'label_id', 'label_en', 'username', 'url', 'icon',
        'display_order', 'status', 'created_at', 'updated_at'
      ],
      initialRows: [
        [
          'soc_1',
          'instagram',
          'Instagram Resmi',
          'Official Instagram',
          'alexanderbayu',
          'https://instagram.com/alexanderbayu',
          'instagram',
          1,
          'active',
          now,
          now
        ],
        [
          'soc_2',
          'tiktok',
          'TikTok Kreatif',
          'Creative TikTok',
          'alexanderbayu',
          'https://tiktok.com/@alexanderbayu',
          'tiktok',
          2,
          'active',
          now,
          now
        ],
        [
          'soc_3',
          'linkedin',
          'Profil LinkedIn',
          'LinkedIn Profile',
          'alexanderbayu',
          'https://linkedin.com/in/alexanderbayu',
          'linkedin',
          3,
          'active',
          now,
          now
        ],
        [
          'soc_4',
          'github',
          'Repositori GitHub',
          'GitHub Repositories',
          'alexanderbayu',
          'https://github.com/alexanderbayu',
          'github',
          4,
          'active',
          now,
          now
        ]
      ]
    },
    {
      name: 'SETTINGS',
      headers: ['key', 'value', 'description', 'updated_at'],
      initialRows: [
        ['site_title', 'Alexander Bayu — Creative Portfolio', 'Primary website document title', now],
        ['site_description', 'Personal portfolio of Alexander Bayu — Creative Technologist & Full-Stack Developer', 'Meta description for SEO', now],
        ['primary_color', '#6c4df6', 'Primary brand color hex', now],
        ['accent_color', '#ec4899', 'Accent brand color hex', now],
        ['secondary_color', '#3b82f6', 'Secondary color hex', now],
        ['hide_empty_categories', 'false', 'Hide empty chapters from public works showcase', now],
        ['footer_text', 'Crafted with precision & passion. Powered by Google Apps Script.', 'Custom footer copyright text', now]
      ]
    },
    {
      name: 'ADMIN',
      headers: ['id', 'username', 'password_hash', 'role', 'status', 'created_at', 'updated_at'],
      initialRows: [
        [
          'adm_1',
          'admin',
          hashPassword('admin123'),
          'superadmin',
          'active',
          now,
          now
        ]
      ]
    },
    {
      name: 'ACTIVITY_LOG',
      headers: ['id', 'admin_id', 'action', 'target', 'target_id', 'timestamp', 'metadata'],
      initialRows: [
        [
          'act_init',
          'system',
          'INIT',
          'DATABASE',
          'all',
          now,
          'Initial database tables created and seeded'
        ]
      ]
    }
  ];

  sheetsDef.forEach(def => {
    let sheet = ss.getSheetByName(def.name);
    if (!sheet) {
      sheet = ss.insertSheet(def.name);
    } else {
      sheet.clear();
    }

    // Set header row
    sheet.appendRow(def.headers);

    // Append initial seed rows
    if (def.initialRows && def.initialRows.length > 0) {
      def.initialRows.forEach(row => sheet.appendRow(row));
    }

    // Format header row style
    const headerRange = sheet.getRange(1, 1, 1, def.headers.length);
    headerRange.setBackground('#1e1b4b')
      .setFontColor('#ffffff')
      .setFontWeight('bold')
      .setHorizontalAlignment('center');
    sheet.setFrozenRows(1);
  });

  // Remove default "Sheet1" if present
  const defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && ss.getSheets().length > 1) {
    try { ss.deleteSheet(defaultSheet); } catch (e) {}
  }

  Logger.log('Setup successfully completed. All 10 sheets configured!');
  return successResponse({}, 'Database setup completed successfully for all 10 sheets');
}

// ========================================
// HTTP ENDPOINTS (doGet & doPost)
// ========================================

/**
 * Handle HTTP GET Requests
 */
function doGet(e) {
  try {
    const params = e && e.parameter ? e.parameter : {};
    const action = params.action || '';

    switch (action) {
      // Profile
      case 'getProfile':
        return jsonResponse(getProfile());

      // Portfolio Categories
      case 'getPortfolioCategories':
      case 'getCategories':
        return jsonResponse(getPortfolioCategories(params.status || 'published'));

      case 'getAllCategories':
        verifyAuthFromParams(params);
        return jsonResponse(getPortfolioCategories('all'));

      // Portfolio Projects
      case 'getPortfoliosByCategory':
      case 'getPortfolio':
      case 'getPortfolioByCategory':
        return jsonResponse(getPortfoliosByCategory(params.categoryId || params.category_id || '', params.status || 'published'));

      case 'getAllPortfolio':
        verifyAuthFromParams(params);
        return jsonResponse(getPortfoliosByCategory(params.categoryId || params.category_id || '', 'all'));

      case 'getPortfolioDetail':
        return jsonResponse(getPortfolioDetail(params.portfolioId || params.portfolio_id || params.id || ''));

      // Portfolio Media
      case 'getPortfolioMedia':
        return jsonResponse(getPortfolioMedia(params.portfolioId || params.portfolio_id || '', params.status || 'published'));

      case 'getAllPortfolioMedia':
        verifyAuthFromParams(params);
        return jsonResponse(getPortfolioMedia(params.portfolioId || params.portfolio_id || '', 'all'));

      // Portfolio Links
      case 'getPortfolioLinks':
        return jsonResponse(getPortfolioLinks(params.portfolioId || params.portfolio_id || '', params.status || 'published'));

      case 'getAllPortfolioLinks':
        verifyAuthFromParams(params);
        return jsonResponse(getPortfolioLinks(params.portfolioId || params.portfolio_id || '', 'all'));

      // Experience
      case 'getExperience':
      case 'getExperiences':
        return jsonResponse(getExperience(params.status || 'published'));

      case 'getAllExperiences':
        verifyAuthFromParams(params);
        return jsonResponse(getExperience('all'));

      // Socials
      case 'getSocials':
        return jsonResponse(getSocials(params.status || 'active'));

      case 'getAllSocials':
        verifyAuthFromParams(params);
        return jsonResponse(getSocials('all'));

      // Settings
      case 'getSettings':
        return jsonResponse(getSettings());

      // Activity Logs (Protected)
      case 'getActivityLogs':
        verifyAuthFromParams(params);
        return jsonResponse(getActivityLogs(params.limit || 50));

      // Health Ping
      case 'ping':
        return jsonResponse(successResponse({ timestamp: new Date().toISOString() }, 'Backend API is active'));

      // One-click Setup via GET
      case 'setupSpreadsheet':
        return jsonResponse(setupSpreadsheet());

      default:
        return jsonResponse(errorResponse('Invalid or missing GET action: ' + action));
    }
  } catch (err) {
    return jsonResponse(errorResponse('Server Error (GET): ' + (err.message || 'Unknown error')));
  }
}

/**
 * Handle HTTP POST Requests
 */
function doPost(e) {
  try {
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        payload = {};
      }
    }

    const action = payload.action || (e && e.parameter ? e.parameter.action : '');

    // Public Authentication Actions
    if (action === 'login' || action === 'loginAdmin') {
      return jsonResponse(loginAdmin(payload.username, payload.password));
    }

    if (action === 'validateSession') {
      return jsonResponse(validateSession(payload.token));
    }

    if (action === 'logout' || action === 'logoutAdmin') {
      return jsonResponse(logoutAdmin(payload.token));
    }

    // Protected Operations (Requires valid token)
    const token = payload.token || (e && e.parameter ? e.parameter.token : '');
    const authAdmin = verifyAuth(token);
    payload.admin_user = authAdmin.username;

    switch (action) {
      // Profile
      case 'updateProfile':
        return jsonResponse(updateProfile(payload));

      // Portfolio Categories
      case 'createPortfolioCategory':
      case 'createCategory':
        return jsonResponse(createPortfolioCategory(payload));

      case 'updatePortfolioCategory':
      case 'updateCategory':
        return jsonResponse(updatePortfolioCategory(payload));

      case 'deletePortfolioCategory':
      case 'deleteCategory':
        return jsonResponse(deletePortfolioCategory(payload.id));

      // Portfolio Projects
      case 'createPortfolio':
        return jsonResponse(createPortfolio(payload));

      case 'updatePortfolio':
        return jsonResponse(updatePortfolio(payload));

      case 'deletePortfolio':
        return jsonResponse(deletePortfolio(payload.id));

      // Portfolio Media
      case 'addPortfolioMedia':
        return jsonResponse(addPortfolioMedia(payload));

      case 'updatePortfolioMedia':
        return jsonResponse(updatePortfolioMedia(payload));

      case 'deletePortfolioMedia':
        return jsonResponse(deletePortfolioMedia(payload.id));

      case 'reorderPortfolioMedia':
        return jsonResponse(reorderPortfolioMedia(payload.orderMap));

      // Portfolio Links
      case 'addPortfolioLink':
        return jsonResponse(addPortfolioLink(payload));

      case 'updatePortfolioLink':
        return jsonResponse(updatePortfolioLink(payload));

      case 'deletePortfolioLink':
        return jsonResponse(deletePortfolioLink(payload.id));

      // Experience
      case 'createExperience':
        return jsonResponse(createExperience(payload));

      case 'updateExperience':
        return jsonResponse(updateExperience(payload));

      case 'deleteExperience':
        return jsonResponse(deleteExperience(payload.id));

      // Socials
      case 'createSocial':
        return jsonResponse(createSocial(payload));

      case 'updateSocial':
        return jsonResponse(updateSocial(payload));

      case 'deleteSocial':
        return jsonResponse(deleteSocial(payload.id));

      // Settings
      case 'updateSettings':
        return jsonResponse(updateSettings(payload));

      // Google Drive Upload
      case 'uploadImage':
      case 'uploadImageToDrive':
      case 'uploadFileToDrive':
        return jsonResponse(uploadImageToDrive(payload));

      case 'deleteImage':
      case 'deleteImageFromDrive':
        return jsonResponse(deleteImageFromDrive(payload.fileId));

      // One-click Setup
      case 'setupSpreadsheet':
        return jsonResponse(setupSpreadsheet());

      default:
        return jsonResponse(errorResponse('Invalid or missing POST action: ' + action));
    }
  } catch (err) {
    return jsonResponse(errorResponse('Server Error (POST): ' + (err.message || 'Unknown error')));
  }
}
