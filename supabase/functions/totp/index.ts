// supabase/functions/totp/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { authenticator } from "https://esm.sh/otplib@12.0.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation constants
const MAX_CODE_LENGTH = 10;
const VALID_ACTIONS = ['generate', 'verify', 'validate', 'disable'];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase configuration");
    return new Response(JSON.stringify({ error: "Service temporarily unavailable" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 503,
    });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: req.headers.get("Authorization") || "" } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const body = await req.json().catch(() => ({}));
    const action = typeof body.action === 'string' ? body.action : undefined;

    // Validate action
    if (action && !VALID_ACTIONS.includes(action)) {
      return new Response(JSON.stringify({ error: "Invalid action" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (action === "generate") {
      const secret = authenticator.generateSecret();
      const issuer = "Calmora";
      const label = `${issuer}:${user.email ?? user.id}`;
      const otpauthUrl = authenticator.keyuri(label, issuer, secret);

      // generate 8 backup codes
      const backup_codes = Array.from({ length: 8 }, () => crypto.randomUUID().replace(/-/g, "").slice(0, 10));

      // upsert secret (disabled until verified)
      const { error: upsertError } = await supabase
        .from("user_2fa")
        .upsert({ user_id: user.id, secret, is_enabled: false, backup_codes })
        .eq("user_id", user.id);

      if (upsertError) {
        console.error("Error saving 2FA setup");
        return new Response(JSON.stringify({ error: "Unable to setup 2FA" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }

      return new Response(JSON.stringify({ otpauthUrl, backup_codes }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (action === "verify") {
      const code = typeof body.code === 'string' ? body.code.trim().slice(0, MAX_CODE_LENGTH) : "";
      if (!code) {
        return new Response(JSON.stringify({ error: "Code required" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }

      const { data: row, error } = await supabase
        .from("user_2fa")
        .select("id, secret, is_enabled")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching 2FA data");
        return new Response(JSON.stringify({ error: "Unable to verify" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }
      if (!row) {
        return new Response(JSON.stringify({ error: "No 2FA setup found" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }

      const isValid = authenticator.check(code, row.secret);
      if (!isValid) {
        return new Response(JSON.stringify({ valid: false }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      const { error: updateError } = await supabase
        .from("user_2fa")
        .update({ is_enabled: true })
        .eq("user_id", user.id);
      
      if (updateError) {
        console.error("Error enabling 2FA");
        return new Response(JSON.stringify({ error: "Unable to enable 2FA" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }

      return new Response(JSON.stringify({ valid: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (action === "validate") {
      const code = typeof body.code === 'string' ? body.code.trim().slice(0, MAX_CODE_LENGTH) : "";
      if (!code) {
        return new Response(JSON.stringify({ error: "Code required" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }

      const { data: row, error } = await supabase
        .from("user_2fa")
        .select("secret, is_enabled")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching 2FA data");
        return new Response(JSON.stringify({ error: "Unable to validate" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }
      if (!row || !row.is_enabled) {
        return new Response(JSON.stringify({ enabled: false, valid: false }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      const valid = authenticator.check(code, row.secret);
      return new Response(JSON.stringify({ enabled: true, valid }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (action === "disable") {
      const { error: delError } = await supabase
        .from("user_2fa")
        .delete()
        .eq("user_id", user.id);
      
      if (delError) {
        console.error("Error disabling 2FA");
        return new Response(JSON.stringify({ error: "Unable to disable 2FA" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }
      
      return new Response(JSON.stringify({ disabled: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // default: fetch current status
    const { data: status, error: stErr } = await supabase
      .from("user_2fa")
      .select("is_enabled")
      .eq("user_id", user.id)
      .maybeSingle();
    
    if (stErr) {
      console.error("Error fetching 2FA status");
      return new Response(JSON.stringify({ error: "Unable to fetch status" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    return new Response(JSON.stringify({ is_enabled: status?.is_enabled ?? false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    console.error("TOTP function error");
    return new Response(JSON.stringify({ error: "Unable to process request" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
