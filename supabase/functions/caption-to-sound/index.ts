import Replicate from "https://esm.sh/replicate@^0.20.1";
import { corsHeaders } from "../_shared/cors.ts";

const replicate = new Replicate({
  auth: Deno.env.get("REPLICATE_API_TOKEN"),
});

const model =
  "sepal/audiogen:154b3e5141493cb1b8cec976d9aa90f2b691137e39ad906d2421b74c2a8c52b8";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  const { caption } = await req.json();

  const input = {
    prompt: caption,
    duration: 3,
    top_k: 250,
    top_p: 0,
    temperature: 1,
    classifier_free_guidance: 3,
    output_format: "mp3",
  };

  const output = await replicate.run(model, { input });

  return new Response(JSON.stringify({ output }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
