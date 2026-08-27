import assert from "node:assert/strict";
import test from "node:test";
import {
  isAllowedMediaContentType,
  sanitizeMediaPath,
  secureMediaHeaders,
  trustedUploadProxyUrl,
} from "../src/lib/property-media-security.ts";

test("canonicalizes trusted PropertyArk upload URLs", () => {
  assert.equal(
    trustedUploadProxyUrl(
      "https://propertyark-backend.onrender.com/uploads/kyc/My%20ID.pdf",
      "kyc",
    ),
    "/api/kyc-media/kyc/My%20ID.pdf",
  );
  assert.equal(
    trustedUploadProxyUrl("/uploads/listings/front door.jpg", "property"),
    "/api/property-media/listings/front%20door.jpg",
  );
  assert.equal(
    trustedUploadProxyUrl(
      "http://propertyark-backend.onrender.com/uploads/legacy/front.jpg",
      "property",
    ),
    "/api/property-media/legacy/front.jpg",
  );
});

test("rejects untrusted URL forms instead of passing them through", () => {
  for (const value of [
    "https://example.com/uploads/id.pdf",
    "http://example.com/uploads/id.pdf",
    "https://propertyark-backend.onrender.com:444/uploads/id.pdf",
    "https://user:pass@propertyark-backend.onrender.com/uploads/id.pdf",
    "https://propertyark-backend.onrender.com/uploads/id.pdf?token=secret",
    "//propertyark-backend.onrender.com/uploads/id.pdf",
    "javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "/admin/users",
  ]) {
    assert.equal(trustedUploadProxyUrl(value, "kyc"), null, value);
  }
  assert.equal(
    trustedUploadProxyUrl("/api/kyc-media/identity/id.jpg", "property"),
    null,
  );
  assert.equal(
    trustedUploadProxyUrl("/api/property-media/listing/front.jpg", "kyc"),
    null,
  );
});

test("rejects traversal, separators, malformed escapes, and control characters", () => {
  for (const path of [
    ["..", "secret"],
    ["%2e%2e", "secret"],
    ["%252e%252e", "secret"],
    ["folder%2Fsecret"],
    ["folder%252Fsecret"],
    ["folder%5Csecret"],
    ["bad%"],
    ["file%00.jpg"],
  ]) {
    assert.equal(sanitizeMediaPath(path), null, path.join("/"));
  }
  assert.deepEqual(sanitizeMediaPath(["listing", "front door.jpg"]), [
    "listing",
    "front%20door.jpg",
  ]);
});

test("allows only passive media types for each proxy purpose", () => {
  assert.equal(isAllowedMediaContentType("image/jpeg", "property"), true);
  assert.equal(isAllowedMediaContentType("video/mp4", "property"), true);
  assert.equal(isAllowedMediaContentType("application/pdf", "kyc"), true);
  assert.equal(isAllowedMediaContentType("text/html", "kyc"), false);
  assert.equal(isAllowedMediaContentType("image/svg+xml", "property"), false);
  assert.equal(isAllowedMediaContentType(null, "property"), false);
});

test("sets hardened public and private response headers", () => {
  const upstream = new Headers({ "content-type": "application/pdf" });
  const kycHeaders = secureMediaHeaders(upstream, "kyc");
  assert.equal(kycHeaders.get("cache-control"), "private, no-store, max-age=0");
  assert.equal(kycHeaders.get("x-content-type-options"), "nosniff");
  assert.equal(kycHeaders.get("cross-origin-resource-policy"), "same-origin");
  assert.match(kycHeaders.get("content-security-policy") ?? "", /sandbox/);

  const propertyHeaders = secureMediaHeaders(upstream, "property");
  assert.equal(propertyHeaders.get("cache-control"), "public, max-age=3600");
});
