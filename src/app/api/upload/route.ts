import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file received' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Generate a safe, unique filename (strip non-alphanumeric chars)
    const ext = path.extname(file.name).toLowerCase();
    const safeName = file.name
      .replace(ext, '')
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .substring(0, 50);
    const filename = `${Date.now()}-${safeName}${ext}`;
    const uploadDir = path.join(process.cwd(), 'public/photos');
    
    // Ensure the directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filepath = path.join(uploadDir, filename);
    fs.writeFileSync(filepath, buffer);

    // Return the URL for the client to use
    return NextResponse.json({ url: `/photos/${filename}` });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
