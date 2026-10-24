import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.29.0';

serve(async (req) => {
  try {
    const payload = await req.json();
    const record = payload.record;
    const oldRecord = payload.old_record;

  // Only trigger if current_status actually changed
    if (oldRecord && record.current_status === oldRecord.current_status) {
      return new Response(JSON.stringify({message: 'No status change detected'}), { 
        headers: { 'Content-Type': 'application/json' },
        status: 200 
      });
    }

  // Connect to Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all push tokens for the pantry
    const { data: subscribers, error } = await supabase
      .from('pantry_favorites')
      .select('push_token')
      .eq('pantry_id', record.id);

      if (error || !subscribers || subscribers.length === 0) {
        return new Response(JSON.stringify({message: 'No subscribers found for this pantry' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 200
        });
      }

      const statusLabels: Record<string, string> = {
        green: 'Fully stocked',
        orange: 'Low stock',
        red: 'Empty'
      };

    // Format messages for Expo Push API
      const messages = subscribers.map((sub) => ({
        to: sub.push_token,
        sound: 'default',
        title: `${record.name} Updated!`,
        body: `Status is now: ${statusLabels[record.current_status] || record.current_status}`,
        data: { pantryId: record.id },
      }));

      // Send notifications to Expo
      const expoResponse = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(messages),
      });
    
      const resData = await expoResponse.json();

      return new Response(JSON.stringify({ success: true, count: messages.length, resData}), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      });
    }
  });