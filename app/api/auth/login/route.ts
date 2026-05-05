import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Supabase Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const hasSupabaseKeys = supabaseUrl.length > 0 && supabaseKey.length > 0;
const supabase = hasSupabaseKeys ? createClient(supabaseUrl, supabaseKey) : null;

// Fallback JSON DB location
const DB_FILE = path.join(process.cwd(), 'database.json');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, role } = body;

    if (!email || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (supabase) {
      // ---------------------------------------------------------
      // SUPABASE DATABASE LOGIC
      // ---------------------------------------------------------
      
      // 1. Check if user exists in the 'users' table
      let { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      // If user doesn't exist, insert them
      if (!user) {
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert([{ email, role }])
          .select()
          .single();
          
        if (insertError) throw insertError;
        user = newUser;
      }

      // 2. Log the active session in the 'logins' table
      const { error: logError } = await supabase
        .from('logins')
        .insert([{
          user_id: user.id,
          email: user.email,
          role: role,
          ip_address: request.headers.get('x-forwarded-for') || '127.0.0.1'
        }]);

      if (logError) throw logError;

      return NextResponse.json({ success: true, user, message: 'User stored in Live Supabase Database!' }, { status: 200 });

    } else {
      // ---------------------------------------------------------
      // FALLBACK LOCAL JSON LOGIC (If keys aren't added yet)
      // ---------------------------------------------------------
      if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], logins: [] }, null, 2));
      }

      const dbData = fs.readFileSync(DB_FILE, 'utf-8');
      const db = JSON.parse(dbData);

      let user = db.users.find((u: any) => u.email === email);
      if (!user) {
        user = {
          id: `usr_${Date.now().toString(36)}`,
          email,
          role,
          createdAt: new Date().toISOString(),
        };
        db.users.push(user);
      }

      const loginEvent = {
        id: `log_${Date.now().toString(36)}`,
        userId: user.id,
        email: user.email,
        role: role,
        timestamp: new Date().toISOString(),
        ip: request.headers.get('x-forwarded-for') || '127.0.0.1',
      };
      db.logins.push(loginEvent);

      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));

      return NextResponse.json({ success: true, user, message: 'Saved to local JSON fallback. (Supabase keys missing)' }, { status: 200 });
    }

  } catch (error: any) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: error.message || 'Database error occurred. Have you created the tables?' }, { status: 500 });
  }
}
