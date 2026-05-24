import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface SendWhatsAppPayload {
  tenant_id: string;
  phone: string; // formato: 5592999999999
  message: string;
  message_type: string;
  os_id?: string;
}

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const payload: SendWhatsAppPayload = await req.json();

    // Buscar configurações do tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('whatsapp_provider, whatsapp_enabled, evolution_api_url, evolution_api_key, evolution_instance_name, zapi_instance_id, zapi_token, zapi_client_token')
      .eq('id', payload.tenant_id)
      .single();

    if (tenantError || !tenant) {
      return new Response(JSON.stringify({ error: 'Tenant não encontrado' }), { status: 404, headers: corsHeaders });
    }

    if (!tenant.whatsapp_enabled) {
      return new Response(JSON.stringify({ error: 'WhatsApp não configurado para este tenant' }), { status: 400, headers: corsHeaders });
    }

    // Formatar número: garantir formato 55XXXXXXXXXXX
    const formattedPhone = formatPhone(payload.phone);

    let result: { success: boolean; error?: string };

    if (tenant.whatsapp_provider === 'evolution') {
      result = await sendEvolution({
        apiUrl: tenant.evolution_api_url,
        apiKey: tenant.evolution_api_key,
        instanceName: tenant.evolution_instance_name,
        phone: formattedPhone,
        message: payload.message,
      });
    } else if (tenant.whatsapp_provider === 'zapi') {
      result = await sendZApi({
        instanceId: tenant.zapi_instance_id,
        token: tenant.zapi_token,
        clientToken: tenant.zapi_client_token,
        phone: formattedPhone,
        message: payload.message,
      });
    } else {
      return new Response(JSON.stringify({ error: 'Provider inválido' }), { status: 400, headers: corsHeaders });
    }

    // Registrar no log
    await supabase.from('whatsapp_logs').insert({
      tenant_id: payload.tenant_id,
      os_id: payload.os_id || null,
      customer_phone: formattedPhone,
      message_type: payload.message_type,
      message_content: payload.message,
      status: result.success ? 'sent' : 'failed',
      provider: tenant.whatsapp_provider,
      error_message: result.error || null,
    });

    return new Response(
      JSON.stringify({ success: result.success, error: result.error }),
      { status: result.success ? 200 : 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: corsHeaders });
  }
});

// ─── Helpers ────────────────────────────────────────────────

function formatPhone(phone: string): string {
  // Remove tudo que não é dígito
  const digits = phone.replace(/\D/g, '');
  // Se já começa com 55 e tem 13 dígitos, está certo
  if (digits.startsWith('55') && digits.length === 13) return digits;
  // Se tem 11 dígitos (com DDD), adiciona 55
  if (digits.length === 11) return `55${digits}`;
  // Se tem 10 dígitos (sem o 9), adiciona 55 e o 9
  if (digits.length === 10) return `55${digits.slice(0, 2)}9${digits.slice(2)}`;
  return digits;
}

// ─── Evolution API ───────────────────────────────────────────

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
      return { success: false, error: `Evolution API error ${response.status}: ${errorBody}` };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

// ─── Z-API ──────────────────────────────────────────────────

async function sendZApi(params: {
  instanceId: string;
  token: string;
  clientToken: string;
  phone: string;
  message: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `https://api.z-api.io/instances/${params.instanceId}/token/${params.token}/send-text`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Client-Token': params.clientToken,
        },
        body: JSON.stringify({
          phone: params.phone,
          message: params.message,
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      return { success: false, error: `Z-API error ${response.status}: ${errorBody}` };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
