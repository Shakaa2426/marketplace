import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Health check endpoint
app.get("/make-server-1aa54cf8/health", (c) => {
  return c.json({ status: "ok" });
});

// Run database migrations
app.post("/make-server-1aa54cf8/setup-database", async (c) => {
  try {
    console.log("Starting database setup...");

    // Create storage buckets
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    
    const productImagesBucketExists = buckets?.some(bucket => bucket.name === 'product-images');
    if (!productImagesBucketExists) {
      const { error: productBucketError } = await supabaseAdmin.storage.createBucket('product-images', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
      });
      if (productBucketError) {
        console.error("Error creating product-images bucket:", productBucketError);
      } else {
        console.log("Created product-images bucket");
      }
    }

    const avatarsBucketExists = buckets?.some(bucket => bucket.name === 'avatars');
    if (!avatarsBucketExists) {
      const { error: avatarBucketError } = await supabaseAdmin.storage.createBucket('avatars', {
        public: true,
        fileSizeLimit: 2097152, // 2MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
      });
      if (avatarBucketError) {
        console.error("Error creating avatars bucket:", avatarBucketError);
      } else {
        console.log("Created avatars bucket");
      }
    }

    return c.json({ 
      success: true, 
      message: "Database setup completed. Please run the SQL schema in Supabase SQL Editor." 
    });
  } catch (error) {
    console.error("Error setting up database:", error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, 500);
  }
});

// Create initial notification for new users
app.post("/make-server-1aa54cf8/create-welcome-notification", async (c) => {
  try {
    const { userId } = await c.req.json();
    
    if (!userId) {
      return c.json({ error: "userId is required" }, 400);
    }

    const { error } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'system',
        title: '¡Bienvenido al Marketplace UPEM!',
        message: 'Gracias por unirte a nuestra comunidad. Aquí podrás comprar y vender productos de segunda mano.',
        is_read: false
      });

    if (error) {
      console.error("Error creating welcome notification:", error);
      return c.json({ error: error.message }, 500);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Error in create-welcome-notification:", error);
    return c.json({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, 500);
  }
});

// Register endpoint - uses Admin API to auto-confirm email
app.post("/make-server-1aa54cf8/register", async (c) => {
  try {
    const { email, password, fullName, matricula } = await c.req.json();
    
    if (!email || !password || !fullName) {
      return c.json({ error: "Email, password, and full name are required" }, 400);
    }

    console.log(`Registering new user: ${email}`);

    // Create user with admin API and auto-confirm email
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: fullName,
        matricula: matricula || null,
      },
    });

    if (error) {
      console.error("Error creating user:", error);
      return c.json({ 
        error: error.message || "Error creating user" 
      }, 400);
    }

    console.log(`User created successfully: ${data.user.id}`);

    // Create welcome notification
    await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: data.user.id,
        type: 'system',
        title: '¡Bienvenido al Marketplace UPEM!',
        message: 'Gracias por unirte a nuestra comunidad. Aquí podrás comprar y vender productos de segunda mano.',
        is_read: false
      });

    return c.json({ 
      success: true,
      user: data.user 
    });
  } catch (error) {
    console.error("Error in register endpoint:", error);
    return c.json({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, 500);
  }
});

// Confirm user endpoint - auto-confirms email for users
app.post("/make-server-1aa54cf8/confirm-user", async (c) => {
  try {
    const { userId } = await c.req.json();
    
    if (!userId) {
      return c.json({ error: "userId is required" }, 400);
    }

    console.log(`Confirming user: ${userId}`);

    // Update user to be email confirmed
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { email_confirm: true }
    );

    if (error) {
      console.error("Error confirming user:", error);
      return c.json({ error: error.message }, 400);
    }

    console.log(`User confirmed successfully: ${userId}`);

    return c.json({ success: true });
  } catch (error) {
    console.error("Error in confirm-user endpoint:", error);
    return c.json({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, 500);
  }
});

Deno.serve(app.fetch);