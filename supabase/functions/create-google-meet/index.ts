// supabase/functions/create-google-meet/index.ts

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Initialize a temporary client just to get the user's session
    // This uses the user's JWT from the Authorization header
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // 2. Get the user session to extract the Google provider token
    const { data: { session }, error: sessionError } = await userClient.auth.getSession();
    if (sessionError || !session) {
      throw new Error('Authentication failed: Could not resolve user session.');
    }
    if (!session.provider_token) {
      throw new Error('Google provider token is missing from session. Please re-authenticate with Google.');
    }
    
    const googleAccessToken = session.provider_token;

    // 3. Parse the incoming request body
    const body = await req.json();
    const { appointmentId, title, description, startTime, endTime, attendees } = body;
    if (!appointmentId || !title || !startTime || !endTime) {
        throw new Error("Invalid request body: Missing required fields.");
    }

    // 4. Create the Google Calendar event object
    const event = {
      summary: title,
      description,
      start: { dateTime: new Date(startTime).toISOString(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
      end: { dateTime: new Date(endTime).toISOString(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
      attendees: attendees?.map((email: string) => ({ email })) || [],
      conferenceData: {
        createRequest: {
          requestId: `sb-meet-${crypto.randomUUID()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    };

    // 5. Call the Google Calendar API using the user's provider token
    const googleResponse = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1",
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${googleAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    );

    const eventData = await googleResponse.json();
    if (!googleResponse.ok) {
      console.error("Google API Error:", eventData.error);
      throw new Error(eventData.error?.message || 'Request to Google Calendar API failed.');
    }

    const meetLink = eventData.hangoutLink;
    if (!meetLink) {
      throw new Error("Calendar event created, but no Google Meet link was returned.");
    }

    // 6. **THE FINAL FIX**: Create a new Supabase client with admin privileges to update the database
    // This client uses the service_role key and is not dependent on the user's session
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // 7. Update the appointment in your database with the new Meet link
    const { error: updateError } = await adminClient
      .from('appointment')
      .update({ meet_link: meetLink })
      .eq('id', appointmentId);
      
    if (updateError) {
      console.error(`CRITICAL: Failed to update appointment ${appointmentId} with Meet link: ${updateError.message}`);
      throw new Error(`Failed to save the Meet link to the appointment: ${updateError.message}`);
    }

    // 8. Return the final successful response
    return new Response(JSON.stringify({ meetLink }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    console.error('An error occurred in the Edge Function:', message);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}

serve(handler);
