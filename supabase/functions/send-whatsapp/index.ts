import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface SendWhatsAppPayload {
  tenant_id: string;
  phone: string;
  message: string;
  message_type: string;
  os_id?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const payload: SendWhatsAppPayload = await req.json();

    // Credenciais vêm dos Secrets — nunca do banco
    const EVOLUTION_URL = Deno.env.get('EVOLUTION_API_URL');
    const EVOLUTION_KEY = Deno.env.get('EVOLUTION_API_KEY');
    const EVOLUTION_INSTANCE = Deno.env.get('EVOLUTION_INSTANCE_NAME');

    if (!EVOLUTION_URL || !EVOLUTION_KEY || !EVOLUTION_INSTANCE) {
      return new Response(
        JSON.stringify({ error: 'Evolution API não configurada no servidor' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const formattedPhone = formatPhone(payload.phone);

    const result = await sendEvolution({
      apiUrl: EVOLUTION_URL,
      apiKey: EVOLUTION_KEY,
      instanceName: EVOLUTION_INSTANCE,
      phone: formattedPhone,
      message: payload.message,
    });

    // Registrar no log
    try {
      await supabase.from('whatsapp_logs').insert({
        tenant_id: payload.tenant_id,
        os_id: payload.os_id || null,
        customer_phone: formattedPhone,
        message_type: payload.message_type,
        message_content: payload.message,
        status: result.success ? 'sent' : 'failed',
        provider: 'evolution',
        error_message: result.error || null,
      });
    } catch (_) {
      // Log falhou mas não bloqueia o envio
    }

    return new Response(
      JSON.stringify({ success: result.success, error: result.error }),
      {
        status: result.success ? 200 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('55') && digits.length === 13) return digits;
  if (digits.length === 11) return `55${digits}`;
  if (digits.length === 10) return `55${digits.slice(0, 2)}9${digits.slice(2)}`;
  return digits;
}

async function sendEvolution(params: {
  apiUrl: string;
  apiKey: string;
  instanceName: string;
  phone: string;
  message: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `${params.apiUrl}/message/sendText/${params.instanceName}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': params.apiKey,
        },
        body: JSON.stringify({
          number: params.phone,
          text: params.message,
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      return { success: false, error: `Evolution API ${response.status}: ${errorBody}` };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
