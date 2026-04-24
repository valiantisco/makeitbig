import {
  mkdir,
  readFile,
  writeFile,
  access,
  stat,
  unlink,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";
import {
  COMMON_ART_DIRECTION,
  DEFAULT_IMAGE_FORMAT,
  DEFAULT_IMAGE_MODEL,
  DEFAULT_IMAGE_QUALITY,
  HOME_IMAGE_SLOTS,
  MARKETING_PAGE_IMAGE_SLOTS,
  RESOURCE_PAGE_IMAGE_SLOTS,
  SITE_IMAGE_SPECS,
} from "./site-image-plan.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const outputDir = path.join(projectRoot, "public", "images", "site");
const registryPath = path.join(projectRoot, "src", "content", "siteImages.ts");

const { loadEnvConfig } = nextEnv;
loadEnvConfig(projectRoot);

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const force = args.has("--force");
const limitArg = process.argv
  .slice(2)
  .find((arg) => arg.startsWith("--limit="));
const onlyArg = process.argv
  .slice(2)
  .find((arg) => arg.startsWith("--only="));
const limitValue = limitArg ? Number.parseInt(limitArg.split("=")[1] ?? "", 10) : undefined;
const onlyValue = onlyArg ? (onlyArg.split("=")[1] ?? "").trim() : undefined;

function log(message) {
  console.log(`[generate:site-images] ${message}`);
}

function escapeString(value) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function maskApiKeyPrefix(apiKey) {
  const trimmed = apiKey.trim();
  if (!trimmed) return "(missing)";
  const prefixLength = trimmed.startsWith("sk-proj-") ? 18 : 12;
  return `${trimmed.slice(0, prefixLength)}...`;
}

function validateArgs() {
  if (limitValue !== undefined) {
    if (!Number.isFinite(limitValue) || limitValue < 1) {
      throw new Error("--limit must be a positive integer.");
    }
  }

  if (onlyValue) {
    const match = SITE_IMAGE_SPECS.find((spec) => spec.key === onlyValue);
    if (!match) {
      const availableKeys = SITE_IMAGE_SPECS.map((spec) => spec.key).join(", ");
      throw new Error(`Unknown --only key "${onlyValue}". Available keys: ${availableKeys}`);
    }
  }
}

function selectSpecs() {
  let specs = SITE_IMAGE_SPECS;

  if (onlyValue) {
    specs = specs.filter((spec) => spec.key === onlyValue);
  }

  if (limitValue !== undefined) {
    specs = specs.slice(0, limitValue);
  }

  return specs;
}

function buildPrompt(spec) {
  return [
    COMMON_ART_DIRECTION,
    `Scene: ${spec.prompt}`,
    "Composition notes: realistic editorial photography, restrained styling, premium print materials, and no visible readable text anywhere in frame.",
  ].join("\n\n");
}

async function generateImage(spec, apiKey) {
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DEFAULT_IMAGE_MODEL,
      prompt: buildPrompt(spec),
      size: spec.size,
      quality: DEFAULT_IMAGE_QUALITY,
      output_format: DEFAULT_IMAGE_FORMAT,
      background: "opaque",
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    const message =
      payload?.error?.message ||
      `Image API request failed with status ${response.status}.`;
    const error = new Error(message);
    error.status = response.status;
    error.code = payload?.error?.code ?? null;
    throw error;
  }

  const base64 = payload?.data?.[0]?.b64_json;
  if (!base64) {
    throw new Error(`No image data returned for ${spec.key}.`);
  }

  return {
    buffer: Buffer.from(base64, "base64"),
    responseId:
      payload?.id ??
      response.headers.get("x-request-id") ??
      response.headers.get("openai-request-id") ??
      null,
    responseModel: payload?.model ?? DEFAULT_IMAGE_MODEL,
  };
}

function shouldAbortForApiError(error) {
  const status = error?.status;
  const code = String(error?.code ?? "").toLowerCase();

  if (status === 429) {
    return true;
  }

  return [
    "insufficient_quota",
    "rate_limit_exceeded",
    "billing_hard_limit_reached",
    "billing_not_active",
  ].includes(code);
}

async function confirmSavedImage(filePath) {
  const fileStats = await stat(filePath);
  return fileStats.isFile() && fileStats.size > 10 * 1024;
}

async function buildRegistryEntries() {
  const entries = [];

  for (const spec of SITE_IMAGE_SPECS) {
    const filePath = path.join(outputDir, spec.filename);
    const status = (await exists(filePath)) ? "ready" : "planned";

    entries.push({
      key: spec.key,
      src: `/images/site/${spec.filename}`,
      alt: spec.alt,
      width: spec.width,
      height: spec.height,
      usage: spec.usage,
      status,
    });
  }

  return entries;
}

function renderRecord(record) {
  return JSON.stringify(record, null, 2);
}

