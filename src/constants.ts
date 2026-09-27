import constantsJson from "../constants.json" with { type: "json" };

declare global {
  const constants: typeof constantsJson;
  const required: true;
}
Object.assign(
  globalThis,
  Object.freeze({
    constants: constantsJson,
    required: true,
  }),
);
