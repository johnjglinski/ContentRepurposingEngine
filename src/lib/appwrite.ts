import { Client, Functions, Account, Databases } from 'node-appwrite';

// Appwrite configuration
const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';

// Check if Appwrite is properly configured
export const isAppwriteConfigured = () => {
  return !!(
    APPWRITE_PROJECT_ID &&
    APPWRITE_PROJECT_ID !== 'your-project-id-here' &&
    APPWRITE_ENDPOINT
  );
};

// Initialize Appwrite client (only if configured)
const client = isAppwriteConfigured()
  ? new Client()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID)
  : null;

// Initialize Appwrite services (null-safe)
export const functions = client ? new Functions(client) : null;
export const account = client ? new Account(client) : null;
export const databases = client ? new Databases(client) : null;

// Function IDs
export const FUNCTION_IDS = {
  GENERATE_POSTS: 'generate-posts',
  SEND_EMAIL: 'send-email',
  WEBHOOKS_STRIPE: 'webhooks-stripe',
  CREATE_CHECKOUT_SESSION: 'create-checkout-session'
};

// Helper function to execute Appwrite function
export async function executeFunction(functionId: string, data: any = {}) {
  if (!functions) {
    throw new Error('Appwrite is not configured. Set NEXT_PUBLIC_APPWRITE_PROJECT_ID in your environment.');
  }

  try {
    const response = await functions.createExecution(
      functionId,
      JSON.stringify(data),
      false // async: false for synchronous execution
    );

    if ('exitCode' in response && Number(response.exitCode) !== 0) {
      throw new Error(`Function execution failed with exit code ${response.exitCode}`);
    }

    const output = String(('stdout' in response && response.stdout) || ('response' in response && (response as any).response) || '');
    if (!output) throw new Error('Empty function response');
    return JSON.parse(output);
  } catch (error) {
    console.error(`Error executing function ${functionId}:`, error);
    throw error;
  }
}

export { client };
