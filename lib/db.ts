import Database from 'better-sqlite3';
import path from 'path';
import os from 'os';
import fs from 'fs';

// Check if the current workspace is in iCloud Drive
const isICloud = process.cwd().includes('Mobile Documents/com~apple~CloudDocs');
let dbPath = path.join(process.cwd(), 'agro_database.db');

if (isICloud) {
    const localDir = path.join(os.homedir(), '.agro');
    if (!fs.existsSync(localDir)) {
        fs.mkdirSync(localDir, { recursive: true });
    }
    const localDbPath = path.join(localDir, 'agro_database.db');
    
    // Copy the database file if it exists in project but not in localDir
    if (fs.existsSync(dbPath) && !fs.existsSync(localDbPath)) {
        try {
            fs.copyFileSync(dbPath, localDbPath);
        } catch (err) {
            console.error('Failed to copy db to local directory:', err);
        }
    }
    
    dbPath = localDbPath;
    console.log(`☁️ iCloud Drive detected! Diverting SQLite database to local SSD path to prevent locking: ${dbPath}`);
}

const db = new Database(dbPath, { verbose: console.log });

// Initialize Database Schema
const initDb = () => {
    // Items Table
    db.exec(`
        CREATE TABLE IF NOT EXISTS items (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            price REAL NOT NULL,
            unit TEXT NOT NULL,
            quantity REAL NOT NULL,
            inStock INTEGER NOT NULL CHECK (inStock IN (0, 1)),
            image TEXT,
            allowFractional INTEGER DEFAULT 0 CHECK (allowFractional IN (0, 1)),
            isDeleted INTEGER DEFAULT 0 CHECK (isDeleted IN (0, 1))
        )
    `);

    // ... (tables exist)

    // Migration: Add allowFractional if missing
    try {
        db.prepare('SELECT allowFractional FROM items LIMIT 1').get();
    } catch {
        console.log('Migrating: Adding allowFractional column...');
        db.exec('ALTER TABLE items ADD COLUMN allowFractional INTEGER DEFAULT 0');
        // Default existing 'kg' items to 1 (true) to preserve behavior
        db.exec("UPDATE items SET allowFractional = 1 WHERE unit = 'kg' OR unit = 'g'");
    }

    // Orders Table
    // Storing items as JSON string for simplicity in this prototype
    db.exec(`
        CREATE TABLE IF NOT EXISTS orders (
            id TEXT PRIMARY KEY,
            createdAt TEXT NOT NULL,
            buyerName TEXT NOT NULL,
            buyerType TEXT NOT NULL,
            phone TEXT,
            items TEXT NOT NULL, 
            totalAmount REAL NOT NULL,
            status TEXT NOT NULL,
            collectedAt TEXT,
            cancelledAt TEXT,
            note TEXT
        )
    `);

    // Seed data if empty
    const count = db.prepare('SELECT count(*) as c FROM items').get() as { c: number };
    if (count.c === 0) {
        console.log('Seeding database...');
        const initItems = [
            { id: '1', name: 'Spinach (Palak)', category: 'Leafy Greens', price: 40, unit: 'bundle', quantity: 50, inStock: 1, image: '/produce/spinach.jpg' },
            { id: '2', name: 'Tomatoes', category: 'Vegetables', price: 30, unit: 'kg', quantity: 100, inStock: 1, image: '/produce/tomatoes.jpg' },
            { id: '3', name: 'Carrots', category: 'Vegetables', price: 60, unit: 'kg', quantity: 40, inStock: 1, image: '/produce/carrots.jpg' },
            { id: '4', name: 'Potatoes', category: 'Vegetables', price: 35, unit: 'kg', quantity: 150, inStock: 1, image: '/produce/potatoes.jpg' },
            { id: '5', name: 'Onions', category: 'Vegetables', price: 45, unit: 'kg', quantity: 120, inStock: 1, image: '/produce/onions.jpg' },
            { id: '6', name: 'Green Chilies', category: 'Spices', price: 20, unit: 'g', quantity: 200, inStock: 1, image: '/produce/green-chilies.jpg' },
            { id: '7', name: 'Coriander', category: 'Leafy Greens', price: 15, unit: 'bundle', quantity: 60, inStock: 1, image: '/produce/coriander.jpg' },
            { id: '8', name: 'Brinjal (Eggplant)', category: 'Vegetables', price: 40, unit: 'kg', quantity: 30, inStock: 1, image: '/produce/brinjal.jpg' },
            { id: '9', name: 'Ladies Finger (Okra)', category: 'Vegetables', price: 50, unit: 'kg', quantity: 45, inStock: 1, image: '/produce/ladies-finger.jpg' }
        ];

        const insert = db.prepare('INSERT INTO items (id, name, category, price, unit, quantity, inStock, image, isDeleted) VALUES (@id, @name, @category, @price, @unit, @quantity, @inStock, @image, 0)');
        const insertMany = db.transaction((items) => {
            for (const item of items) insert.run(item);
        });

        insertMany(initItems);
    }

    // Settings Table (Global Config)
    db.exec(`
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        )
    `);

    // Announcements Table (Scrolling Ticker)
    db.exec(`
        CREATE TABLE IF NOT EXISTS announcements (
            id TEXT PRIMARY KEY,
            message TEXT NOT NULL,
            type TEXT DEFAULT 'info',
            expiresAt TEXT
        )
    `);

    // Initialize Default Settings if missing
    const settingsCount = db.prepare("SELECT count(*) as c FROM settings WHERE key = 'farm_status'").get() as { c: number };
    if (settingsCount.c === 0) {
        db.prepare("INSERT INTO settings (key, value) VALUES ('farm_status', 'open')").run();
        db.prepare("INSERT INTO settings (key, value) VALUES ('farm_status_reason', '')").run();
    }

}

