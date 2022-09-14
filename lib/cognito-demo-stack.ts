import {
  Stack,
  StackProps,
  aws_s3,
  RemovalPolicy,
  aws_cognito,
  CfnOutput
} from 'aws-cdk-lib'
import { Construct } from 'constructs'
import {
  IdentityPool,
  UserPoolAuthenticationProvider
} from '@aws-cdk/aws-cognito-identitypool-alpha'

export class CognitoDemoStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props)

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

    // this identity pool can access s3
    bucket.grantReadWrite(identityPool.authenticatedRole)
    bucket.grantRead(identityPool.authenticatedRole)

    // output

    new CfnOutput(this, 'CognitoPoolId', {
      exportName: 'CognitoPoolId',
      value: userPool.userPoolId
    })

    new CfnOutput(this, 'IdentityPoolId', {
      exportName: 'IdentityPoolId',
      value: identityPool.identityPoolId
    })
  }
}
