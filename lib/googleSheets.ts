import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

const SHEET_ID = process.env.GOOGLE_SHEETS_ID || '1yen7RPq2d-IJqRVdBscLiGJaLg-ihtC2RUddMH5mBTg';
const SHEET_NAME = process.env.GOOGLE_SHEETS_NAME || 'Virtual Atelier';

let sheetsClient: any = null;
let authClient: JWT | null = null;

// Initialize Google Sheets API client
async function initializeClient() {
  if (authClient) return authClient;

  const credentials = JSON.parse(
    Buffer.from(process.env.GOOGLE_SHEETS_CREDENTIALS || '', 'base64').toString('utf-8')
  );

  authClient = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return authClient;
}

// Get Sheets API client
function getSheetsClient(auth: JWT) {
  if (!sheetsClient) {
    sheetsClient = google.sheets({ version: 'v4', auth });
  }
  return sheetsClient;
}

// Initialize sheet with headers if needed
async function initializeSheet() {
  const auth = await initializeClient();
  const sheets = getSheetsClient(auth);

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A1:B1`,
    });

    if (!response.data.values || response.data.values.length === 0) {
      // Add headers
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!A1:B1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [['email', 'request_count']],
        },
      });
    }
  } catch (error) {
    console.error('Error initializing sheet:', error);
    throw error;
  }
}

// Get user by email
async function getUserByEmail(email: string): Promise<any | null> {
  const auth = await initializeClient();
  const sheets = getSheetsClient(auth);

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A2:B`,
    });

    const rows = response.data.values || [];
    const user = rows.find(
      (row: any[]) => row[0] && row[0].toLowerCase() === email.toLowerCase()
    );

    if (user) {
      return {
        email: user[0],
        request_count: parseInt(user[1]) || 0,
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
}

// Add new user
async function addUser(email: string) {
  const auth = await initializeClient();
  const sheets = getSheetsClient(auth);

  try {
    // Check if user already exists
    const existing = await getUserByEmail(email);
    if (existing) {
      return existing;
    }

    // Append new user
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A2`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[email, 0]],
      },
    });

    return { email, request_count: 0 };
  } catch (error) {
    console.error('Error adding user:', error);
    throw error;
  }
}

// Update request count (increment)
async function updateRequestCount(email: string): Promise<number> {
  const auth = await initializeClient();
  const sheets = getSheetsClient(auth);

  try {
    const user = await getUserByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    const newCount = (user.request_count || 0) + 1;

    // Get all data to find row number
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A2:B`,
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(
      (row: any[]) => row[0] && row[0].toLowerCase() === email.toLowerCase()
    );

    if (rowIndex === -1) {
      throw new Error('User not found');
    }

    // Update the count
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!B${rowIndex + 2}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[newCount]],
      },
    });

    return newCount;
  } catch (error) {
    console.error('Error updating request count:', error);
    throw error;
  }
}

// Get all users
async function getAllUsers(): Promise<any[]> {
  const auth = await initializeClient();
  const sheets = getSheetsClient(auth);

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A2:B`,
    });

    const rows = response.data.values || [];
    return rows
      .map((row: any[]) => ({
        email: row[0],
        request_count: parseInt(row[1]) || 0,
      }))
      .sort((a: any, b: any) => b.request_count - a.request_count);
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
}

// Delete user by email
async function deleteUser(email: string) {
  const auth = await initializeClient();
  const sheets = getSheetsClient(auth);

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A2:B`,
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(
      (row: any[]) => row[0] && row[0].toLowerCase() === email.toLowerCase()
    );

    if (rowIndex === -1) {
      throw new Error('User not found');
    }

    // Delete row using batchUpdate
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: 0,
                dimension: 'ROWS',
                startIndex: rowIndex + 1,
                endIndex: rowIndex + 2,
              },
            },
          },
        ],
      },
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

// Seed initial user
async function seedInitialUser(email: string) {
  try {
    const existing = await getUserByEmail(email);
    if (!existing) {
      await addUser(email);
    }
  } catch (error) {
    console.error('Error seeding initial user:', error);
  }
}

export {
  initializeSheet,
  getUserByEmail,
  addUser,
  updateRequestCount,
  getAllUsers,
  deleteUser,
  seedInitialUser,
};
