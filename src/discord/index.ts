import { env } from "#env";
import { setupCreators } from "@constatic/base";
import { DodoPayments } from "dodopayments";

export const { createCommand, createEvent, createResponder } = setupCreators();

export const client = new DodoPayments({
  bearerToken: env.DODO_PAYMENT_API_KEY,
  environment: "test_mode",
});
