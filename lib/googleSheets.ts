import { google, sheets_v4 } from "googleapis";
import { JWT } from "google-auth-library";

// Đọc env lúc runtime, không phải lúc module load
// => dotenv.config() đã chạy trước khi module này được import động
function getSheetId(): string {
  const id = process.env.GOOGLE_SHEETS_ID;
  if (!id) throw new Error("GOOGLE_SHEETS_ID environment variable is required");
  return id;
}

const SHEET_NAME = process.env.GOOGLE_SHEETS_NAME || "Virtual Atelier";

let sheetsClient: sheets_v4.Sheets | null = null;
let authClient: JWT | null = null;

async function initializeClient(): Promise<JWT> {
  if (authClient) return authClient;

  const rawCreds = process.env.GOOGLE_SHEETS_CREDENTIALS;
  if (!rawCreds)
    throw new Error(
      "GOOGLE_SHEETS_CREDENTIALS environment variable is required",
    );

  const credentials = JSON.parse(
    Buffer.from(rawCreds, "base64").toString("utf-8"),
  );

  authClient = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return authClient;
}

function getSheetsClient(auth: JWT): sheets_v4.Sheets {
  if (!sheetsClient) {
    sheetsClient = google.sheets({ version: "v4", auth });
  }
  return sheetsClient;
}

export interface SheetUser {
  email: string;
  request_count: number;
}

export async function initializeSheet(): Promise<void> {
  const SHEET_ID = getSheetId();
  const auth = await initializeClient();
  const sheets = getSheetsClient(auth);

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A1:B1`,
    });

    if (!response.data.values || response.data.values.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!A1:B1`,
        valueInputOption: "RAW",
        requestBody: { values: [["email", "request_count"]] },
      });
    }
  } catch (error) {
    console.error("Error initializing sheet:", error);
    throw error;
  }
}

export async function getUserByEmail(email: string): Promise<SheetUser | null> {
  const SHEET_ID = getSheetId();
  const auth = await initializeClient();
  const sheets = getSheetsClient(auth);

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A2:B`,
    });

    const rows: string[][] = (response.data.values as string[][]) || [];
    const user = rows.find(
      (row) => row[0] && row[0].toLowerCase() === email.toLowerCase(),
    );

    if (user) {
      return { email: user[0], request_count: parseInt(user[1]) || 0 };
    }
    return null;
  } catch (error) {
    console.error("Error getting user:", error);
    throw error;
  }
}

export async function addUser(email: string): Promise<SheetUser> {
  const SHEET_ID = getSheetId();
  const auth = await initializeClient();
  const sheets = getSheetsClient(auth);

  const existing = await getUserByEmail(email);
  if (existing) return existing;

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A2`,
      valueInputOption: "RAW",
      requestBody: { values: [[email, 0]] },
    });

    return { email, request_count: 0 };
  } catch (error) {
    console.error("Error adding user:", error);
    throw error;
  }
}

export async function updateRequestCount(email: string): Promise<number> {
  const SHEET_ID = getSheetId();
  const auth = await initializeClient();
  const sheets = getSheetsClient(auth);

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A2:B`,
    });

    const rows: string[][] = (response.data.values as string[][]) || [];
    const rowIndex = rows.findIndex(
      (row) => row[0] && row[0].toLowerCase() === email.toLowerCase(),
    );

    if (rowIndex === -1) throw new Error("User not found");

    const newCount = (parseInt(rows[rowIndex][1]) || 0) + 1;

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!B${rowIndex + 2}`,
      valueInputOption: "RAW",
      requestBody: { values: [[newCount]] },
    });

    return newCount;
  } catch (error) {
    console.error("Error updating request count:", error);
    throw error;
  }
}

export async function getAllUsers(): Promise<SheetUser[]> {
  const SHEET_ID = getSheetId();
  const auth = await initializeClient();
  const sheets = getSheetsClient(auth);

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A2:B`,
    });

    const rows: string[][] = (response.data.values as string[][]) || [];
    return rows
      .filter((row) => row[0])
      .map((row) => ({ email: row[0], request_count: parseInt(row[1]) || 0 }))
      .sort((a, b) => b.request_count - a.request_count);
  } catch (error) {
    console.error("Error getting all users:", error);
    throw error;
  }
}

export async function deleteUser(email: string): Promise<void> {
  const SHEET_ID = getSheetId();
  const auth = await initializeClient();
  const sheets = getSheetsClient(auth);

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A2:B`,
    });

    const rows: string[][] = (response.data.values as string[][]) || [];
    const rowIndex = rows.findIndex(
      (row) => row[0] && row[0].toLowerCase() === email.toLowerCase(),
    );

    if (rowIndex === -1) throw new Error("User not found");

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: 0,
                dimension: "ROWS",
                startIndex: rowIndex + 1,
                endIndex: rowIndex + 2,
              },
            },
          },
        ],
      },
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}

