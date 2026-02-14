// test-lightning.mjs - Improved error handling
import { authenticatedLndGrpc, getWalletInfo } from 'ln-service';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

// Setup __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

console.log('🔍 Lightning Node Test');
console.log('=====================\n');
console.log('Current directory:', __dirname);

async function testLightningConnection() {
  // Check environment variables
  console.log('\n📋 Environment Variables:');
  console.log(`LND_CERT_BASE64: ${process.env.LND_CERT_BASE64 ? '✅ Present (length: ' + process.env.LND_CERT_BASE64.length + ')' : '❌ Missing'}`);
  console.log(`LND_MACAROON_BASE64: ${process.env.LND_MACAROON_BASE64 ? '✅ Present (length: ' + process.env.LND_MACAROON_BASE64.length + ')' : '❌ Missing'}`);
  console.log(`LND_SOCKET: ${process.env.LND_SOCKET || 'localhost:10009 (default)'}`);

  if (!process.env.LND_CERT_BASE64 || !process.env.LND_MACAROON_BASE64) {
    console.log('\n❌ Missing required environment variables!');
    return;
  }

  try {
    console.log('\n🔄 Connecting to LND at', process.env.LND_SOCKET || 'localhost:10009');
    
    // Log first few characters to verify format (but hide most for security)
    const certPreview = process.env.LND_CERT_BASE64.substring(0, 20) + '...';
    const macaroonPreview = process.env.LND_MACAROON_BASE64.substring(0, 20) + '...';
    console.log('   Cert starts with:', certPreview);
    console.log('   Macaroon starts with:', macaroonPreview);
    
    const { lnd } = authenticatedLndGrpc({
      cert: process.env.LND_CERT_BASE64,
      macaroon: process.env.LND_MACAROON_BASE64,
      socket: process.env.LND_SOCKET || 'localhost:10009'
    });

    console.log('✅ Connection object created');
    
    console.log('\n🔄 Fetching node information...');
    const info = await getWalletInfo({ lnd });
    
    console.log('\n✅ SUCCESS! Connected to Lightning Node:');
    console.log('======================================');
    console.log(` Public Key: ${info.public_key}`);
    console.log(` Alias: ${info.alias || 'Not set'}`);
    console.log(`  Network: ${info.chains?.[0]?.network || 'Unknown'}`);
    console.log(` Balance: ${info.balance || 0} sats`);
    console.log(` Active Peers: ${info.num_peers || 0}`);
    console.log(` Active Channels: ${info.num_active_channels || 0}`);
    console.log(` Version: ${info.version || 'Unknown'}`);
    
  } catch (error) {
    console.error('\n Connection Failed!');
    console.error('==================');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Full error:', error);
    
    if (error.message && error.message.includes('connect')) {
      console.error('\n Troubleshooting:');
      console.error('1. Is LND running?');
      console.error('   Run: lnd --lnddir ~/.lnd &');
      console.error('2. Check if LND is unlocked:');
      console.error('   Run: lncli --lnddir ~/.lnd --network=testnet unlock');
      console.error('3. Verify the socket address is correct');
    } else if (error.message && error.message.includes('macaroon')) {
      console.error('\n Troubleshooting:');
      console.error('1. Macaroon might be invalid');
      console.error('2. Check if you copied the full base64 string');
      console.error('3. Regenerate macaroon if needed');
    } else if (error.message && error.message.includes('cert')) {
      console.error('\n Troubleshooting:');
      console.error('1. TLS certificate might be invalid');
      console.error('2. Check if certificate is base64 encoded correctly');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n Troubleshooting:');
      console.error('1. LND is not running or not accessible at that port');
      console.error('2. Run: lnd --lnddir ~/.lnd &');
      console.error('3. Check if port 10009 is open');
    } else if (error.code === 'UNIMPLEMENTED') {
      console.error('\n Troubleshooting:');
      console.error('1. This might be a gRPC version mismatch');
      console.error('2. Try restarting LND');
    }
  }
}

// Also check if LND is actually running
import { exec } from 'child_process';

console.log('\n Checking if LND process is running...');
exec('pgrep -f "lnd.*lnddir"', (error, stdout, stderr) => {
  if (stdout) {
    console.log(' LND is running (PID:', stdout.trim(), ')');
  } else {
    console.log(' LND process not found');
    console.log('   Start LND with: lnd --lnddir ~/.lnd &');
  }
  
  // Run the main test
  testLightningConnection();
});
