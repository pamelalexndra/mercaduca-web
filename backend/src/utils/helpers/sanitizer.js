import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

export const sanitizeInput = (input) => {
  if (typeof input !== "string") return input;
  return DOMPurify.sanitize(input.trim(), { ALLOWED_TAGS: [] });
};