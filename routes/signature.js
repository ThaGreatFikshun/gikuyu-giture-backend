// signature.js
const axios = require("axios");
const crypto = require("crypto");

const privateKeyString = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC3TPA96yKx0q+Q69c6zIMsga/QIiMxi/N6zbBrsuBK2CLJp1cjpp8Dpin1UCz+UpAdreOO03lwXrvnTlKjf2TdUqoG+EJUDgK016GKNsFTv/vJ+L7Nc65V7BUf+yfX7nufa22ol3jLGpwR9OSDNpdk4vGjIgu3nc3t7RoTJqR7eA1b1t7Rhh84iKDgJz1vyRHvVxTD5gXZUADzDHr91CVoYxgJZsk/W2VLp4LY+TybD5MaebteVzooaqc2Ppl1+Hg7MyYBx1lj+PEfTvT/MmWpBYOnd1NEO//K9pwddIMm6iru//RgZpUGaaARmBp+r6XPDPOdieh+fLdj/j4hHC65AgMBAAECggEAUw3SgUvMgaREFrc145eNDBqLDhSZu7Z9ETSn7nSzelYqlRJ0wluaC2477sJwUKAaWshSpoGdsdPK8kij2x87FamCDvxoGWvrwANAV77tpEQGE4LY+YCkCpyZCc+kQwv1CcwEePKBMg4Rj3VWIToYKQdHk7I2evFOwLLBMNI+jw6VqQEdhQ7D3m0eWX6MASdqS6/ybtSxvEC4kPwy9mVuqkArch87fnJEmjNLMpVyQNZ4gUVpwUnWJQ8jnO85IS/Z1n5LyNKpA4cEEm7iQ9zgUySdxfCJPRI5DWrcnlE7SajB2bSB80/yNYgAjgPJiTBNwVHJFfgPzSoHuGd8eHM43QKBgQD1tbq3FVC5FjwJaMwZvzmq+FWX3hkDlgj7YtDVZH7jFgH7W6eJ7EySSLlHyAQ6NcltFjEz+npW4KHvvdgeKf+qbQJAqy8Jw5aIzQ9BfGst4VqSaXGZfo7UGjZCgVIlOirbeln5X93+BaSk0E0h9yvU+MAF5Q40wIFolbGsuy7BEwKBgQC++h1f9+XWKXacvKtp5sqHlfUUzR4rpNq3yZckS97BKj3SAodPI1n5EaxhWC2U5ej4UbNO357bK0E5O5A/7d2NhAymnp6SP3D0XX/lSC4f+i229+EgyaNb4oMs3Y9mW2fjpXUPM90faJ2vsSfevE+oyYugIBSLoqeU9atZHMFWgwKBgQCjZ3gEyeglLuQ+XbNebA2t5fkGRm3cNKtEgzLetzarTreCsjF5R+ykXDjbw+kLzTlnkpqmNq2lmT4YceiIJuYgMN6Oo0lk9O3njHfY1SVyHaxeMkGaEtBpvgTXtakrmMNnsrajYV4A0T/tW5nwPLCpscQCJ5KLAnsNUoAWn2U4gQKBgBDR3nxxTODLzhKH22D8XqIKZwdp+VpGrqy5KIKd3ASPP9qbNmeV6XqyP8hjB8Cxbw9PwscTkt4itR/hSxcWUAkCtEqIddbTl5MuGPGMpeNTGWuf8Uf9+lFBZeQxr0uIiWHXVLP+EV+OyzSKGcTYOPvYpF9589VIghHwgSLcEXsZAoGAdhkxKWtsISICD2LmyK3lsxdukuPGGDi1vOKyArWImMmOnpvuV28DG40B/z/Thp6vUg+ONbuG28VbpvevmpuXUhsnJlria2RbVz3oXKsE914TlhT9WZXMgyOvKCjjG0+jsk5hn/n6TU7Yn/G6Ll0N7tTzrik8QJsCTTCu0lhsAu0=
-----END PRIVATE KEY-----`;

function generateSignature(rawText) {
  try {
    const privateKey = crypto.createPrivateKey({
      key: privateKeyString,
      format: "pem",
      type: "pkcs8",
    });

    const sign = crypto.createSign("RSA-SHA256");
    sign.update(rawText);
    sign.end();

    return sign.sign(privateKey, "base64");
  } catch (error) {
    console.error("Error generating signature:", error);
    throw new Error("Failed to generate signature:", "${error.message}");
  }
}

module.exports = { generateSignature };
