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
  //@ generating a narrative story
  const storyResponse = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    max_tokens: 400,

    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "You are an AI trained to describe images in a simple yet detailed manner, suitable for a first grader. Upon receiving an image, your task is to create a story about the image within 60 words. Remember to focus on the key elements in the image and describe them in a way that a first grader and visually impaired individuals would understand. ",
          },
          {
            type: "image_url",
            image_url: image, // base64 images
          },
        ],
      },
    ],
  });

  //@ generating a caption based on the previous story
  const captionResponse = await openai.chat.completions.create({
    model: "gpt-4",
    max_tokens: 100,
    temperature: 0.7,
    messages: [
      {
        role: "system",
        content:
          "You are an AI trained to identify the crucial keywords from a story. Your task is to describe the sounds that these keywords might have in real life. Combine these keywords and their corresponding sounds into a single sentence in the format ‘Keyword (Sound)’, where ‘Sound’ should be an onomatopoeic representation of the sound that the keyword makes.",
      },
      { role: "user", content: storyResponse.choices[0].message.content },
    ],
  });

  return new Response(
    JSON.stringify({
      story: storyResponse.choices[0].message.content,
      caption: captionResponse.choices[0].message.content,
    }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
});
