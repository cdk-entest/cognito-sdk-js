import { config } from './../../config'
import {
  S3Client,
  ListObjectsCommand,
  GetObjectCommand
} from '@aws-sdk/client-s3'
import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

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
    Prefix: 'public/'
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

  return signUrl
}