export async function seedInitialUser(email: string): Promise<void> {
  try {
    const existing = await getUserByEmail(email);
    if (!existing) await addUser(email);
  } catch (error) {
    console.error("Error seeding initial user:", error);
  }
}

// ─── History Sheet ────────────────────────────────────────────────────────────
// Sheet thứ 2 tên "History", các cột:
// A: session_id | B: email | C: timestamp | D: theme | E: gender | F: aspectRatio
// G: productImageUrl | H: modelImageUrl | I: results (JSON array of {id, url})

const HISTORY_SHEET_NAME = "History";

export interface HistoryRow {
  session_id: string;
  email: string;
  timestamp: number;
  theme: string;
  gender: string;
  aspectRatio: string;
  productImageUrl?: string;
  modelImageUrl?: string;
  results: Array<{ id: string; url: string }>;
}

/** Đảm bảo sheet History tồn tại với header đúng */
export async function initializeHistorySheet(): Promise<void> {
  const SHEET_ID = getSheetId();
  const auth = await initializeClient();
  const sheets = getSheetsClient(auth);

  // Lấy danh sách sheets hiện tại
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const existing = meta.data.sheets?.find(
    (s) => s.properties?.title === HISTORY_SHEET_NAME,
  );

  if (!existing) {
    // Tạo sheet mới
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        requests: [{ addSheet: { properties: { title: HISTORY_SHEET_NAME } } }],
      },
    });
  }

  // Kiểm tra header
  const header = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${HISTORY_SHEET_NAME}!A1:I1`,
  });

  if (!header.data.values || header.data.values.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${HISTORY_SHEET_NAME}!A1:I1`,
      valueInputOption: "RAW",
      requestBody: {
        values: [
          [
            "session_id",
            "email",
            "timestamp",
            "theme",
            "gender",
            "aspectRatio",
            "productImageUrl",
            "modelImageUrl",
            "results",
          ],
        ],
      },
    });
  }
}

/** Lưu 1 session vào sheet History. */
export async function saveHistorySession(row: HistoryRow): Promise<void> {
  const SHEET_ID = getSheetId();
  const auth = await initializeClient();
  const sheets = getSheetsClient(auth);

  // Append row mới
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${HISTORY_SHEET_NAME}!A2`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [
        [
          row.session_id,
          row.email,
          row.timestamp,
          row.theme,
          row.gender,
          row.aspectRatio,
          row.productImageUrl ?? "",
          row.modelImageUrl ?? "",
          JSON.stringify(row.results),
        ],
      ],
    },
  });
}

/** Lấy toàn bộ sessions của user (sort theo timestamp desc) */
export async function getHistorySessions(email: string): Promise<HistoryRow[]> {
  const SHEET_ID = getSheetId();
  const auth = await initializeClient();
  const sheets = getSheetsClient(auth);

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${HISTORY_SHEET_NAME}!A2:I`,
  });

  const rows: string[][] = (response.data.values as string[][]) || [];
  const userRows = rows
    .filter((r) => r[1]?.toLowerCase() === email.toLowerCase())
    .map((r) => ({
      session_id: r[0] ?? "",
      email: r[1] ?? "",
      timestamp: parseInt(r[2]) || 0,
      theme: r[3] ?? "",
      gender: r[4] ?? "",
      aspectRatio: r[5] ?? "",
      productImageUrl: r[6] || undefined,
      modelImageUrl: r[7] || undefined,
      results: (() => {
        try {
          return JSON.parse(r[8] ?? "[]");
        } catch {
          return [];
        }
      })(),
    }))
    .sort((a, b) => b.timestamp - a.timestamp);

  return userRows;
}

/** Xóa toàn bộ history của user */
export async function clearUserHistory(email: string): Promise<void> {
  const SHEET_ID = getSheetId();
  const auth = await initializeClient();
  const sheets = getSheetsClient(auth);

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${HISTORY_SHEET_NAME}!A2:B`,
  });

  const rows: string[][] = (response.data.values as string[][]) || [];

  // sheetRowIndex 0-based theo Sheets API (header = 0, data bắt đầu từ 1)
  const indicesToDelete = rows
    .map((r, i) => (r[1]?.toLowerCase() === email.toLowerCase() ? i + 1 : -1))
    .filter((i) => i !== -1)
    .sort((a, b) => b - a); // DESC — xóa từ dưới lên

  if (indicesToDelete.length === 0) return;

  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const historySheet = meta.data.sheets?.find(
    (s) => s.properties?.title === HISTORY_SHEET_NAME,
  );
  const numericSheetId = historySheet?.properties?.sheetId ?? 1;

  // Xóa từng row một để tránh index shift sau mỗi lần xóa
  for (const rowIndex of indicesToDelete) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: numericSheetId,
                dimension: "ROWS",
                startIndex: rowIndex,
                endIndex: rowIndex + 1,
              },
            },
          },
        ],
      },
    });
  }
}
