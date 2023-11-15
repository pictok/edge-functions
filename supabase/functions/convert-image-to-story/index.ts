import { corsHeaders } from "../_shared/cors.ts";
import OpenAI from "https://esm.sh/openai";

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  const { image } = await req.json();
  const response = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    max_tokens: 300,

    messages: [
      {
        role: "user",
        //@ts-ignore
        content: [
          {
            type: "text",
            text:
              "Please identify all objects, discern the gender of any person present, recognize weather conditions, pinpoint the location if identifiable, and describe any observable motion within the image. Condense findings into a single, succinct sentence, avoiding the use of 'This image shows.'",
          },
          {
            type: "image_url",
            image_url: image, // base64 images
          },
        ],
      },
    ],
  });
  return new Response(
    JSON.stringify({
      output: response.choices[0].message.content,
      test: "test",
    }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});
