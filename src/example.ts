import { makeAICall, startAIServer } from './make_call';

/**
 * Example usage of the AI calling functions
 */
async function example() {
    try {
        // Start the AI server first
        console.log('🚀 Starting AI server...');
        await startAIServer();
        
        // Wait a moment for server to be ready
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Make an AI call
        console.log('📞 Making AI call...');
        const callResult = await makeAICall();
        
        console.log('✅ AI call initiated successfully!');
        console.log('Call details:', {
            sid: callResult.sid,
            status: callResult.status,
            from: callResult.from,
            to: callResult.to
        });
        
    } catch (error) {
        console.error('❌ Error in example:', error);
    }
}

// Run the example if this file is executed directly
if (require.main === module) {
    example();
}

export { example }; 