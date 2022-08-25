// Global policy
import * as cdk from "@aws-cdk/core";
// Cognito libs
import * as cognito from "@aws-cdk/aws-cognito";
import {
	UserPool,
	UserPoolClientIdentityProvider,
	CfnIdentityPool,
} from "@aws-cdk/aws-cognito";
// IAM libs
import * as iam from "@aws-cdk/aws-iam";
import {
	FederatedPrincipal,
	PolicyDocument,
	User,
	Policy,
	ManagedPolicy,
	PolicyStatement,
} from "@aws-cdk/aws-iam";

// Interfaces for AWS Cognito
export interface CognitoStackProps extends cdk.Stack {
	org: string;
	environment: string;
	projectName: string;
}

// Cognito Objects
export class CognitoStack extends cdk.Stack {
	constructor(scope: cdk.Construct, id: string, props: CognitoStackProps) {
		super(scope, id);

		/* Cognito SNS Policy */
		const cognitoSnsRole = new iam.Role(this, "SNSRole", {
			assumedBy: new iam.ServicePrincipal("cognito-idp.amazonaws.com"),
		});

		const snsPolicy = new Policy(this, "CognitoSNSPolicy", {
			policyName: "CognitoSNSPolicy",
			roles: [cognitoSnsRole],
			statements: [
				new iam.PolicyStatement({
					effect: iam.Effect.ALLOW,
					actions: ["sns:publish"],
					resources: ["*"],
				}),
			],
		});

		/* Cognito User Pool */
		const userPool = new UserPool(this, "UserPool", {
			userPoolName: `${props.projectName}-UserPool`,
			selfSignUpEnabled: true,
			signInAliases: { email: true },
			standardAttributes: {
				email: {
					required: true,
					mutable: false,
				},
			},
			autoVerify: { email: true },
			passwordPolicy: {
				minLength: 8,
				requireLowercase: false,
				requireDigits: false,
				requireSymbols: false,
				requireUppercase: false,
			},
			userVerification: {
				emailSubject: "Your verification code",
				emailBody: "Here is your verification code: {####}",
				emailStyle: cognito.VerificationEmailStyle.CODE,
				smsMessage:
					"Your username is {username}, Your verification code is {####}",
			},
		});

		// /* User Pool Client */
		const userPoolClient = new cognito.UserPoolClient(this, "UserPoolClient", {
			userPoolClientName: `${props.projectName}-UserPoolClient`,
			generateSecret: false,
			userPool: userPool,
		});

		/* Identity Pool */
		const identityPool = new cognito.CfnIdentityPool(this, "IdentityPool", {
			identityPoolName: `${props.projectName}Identity`,
			allowUnauthenticatedIdentities: true,
			cognitoIdentityProviders: [
				{
					clientId: userPoolClient.userPoolClientId,
					providerName: userPool.userPoolProviderName,
				},
			],
		});

		/* Cognito Roles */
		/* Unauthorized Role/Policy */
		const unauthorizedRole = new iam.Role(this, "CognitoUnAuthorizedRole", {
			assumedBy: new iam.FederatedPrincipal(
				"cognito-identity.amazonaws.com",
				{
					StringEquals: {
						"cognito-identity.amazonaws.com:aud": identityPool.ref,
					},
					"ForAnyValue:StringLike": {
						"cognito-identity.amazonaws.com:amr": "unauthenticated",
					},
				},
				"sts:AssumeRoleWithWebIdentity"
			),
		});

		const cognitoUnauthorizedPolicy = new Policy(
			this,
			"CognitoUnauthorizedPolicy",
			{
				policyName: "CognitoUnauthorizedPolicy",
				roles: [unauthorizedRole],
				statements: [
					new iam.PolicyStatement({
						effect: iam.Effect.ALLOW,
						actions: ["mobileanalytics:PutEvents", "cognito-sync:*"],
						resources: ["*"],
					}),
				],
			}
		);
		/* Authorized Role/Policy */
		const authorizedRole = new iam.Role(this, "CognitoAuthorizedRole", {
			assumedBy: new iam.FederatedPrincipal(
				"cognito-identity.amazonaws.com",
				{
					StringEquals: {
						"cognito-identity.amazonaws.com:aud": identityPool.ref,
					},
					"ForAnyValue:StringLike": {
						"cognito-identity.amazonaws.com:amr": "authenticated",
					},
				},
				"sts:AssumeRoleWithWebIdentity"
			),
		});

		const authorizedPolicy = new Policy(this, "CognitoAuthorizedPolicy", {
			policyName: "CognitoAuthorizedPolicy",
			roles: [authorizedRole],
			statements: [
				new iam.PolicyStatement({
					effect: iam.Effect.ALLOW,
					actions: [
						"mobileanalytics:PutEvents",
						"cognito-sync:*",
						"cognito-identity:*",
					],
					resources: ["*"],
				}),
				new iam.PolicyStatement({
					effect: iam.Effect.ALLOW,
					actions: ["execute-api:Invoke"],
					resources: [`*`],
				}),
			],
		});

		/* Create Default Policy */
		const defaultPolicy = new cognito.CfnIdentityPoolRoleAttachment(
			this,
			"DefaultValid",
			{
				identityPoolId: identityPool.ref,
				roles: {
					unauthenticated: unauthorizedRole.roleArn,
					authenticated: authorizedRole.roleArn,
				},
			}
		);
	}
}
