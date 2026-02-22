// This is a Supabase Edge Function
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req) => {
  try {
    // Only allow requests with a valid secret (you should set this in your environment)
    const authorization = req.headers.get('Authorization');
    if (authorization !== `Bearer ${Deno.env.get('CLEANUP_SECRET')}`) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Delete expired short URLs
    const { error, count } = await supabase
      .from('short_urls')
      .delete({ count: 'exact' })
      .lt('expires_at', new Date().toISOString());
    
    if (error) throw error;
    
    return new Response(
      JSON.stringify({ success: true, message: `Deleted ${count} expired links` }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}); 