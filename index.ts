import { match, isMatching } from "ts-pattern";
import { z, ZodSchema } from "zod";

async function $get<Z extends ZodSchema>(
  schema: Z,
  ...args: Parameters<typeof fetch>
): Promise<{ type: "success"; data: Z } | { type: "error"; error: unknown }> {
  const [input, init] = args;
  try {
    return await fetch(input, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      ...init,
    })
      .then((r) => r.json())
      .then(schema.parse)
      .then((r) => ({ type: "success", data: r }));
  } catch (e) {
    return { type: "error", error: e };
  }
}

const Pokemon = z.object({
  name: z.string(),
  id: z.number(),
  height: z.number(),
  weight: z.number(),
  base_experience: z.number(),
  types: z.array(
    z.object({
      slot: z.number(),
      type: z.object({
        name: z.string(),
        url: z.string(),
      }),
    })
  ),
  abilities: z.array(
    z.object({
      ability: z.object({
        name: z.string(),
        url: z.string(),
      }),
      is_hidden: z.boolean(),
      slot: z.number(),
    })
  ),
  sprites: z.object({
    front_default: z.string().url().nullable(),
    back_default: z.string().url().nullable(),
    // Add other sprite fields as needed
  }),
});
type Pokemon = z.infer<typeof Pokemon>;
const res = await $get(Pokemon, "https://pokeapi.co/api/v2/pokemon/1");

function identity<T>(val: { type: "success"; data: T }): T {
  return val.data;
}

const mapMessage = (e: { type: "error"; error: Error }) => ({error:e.error.message});

const mapped = match(res)
  .with({ type: "success" }, identity)
  .with({ type: "error" }, mapMessage)
  .otherwise(() => ({ error: "unexpected" }));

console.log(mapped);

// The path can be either a local path or an url
imageToAscii(mapped, (err, converted) => {
    console.log(err || converted);
});
