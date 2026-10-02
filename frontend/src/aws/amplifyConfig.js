// AWS Amplify Configuration Provider for CampusRoom
// Reads from Vite environment variables or falls back to simulated endpoints

export const awsConfig = {
  aws_project_region: import.meta.env.VITE_AWS_REGION || "us-east-1",
  aws_cognito_identity_pool_id: import.meta.env.VITE_AWS_COGNITO_IDENTITY_POOL_ID || "us-east-1:mock-identity-pool-campusroom",
  aws_cognito_region: import.meta.env.VITE_AWS_REGION || "us-east-1",
  aws_user_pools_id: import.meta.env.VITE_AWS_USER_POOLS_ID || "us-east-1_CampusRoomPool",
  aws_user_pools_web_client_id: import.meta.env.VITE_AWS_USER_POOLS_CLIENT_ID || "campusroomclient123456",
  aws_appsync_graphqlEndpoint: import.meta.env.VITE_AWS_APPSYNC_GRAPHQL_ENDPOINT || "https://mock-appsync-api.appsync-api.us-east-1.amazonaws.com/graphql",
  aws_appsync_region: import.meta.env.VITE_AWS_REGION || "us-east-1",
  aws_appsync_authenticationType: "AMAZON_COGNITO_USER_POOLS",
  aws_user_files_s3_bucket: import.meta.env.VITE_AWS_S3_BUCKET || "campusroom-room-images-prod",
  aws_user_files_s3_bucket_region: import.meta.env.VITE_AWS_REGION || "us-east-1",
  isConfiguredWithLiveAws: Boolean(
    import.meta.env.VITE_AWS_USER_POOLS_ID &&
    import.meta.env.VITE_AWS_APPSYNC_GRAPHQL_ENDPOINT
  ),
};

export default awsConfig;
