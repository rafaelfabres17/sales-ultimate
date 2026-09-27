import { validateEnv } from "@constatic/base";
import { z } from "zod";
import "./constants.js";

export const env = await validateEnv(
  z.looseObject({
    BOT_TOKEN: z.string("Discord Bot Token is required").min(1),
    WEBHOOK_LOGS_URL: z.url().optional(),
    GUILD_ID: z.string().optional(),
    FIREBASE_PATH: z.string("Firebase account path is required").min(1),
    DODO_PAYMENT_API_KEY: z.string("Dodo payment api key is required").min(1),
  }),
);
