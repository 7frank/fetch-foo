console.log("Hello via Bun!");
//https://www.npmjs.com/package/zod-request

// "ts-pattern" package example

import { match } from "ts-pattern";
import { z, ZodSchema } from "zod";

function $get<Z extends ZodSchema>(
  schema: Z,
  ...args: Parameters<typeof fetch>
): Promise<Z> {
  return fetch(...args)
    .then((r) => r.json())
    .then(schema.parse);
}

const Pokemon = z.object({
  name: z.string(),
  url: z.string(),
});
type Pokemon = z.infer<typeof Pokemon>;

const res = $get(Pokemon, "api.pokemon.com");

match(res).when(
  (s) => s,
  () => {
    console.log("foo");
  }
);