// Verify and Fix Broken/Slow Images (Migration to fast local produce assets)
const produceImageMap: Record<string, string> = {
    'Spinach (Palak)': '/produce/spinach.jpg',
    'Tomatoes': '/produce/tomatoes.jpg',
    'Carrots': '/produce/carrots.jpg',
    'Potatoes': '/produce/potatoes.jpg',
    'Onions': '/produce/onions.jpg',
    'Green Chilies': '/produce/green-chilies.jpg',
    'Coriander': '/produce/coriander.jpg',
    'Brinjal (Eggplant)': '/produce/brinjal.jpg',
    'Ladies Finger (Okra)': '/produce/ladies-finger.jpg',
    'Green Banana (kachha kela)': '/produce/green-banana.jpg',
    'Raw Banana (kachha kela)': '/produce/green-banana.jpg',
    'raw banana': '/produce/green-banana.jpg',
    'mango': '/produce/mango.jpg',
    'Mango': '/produce/mango.jpg',
    'munagaku': '/uploads/24e862ea-975e-422b-bd4d-8fbae9aa90c1-mungaku.jpeg',
    'drumstick leaves': '/uploads/24e862ea-975e-422b-bd4d-8fbae9aa90c1-mungaku.jpeg',
    'munaga aaku': '/uploads/24e862ea-975e-422b-bd4d-8fbae9aa90c1-mungaku.jpeg'
};

const itemsWithSlowImages = db.prepare("SELECT * FROM items WHERE image LIKE '%pollinations.ai%' OR image LIKE '%unsplash.com%' OR image IS NULL OR image = ''").all() as { id: string, name: string }[];

if (itemsWithSlowImages.length > 0) {
    const updateImage = db.prepare("UPDATE items SET image = ? WHERE id = ?");
    const updateTransaction = db.transaction((items) => {
        for (const item of items) {
            const localImg = produceImageMap[item.name];
            if (localImg) {
                updateImage.run(localImg, item.id);
            }
        }
    });
    updateTransaction(itemsWithSlowImages);
}



initDb();

export { dbPath };
export default db;
