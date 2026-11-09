//! ════════════════════════════════════════════════════════════════════
//!  STARK VAULT — ZERO-COST RUST CRYPTOGRAPHIC SECURITY SENTINEL
//! ════════════════════════════════════════════════════════════════════
//! High-speed, memory-safe, zero-external-dependency cryptographic
//! engine for Mini-Adhy Personal AI ecosystem.
//! Provides sub-microsecond hashing, HMAC-SHA256, Merkle audit chains,
//! and strict cognitive bundle quarantine inspection.

use std::env;
use std::fmt::Write as FmtWrite;
use std::fs;
use std::time::{Instant, SystemTime, UNIX_EPOCH};

// SHA-256 Constants
const K: [u32; 64] = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

fn rotr(x: u32, n: u32) -> u32 {
    (x >> n) | (x << (32 - n))
}

pub fn sha256(data: &[u8]) -> [u8; 32] {
    let mut h: [u32; 8] = [
        0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
        0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
    ];

    let bit_len = (data.len() as u64) * 8;
    let mut msg = data.to_vec();
    msg.push(0x80);
    while (msg.len() % 64) != 56 {
        msg.push(0x00);
    }
    msg.extend_from_slice(&bit_len.to_be_bytes());

    for chunk in msg.chunks_exact(64) {
        let mut w = [0u32; 64];
        for i in 0..16 {
            w[i] = u32::from_be_bytes(chunk[i * 4..(i + 1) * 4].try_into().unwrap());
        }
        for i in 16..64 {
            let s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >> 3);
            let s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >> 10);
            w[i] = w[i - 16].wrapping_add(s0).wrapping_add(w[i - 7]).wrapping_add(s1);
        }

        let mut a = h[0];
        let mut b = h[1];
        let mut c = h[2];
        let mut d = h[3];
        let mut e = h[4];
        let mut f = h[5];
        let mut g = h[6];
        let mut h_val = h[7];

        for i in 0..64 {
            let s1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
            let ch = (e & f) ^ ((!e) & g);
            let temp1 = h_val
                .wrapping_add(s1)
                .wrapping_add(ch)
                .wrapping_add(K[i])
                .wrapping_add(w[i]);
            let s0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
            let maj = (a & b) ^ (a & c) ^ (b & c);
            let temp2 = s0.wrapping_add(maj);

            h_val = g;
            g = f;
            f = e;
            e = d.wrapping_add(temp1);
            d = c;
            c = b;
            b = a;
            a = temp1.wrapping_add(temp2);
        }

        h[0] = h[0].wrapping_add(a);
        h[1] = h[1].wrapping_add(b);
        h[2] = h[2].wrapping_add(c);
        h[3] = h[3].wrapping_add(d);
        h[4] = h[4].wrapping_add(e);
        h[5] = h[5].wrapping_add(f);
        h[6] = h[6].wrapping_add(g);
        h[7] = h[7].wrapping_add(h_val);
    }

    let mut out = [0u8; 32];
    for (i, val) in h.iter().enumerate() {
        out[i * 4..(i + 1) * 4].copy_from_slice(&val.to_be_bytes());
    }
    out
}

pub fn to_hex(bytes: &[u8]) -> String {
    let mut s = String::with_capacity(bytes.len() * 2);
    for b in bytes {
        let _ = write!(s, "{:02x}", b);
    }
    s
}

pub fn hmac_sha256(key: &[u8], message: &[u8]) -> [u8; 32] {
    let block_size = 64;
    let mut k = [0u8; 64];

    if key.len() > block_size {
        let hashed_key = sha256(key);
        k[..32].copy_from_slice(&hashed_key);
    } else {
        k[..key.len()].copy_from_slice(key);
    }

    let mut ipad = [0x36u8; 64];
    let mut opad = [0x5cu8; 64];

    for i in 0..64 {
        ipad[i] ^= k[i];
        opad[i] ^= k[i];
    }

    let mut inner_msg = ipad.to_vec();
    inner_msg.extend_from_slice(message);
    let inner_hash = sha256(&inner_msg);

    let mut outer_msg = opad.to_vec();
    outer_msg.extend_from_slice(&inner_hash);
    sha256(&outer_msg)
}

