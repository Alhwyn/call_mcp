#!/usr/bin/env node

import { makeAICall, startAIServer } from './make_call';

/**
 * CLI interface for making AI calls
 */
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    switch (command) {
        case 'call':
            await handleCall(args.slice(1));
            break;
        case 'server':
            await handleServer(args.slice(1));
            break;
        case 'help':
        case '--help':
        case '-h':
            showHelp();
            break;
        default:
            console.log('❌ Unknown command. Use "help" to see available commands.');
            process.exit(1);
    }
}

async function handleCall(args: string[]) {
    const toNumber = args[0];
    const fromNumber = args[1];
    const serverUrl = args[2];

    try {
        console.log('🤖 Making AI call...');
        const callResult = await makeAICall(toNumber, fromNumber, serverUrl);
        
        console.log('✅ AI call initiated successfully!');
        console.log(`📞 Call SID: ${callResult.sid}`);
        console.log(`📱 Status: ${callResult.status}`);
        console.log(`📞 From: ${callResult.from}`);
        console.log(`📞 To: ${callResult.to}`);
        
    } catch (error) {
        console.error('❌ Error making AI call:', error);
        process.exit(1);
    }
}

async function handleServer(args: string[]) {
    const port = args[0] ? parseInt(args[0], 10) : undefined;
    
    try {
        console.log('🚀 Starting AI server...');
        await startAIServer(port);
        
        // Keep the server running
        process.on('SIGINT', () => {
            console.log('\n👋 Shutting down server...');
            process.exit(0);
        });
        
    } catch (error) {
        console.error('❌ Error starting server:', error);
        process.exit(1);
    }
}

function showHelp() {
    console.log(`
🤖 AI Call CLI

Usage:
  node cli.js <command> [options]

Commands:
  call [toNumber] [fromNumber] [serverUrl]  Make an AI call
  server [port]                             Start the AI server
  help                                      Show this help message

Examples:
  # Make a call using environment variables
  node cli.js call

  # Make a call to a specific number
  node cli.js call +1234567890

  # Start server on port 8080
  node cli.js server 8080

Environment Variables:
  TWILIO_ACCOUNT_SID     Your Twilio Account SID
  TWILIO_AUTH_TOKEN      Your Twilio Auth Token
  TWILIO_PHONE_NUMBER    Your Twilio phone number
  TO_PHONE_NUMBER        Default number to call
  OPENAI_API_KEY         Your OpenAI API key
  PORT                   Server port (default: 5050)
`);
}

// Run the CLI if this file is executed directly
if (require.main === module) {
    main().catch((error) => {
        console.error('❌ CLI Error:', error);
        process.exit(1);
    });
}

export { main }; 