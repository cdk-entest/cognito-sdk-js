---
title: Cognito SDK JavaScript
description: cognito sdk js for authentication and authorization
author: haimtran
publishedDate: 14/09/2022
date: 2022-09-14
---

## Introduction

[GitHub](https://github.com/entest-hai/cognito-sdk-js) this shows how to use aws cognito for authentication and authorization.

- cognito user pool for authentication
- cognito identity pool for authorization
- get credentials and create s3 client

<LinkedImage
  href="https://youtu.be/K84hInX226Q"
  height={400}
  alt="Cognito SDK JavaScript"
  src="/thumbnail/cognito-sdk-js.png"
/>

## Setup Backend 
setup CORS rule for a bucket 
```tsx
const bucket = new aws_s3.Bucket(this, 'CognitoDemoBucket', {
  bucketName: `cognito-demo-bucket-${this.account}-1`,
  removalPolicy: RemovalPolicy.DESTROY,
  // so webapp runnning local host can access s3
  cors: [
    {
      allowedHeaders: ['*'],
      allowedMethods: [
        aws_s3.HttpMethods.GET,
        aws_s3.HttpMethods.PUT,
        aws_s3.HttpMethods.DELETE,
        aws_s3.HttpMethods.POST
      ],
      allowedOrigins: ['*'],
      exposedHeaders: [
        'x-amz-server-side-encryption',
        'x-amz-request-id',
        'x-amz-id-2',
        'ETag'
      ],
      maxAge: 3000
    }
  ]
})
```

user pool 

```tsx
const userPool = new aws_cognito.UserPool(this, 'UserPoolDemo', {
  userPoolName: 'UserPoolDemo',
  selfSignUpEnabled: true,
  signInAliases: {
    email: true
  },
  autoVerify: {
    email: true
  },
  removalPolicy: RemovalPolicy.DESTROY
})

const client = userPool.addClient('NextJsWebAppClient', {
  authFlows: {
    userPassword: true,
    adminUserPassword: true,
    custom: true,
    userSrp: true
  },
  userPoolClientName: 'WebAppClient'
})
```

associate userpool with an identity pool 
```tsx
const identityPool = new IdentityPool(this, 'IdentityPoolDemo', {
  identityPoolName: 'IdentityPoolDemo',
  authenticationProviders: {
    userPools: [
      new UserPoolAuthenticationProvider({
        userPool,
        userPoolClient: client
      })
    ]
  }
})
```

grant read write s3 permission to the identity pool 

```tsx
 bucket.grantReadWrite(identityPool.authenticatedRole)
 bucket.grantRead(identityPool.authenticatedRole)
```

## Setup NextJS and AWS SDK

create a new nextjs project

```bash
npx create-next-app@latest --typescript
```

install dependencies

```bash
npm i @chakra-ui/react @emotion/react @emotion/styled framer-motion react-icons @chakra-ui/icons
```

install aws sdk clients (v3)

```bash
npm i @aws-sdk/client-cognito-identity-provider @aws-sdk/client-s3 @aws-sdk/credential-providers @aws-sdk/s3-request-presigner
```

## Cognito

sign up a new account

```tsx
export const signUp = async (username: string, password: string) => {
  try {
    const response = await cognitoClient.send(
      new SignUpCommand({
        ClientId: config.CLIENT_ID,
        Username: username,
        Password: password,
      })
    );
    console.log(response);
  } catch (error) {
    console.log(error);
  }
};
```

then confirm sign up. The issue is how to redirect after success confirmed

```tsx
export const confirm = async (username: string, code: string) => {
  try {
    const response = await cognitoClient.send(
      new ConfirmSignUpCommand({
        ClientId: config.CLIENT_ID,
        ConfirmationCode: code,
        Username: username,
      })
    );
    console.log(response);
  } catch (error) {
    console.log(error);
  }
};
```

sign in (an user already setup and confirmed)

```tsx
const cognitoClient = new CognitoIdentityProviderClient({
  region: config.REGION,
});

export const signIn = async (username: string, password: string) => {
  try {
    const response = await cognitoClient.send(
      new InitiateAuthCommand({
        AuthFlow: "USER_PASSWORD_AUTH",
        AuthParameters: {
          USERNAME: username,
          PASSWORD: password,
        },
        ClientId: config.CLIENT_ID,
      })
    );
    console.log("cognito auth: ", response);
    return response;
  } catch (error) {
    console.log(error);
    return null;
  }
};
```

TODO: sign up (Amplify is faster here)

TODO: confirmation (Amplify is faster here)

## S3 Client

credentials and s3 client

```tsx
const s3Client = new S3Client({
  region: config.REGION,
  credentials: fromCognitoIdentityPool({
    clientConfig: { region: config.REGION },
    identityPoolId: config.IDENTITY_POOL_ID,
    logins: {
      [config.COGNITO_POOL_ID]: idToken,
    },
  }),
});
```

list objects

```bash
const command = new ListObjectsCommand({
  Bucket: config.BUCKET,
  Prefix: "public/",
})

try {
  const result = await s3Client.send(command)
  console.log('s3 list: ', result)
  return result['Contents']
} catch (error) {
  console.log(error)
  return []
}
```

set signed url object

```bash
const command = new GetObjectCommand({
  Bucket: config.BUCKET,
  Key: key
})
const signUrl = await getSignedUrl(s3Client, command)
```