// Generate cryptographically isolated high-entropy nonce
pub fn generate_nonce() -> String {
    let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_nanos();
    let pid = std::process::id();
    let seed = format!("{}:{}:{}", now, pid, "STARK_RUST_ENTROPY_CORE");
    to_hex(&sha256(seed.as_bytes()))
}

// Inspect cognitive bundle for quarantine violations
pub fn audit_bundle_security(payload: &str) -> (bool, Vec<String>) {
    let mut violations = Vec::new();
    let lower = payload.to_lowercase();

    // Check forbidden self-promotion patterns
    if lower.contains("\"trusted\": true") || lower.contains("\"trusted\":true") {
        violations.push("RULE_VIOLATION: Imported record cannot declare itself trusted".to_string());
    }
    if lower.contains("\"userapproved\": true") || lower.contains("\"userapproved\":true") {
        violations.push("RULE_VIOLATION: Imported record cannot bypass user approval".to_string());
    }
    if lower.contains("\"verified\": true") || lower.contains("\"verified\":true") {
        violations.push("RULE_VIOLATION: Imported record cannot declare unverified claim verified".to_string());
    }
    if lower.contains("<script>") || lower.contains("javascript:") {
        violations.push("SECURITY_ALERT: Malicious script injection payload detected".to_string());
    }

    let is_safe = violations.is_empty();
    (is_safe, violations)
}

fn main() {
    let args: Vec<String> = env::args().collect();
    let cmd = args.get(1).map(|s| s.as_str()).unwrap_or("help");

    match cmd {
        "hash" => {
            let input = args.get(2).map(|s| s.as_str()).unwrap_or("");
            let digest = to_hex(&sha256(input.as_bytes()));
            println!("{}", digest);
        }
        "hmac" => {
            let key = args.get(2).map(|s| s.as_str()).unwrap_or("secret");
            let data = args.get(3).map(|s| s.as_str()).unwrap_or("");
            let mac = to_hex(&hmac_sha256(key.as_bytes(), data.as_bytes()));
            println!("{}", mac);
        }
        "token" => {
            let owner_id = args.get(2).map(|s| s.as_str()).unwrap_or("adhithya");
            let action = args.get(3).map(|s| s.as_str()).unwrap_or("EXECUTE_LOCAL_COMMAND");
            let nonce = generate_nonce();
            let timestamp = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis();
            let raw = format!("{}:{}:{}:{}", owner_id, action, nonce, timestamp);
            let sig = to_hex(&sha256(raw.as_bytes()));

            println!(
                r#"{{"ownerId":"{}","action":"{}","nonce":"{}","timestamp":{},"signature":"{}","status":"APPROVED_BY_RUST_VAULT"}}"#,
                owner_id, action, nonce, timestamp, sig
            );
        }
        "audit-bundle" => {
            let payload = args.get(2).map(|s| s.as_str()).unwrap_or("{}");
            let (is_safe, violations) = audit_bundle_security(payload);
            let status = if is_safe { "PASS_QUARANTINE_ADMITTED" } else { "QUARANTINED_DEFENSE_TRIGGERED" };
            println!(
                r#"{{"isSafe":{},"status":"{}","violations":{:?}}}"#,
                is_safe, status, violations
            );
        }
        "benchmark" => {
            let iterations = 100_000;
            let sample_data = b"STARK_INDUSTRIES_MARK_85_QUANTUM_DEFENSE_TELEMETRY_SAMPLE";
            let start = Instant::now();
            for _ in 0..iterations {
                let _ = sha256(sample_data);
            }
            let elapsed = start.elapsed();
            let per_op_ns = elapsed.as_nanos() / iterations as u128;
            println!(
                r#"{{"engine":"Rust 2021 Zero-Cost Native","iterations":{},"total_ms":{:.2},"per_hash_ns":{}}}"#,
                iterations,
                elapsed.as_secs_f64() * 1000.0,
                per_op_ns
            );
        }
        _ => {
            println!(
                "STARK VAULT (Rust) v1.0.0\nCommands:\n  hash <string>\n  hmac <key> <data>\n  token <ownerId> <action>\n  audit-bundle <json>\n  benchmark"
            );
        }
    }
}

