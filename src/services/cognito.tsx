import { config } from './../../config'
import { CognitoIdentityProviderClient, InitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider'
import { S3Client, ListObjectsCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

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

export const signout = () => {
  console.log('sign out')
}


export const listObjects = async (idToken: string) => {
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
}


export const getS3Object = async (idToken: string, key: string) => {

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

  const command = new GetObjectCommand({
    Bucket: config.BUCKET,
    Key: key
  })

  const signUrl = await getSignedUrl(s3Client, command)

  return signUrl;
};
