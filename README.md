## Introduction 
[GitHub](https://github.com/entest-hai/cognito-sdk-js) this shows how to use aws cognito for authentication and authorization. 
- cognito user pool for authentication
- cognito identity pool for authorization
- get credentials and create s3 client 


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
npm i @aws-sdk/client-cognito-identity-provider,
npm i @aws-sdk/client-s3,
npm i @aws-sdk/credential-providers,
npm i @aws-sdk/s3-request-presigner,
```

## Cognito 

sign in (an user already setup and confirmed)
```tsx
const cognitoClient = new CognitoIdentityProviderClient({
  region: config.REGION
})

export const signIn = async (username: string, password: string) => {
  try {
    const response = await cognitoClient.send(
      new InitiateAuthCommand(
        {
          AuthFlow: "USER_PASSWORD_AUTH",
          AuthParameters: {
            "USERNAME": username,
            "PASSWORD": password
          },
          ClientId: config.CLIENT_ID
        }
      )
    )
    console.log('cognito auth: ', response)
    return response
  } catch (error) {
    console.log(error)
    return null
  }
}

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
       [config.COGNITO_POOL_ID]: idToken
     }
   })
 })
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