function renderRegistryFile(entries) {
  const siteImagesObject = entries
    .map(
      (entry) => `  ${entry.key}: {
    key: "${escapeString(entry.key)}",
    src: "${escapeString(entry.src)}",
    alt: "${escapeString(entry.alt)}",
    width: ${entry.width},
    height: ${entry.height},
    usage: "${escapeString(entry.usage)}",
    status: "${entry.status}",
  },`,
    )
    .join("\n");

  const filenames = [...new Set(SITE_IMAGE_SPECS.map((spec) => spec.filename))]
    .map((filename) => `  "${escapeString(filename)}",`)
    .join("\n");

  return `export type SiteImageEntry = {
  key: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  usage: string;
  status: "planned" | "ready";
};

export type SiteImageKey = keyof typeof siteImages;

export type PageImageSlots = {
  hero?: SiteImageKey;
  section?: SiteImageKey;
  accent?: SiteImageKey;
};

export const siteImages = {
${siteImagesObject}
} as const satisfies Record<string, SiteImageEntry>;

export const homeImageSlots = ${renderRecord(HOME_IMAGE_SLOTS)} as const satisfies Record<string, SiteImageKey>;

export const marketingPageImageSlots = ${renderRecord(
    MARKETING_PAGE_IMAGE_SLOTS,
  )} as const satisfies Record<string, PageImageSlots>;

export const resourcePageImageSlots = ${renderRecord(
    RESOURCE_PAGE_IMAGE_SLOTS,
  )} as const satisfies Record<string, PageImageSlots>;

export function getSiteImage(key: SiteImageKey) {
  return siteImages[key];
}

export function getMarketingPageImageSlots(slug: string): PageImageSlots | undefined {
  return marketingPageImageSlots[
    slug as keyof typeof marketingPageImageSlots
  ] as PageImageSlots | undefined;
}

export function getResourcePageImageSlots(slug: string): PageImageSlots | undefined {
  return resourcePageImageSlots[
    slug as keyof typeof resourcePageImageSlots
  ] as PageImageSlots | undefined;
}

export const siteImageFilenamesToGenerate = [
${filenames}
];
`;
}

async function maybeWriteRegistry() {
  const entries = await buildRegistryEntries();
  const nextContent = renderRegistryFile(entries);

  if (dryRun) {
    log(`dry-run: would update ${path.relative(projectRoot, registryPath)}`);
    return;
  }

  let previous = "";
  if (await exists(registryPath)) {
    previous = await readFile(registryPath, "utf8");
  }

  if (previous === nextContent) {
    log("registry is already up to date");
    return;
  }

  await writeFile(registryPath, nextContent, "utf8");
  log(`updated ${path.relative(projectRoot, registryPath)}`);
}

async function main() {
  validateArgs();

  const selectedSpecs = selectSpecs();

  log(`mode: ${dryRun ? "dry-run" : "generate"}`);
  log(`force overwrite: ${force ? "yes" : "no"}`);
  log(`limit: ${limitValue ?? "none"}`);
  log(`only: ${onlyValue || "none"}`);
  log(`selected assets: ${selectedSpecs.length}`);

  await mkdir(outputDir, { recursive: true });

  if (!dryRun && !process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required unless --dry-run is used.");
  }

  if (!dryRun) {
    log(`api key prefix: ${maskApiKeyPrefix(process.env.OPENAI_API_KEY)}`);
  }

  const summary = {
    generated: 0,
    skipped: 0,
    failed: 0,
    attempted: 0,
  };

  for (const spec of selectedSpecs) {
    summary.attempted += 1;
    const relativeTarget = path.join("public", "images", "site", spec.filename);
    const filePath = path.join(outputDir, spec.filename);
    const alreadyExists = await exists(filePath);

    if (alreadyExists && !force) {
      log(`skip ${spec.key} -> ${relativeTarget} (already exists)`);
      summary.skipped += 1;
      continue;
    }

    if (dryRun) {
      log(
        `${alreadyExists ? "would overwrite" : "would generate"} ${spec.key} -> ${relativeTarget}`,
      );
      continue;
    }

    try {
      log(`generating ${spec.key} -> ${relativeTarget}`);
      const result = await generateImage(spec, process.env.OPENAI_API_KEY);
      log(
        `openai response ${spec.key}: id=${result.responseId ?? "unknown"} model=${result.responseModel}`,
      );
      await writeFile(filePath, result.buffer);

      if (await confirmSavedImage(filePath)) {
        log(`saved ${relativeTarget}`);
        summary.generated += 1;
      } else {
        await unlink(filePath).catch(() => undefined);
        summary.failed += 1;
        log(`failed ${spec.key} -> ${relativeTarget} (file missing or too small after write)`);
      }
    } catch (error) {
      summary.failed += 1;
      log(`failed ${spec.key} -> ${relativeTarget} (${error.message})`);

      if (shouldAbortForApiError(error)) {
        log("stopping early because of billing or rate-limit error");
        break;
      }
    }
  }

  await maybeWriteRegistry();
  log(
    `summary: generated=${summary.generated} skipped=${summary.skipped} failed=${summary.failed} total attempted=${summary.attempted}`,
  );
  log("done");
}

main().catch((error) => {
  console.error(`[generate:site-images] failed: ${error.message}`);
  process.exitCode = 1;
});
