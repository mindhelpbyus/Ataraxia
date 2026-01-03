/**
 * JWT Verification Test Script
 * 
 * Use this to test if your backend is generating valid JWTs
 * 
 * Usage:
 *   1. Get JWT from your backend
 *   2. node test-jwt-verification.js "YOUR_JWT_HERE"
 */

const jwt = require('jsonwebtoken');

// Jitsi server configuration (must match your server!)
const JITSI_CONFIG = {
  app_id: 'bedrock-video-conferencing',
  app_secret: 'demo-jitsi-secret-key-for-testing',
  domain: 'meet.bedrockhealthsolutions.com'
};

// Get JWT from command line
const token = process.argv[2];

if (!token) {
  console.error('❌ Error: No JWT provided');
  console.log('');
  console.log('Usage: node test-jwt-verification.js "YOUR_JWT_HERE"');
  console.log('');
  console.log('Get JWT from:');
  console.log('  1. Run "🚀 Test with Real Backend" in the app');
  console.log('  2. Copy JWT from console output');
  console.log('  3. Run this script with the JWT');
  process.exit(1);
}

console.log('');
console.log('═══════════════════════════════════════════════════════');
console.log('🔍 JWT VERIFICATION TEST');
console.log('═══════════════════════════════════════════════════════');
console.log('');
console.log('📋 Jitsi Server Config:');
console.log('   app_id:', JITSI_CONFIG.app_id);
console.log('   app_secret:', JITSI_CONFIG.app_secret);
console.log('   domain:', JITSI_CONFIG.domain);
console.log('');

// Decode without verification
console.log('🔓 Decoding JWT (no verification)...');
try {
  const decoded = jwt.decode(token, { complete: true });
  
  if (!decoded) {
    throw new Error('Invalid JWT format');
  }
  
  console.log('');
  console.log('📋 Header:');
  console.log(JSON.stringify(decoded.header, null, 2));
  console.log('');
  console.log('📋 Payload:');
  console.log(JSON.stringify(decoded.payload, null, 2));
  console.log('');
  
  // Validate fields
  console.log('🔍 Field Validation:');
  console.log('');
  
  const p = decoded.payload;
  const errors = [];
  const warnings = [];
  
  // Check algorithm
  if (decoded.header.alg !== 'HS256') {
    errors.push(`❌ Algorithm: ${decoded.header.alg} (should be HS256)`);
  } else {
    console.log('   ✅ Algorithm: HS256');
  }
  
  // Check audience
  if (p.aud !== 'jitsi') {
    errors.push(`❌ Audience (aud): "${p.aud}" (should be "jitsi")`);
  } else {
    console.log('   ✅ Audience: jitsi');
  }
  
  // Check issuer
  if (p.iss !== JITSI_CONFIG.app_id) {
    errors.push(`❌ Issuer (iss): "${p.iss}" (should be "${JITSI_CONFIG.app_id}")`);
  } else {
    console.log('   ✅ Issuer:', JITSI_CONFIG.app_id);
  }
  
  // Check subject
  if (p.sub !== JITSI_CONFIG.domain) {
    warnings.push(`⚠️  Subject (sub): "${p.sub}" (should be "${JITSI_CONFIG.domain}")`);
  } else {
    console.log('   ✅ Subject:', JITSI_CONFIG.domain);
  }
  
  // Check room
  if (!p.room) {
    errors.push('❌ Room: missing');
  } else if (p.room === '*') {
    warnings.push('⚠️  Room: "*" (wildcard may cause issues)');
  } else {
    console.log('   ✅ Room:', p.room);
  }
  
  // Check moderator
  const isModerator = p.moderator === true || p.context?.user?.moderator === true;
  if (isModerator) {
    console.log('   ✅ Moderator: true');
  } else {
    console.log('   ℹ️  Moderator: false (participant)');
  }
  
  // Check expiration
  if (p.exp) {
    const expiresAt = new Date(p.exp * 1000);
    const now = new Date();
    const isExpired = now >= expiresAt;
    
    if (isExpired) {
      errors.push(`❌ Expired: ${expiresAt.toISOString()}`);
    } else {
      const timeLeft = Math.floor((expiresAt - now) / 1000 / 60);
      console.log(`   ✅ Expires: ${expiresAt.toLocaleString()} (${timeLeft} minutes left)`);
    }
  } else {
    warnings.push('⚠️  No expiration time (exp)');
  }
  
  console.log('');
  
  // Show errors/warnings
  if (errors.length > 0) {
    console.log('❌ ERRORS FOUND:');
    errors.forEach(err => console.log('   ' + err));
    console.log('');
  }
  
  if (warnings.length > 0) {
    console.log('⚠️  WARNINGS:');
    warnings.forEach(warn => console.log('   ' + warn));
    console.log('');
  }
  
  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ All fields look good!');
    console.log('');
  }
  
} catch (err) {
  console.error('❌ Failed to decode JWT:', err.message);
  process.exit(1);
}

// Verify signature
console.log('🔐 Verifying JWT signature with Jitsi secret...');
console.log('');

try {
  const verified = jwt.verify(token, JITSI_CONFIG.app_secret, {
    algorithms: ['HS256'],
    audience: 'jitsi',
    issuer: JITSI_CONFIG.app_id
  });
  
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('✅ ✅ ✅ SIGNATURE VALID! ✅ ✅ ✅');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
  console.log('🎉 This JWT is correctly signed!');
  console.log('   ✅ Secret matches: ' + JITSI_CONFIG.app_secret);
  console.log('   ✅ Algorithm: HS256');
  console.log('   ✅ Issuer matches: ' + JITSI_CONFIG.app_id);
  console.log('   ✅ Jitsi server WILL accept this token');
  console.log('');
  console.log('✨ You can use this JWT with Jitsi!');
  console.log('');
  
} catch (err) {
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('❌ ❌ ❌ SIGNATURE INVALID! ❌ ❌ ❌');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
  console.log('❌ Verification failed:', err.message);
  console.log('');
  console.log('🔧 Possible causes:');
  console.log('   1. JWT not signed with correct secret');
  console.log('      Backend should use: "' + JITSI_CONFIG.app_secret + '"');
  console.log('');
  console.log('   2. Wrong algorithm (not HS256)');
  console.log('      Backend should use: jwt.sign(payload, secret, { algorithm: "HS256" })');
  console.log('');
  console.log('   3. Issuer mismatch');
  console.log('      JWT iss should be: "' + JITSI_CONFIG.app_id + '"');
  console.log('');
  console.log('   4. JWT is expired');
  console.log('      Generate a new JWT from backend');
  console.log('');
  console.log('🔧 Backend code should look like:');
  console.log('');
  console.log('   const jwt = require("jsonwebtoken");');
  console.log('');
  console.log('   const payload = {');
  console.log('     aud: "jitsi",');
  console.log('     iss: "' + JITSI_CONFIG.app_id + '",');
  console.log('     sub: "' + JITSI_CONFIG.domain + '",');
  console.log('     room: "room-name-here",');
  console.log('     moderator: true,');
  console.log('     // ... other fields');
  console.log('   };');
  console.log('');
  console.log('   const token = jwt.sign(');
  console.log('     payload,');
  console.log('     "' + JITSI_CONFIG.app_secret + '",  // ← SECRET');
  console.log('     { algorithm: "HS256" }');
  console.log('   );');
  console.log('');
  
  process.exit(1);
}

console.log('═══════════════════════════════════════════════════════');
console.log('');
