// Mocks all files ending in `.vue` showing them as plain Vue instances
declare module '*.vue' {
  import { ComponentOptions } from 'vue';
  const component: ComponentOptions;
  export default component;
}

declare module '@aws-sdk/client-cognito-identity';
declare module '@aws-sdk/credential-provider-cognito-identity';
