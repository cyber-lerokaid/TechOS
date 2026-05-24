const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://eudqoegvgqiomtwqzmwk.supabase.co',
  'sb_publishable_vh9hoP2GkvkBSie2GQYM4g_JCwMjSsc'
);

async function test() {
  const { data, error } = await supabase.from('ordens_de_servico').select('*').limit(1);
  if (data && data.length > 0) {
    console.log("Columns:", Object.keys(data[0]));
  } else {
    console.log("No rows found. Error:", error);
    // If no rows, let's insert a completely empty object just to see what fails
    const { error: err } = await supabase.from('ordens_de_servico').insert([{}]);
    console.log("Empty insert error:", err);
  }
}

test();
