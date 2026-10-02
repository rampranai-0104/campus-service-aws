import 'react-native-get-random-values';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';
import outputs from '../amplify_outputs.json';

let isConfigured = false;
let apiClient: any = null;

export const configureAmplify = () => {
  if (!isConfigured) {
    try {
      Amplify.configure(outputs);
      isConfigured = true;
      console.log('[AmplifyService] Amplify Gen 2 configured successfully for mobile.');
    } catch (err) {
      console.error('[AmplifyService] Failed to configure Amplify:', err);
    }
  }
};

// Initialize configuration on module evaluation
configureAmplify();

export const getApiClient = (): any => {
  if (!apiClient) {
    apiClient = generateClient();
  }
  return apiClient;
};
