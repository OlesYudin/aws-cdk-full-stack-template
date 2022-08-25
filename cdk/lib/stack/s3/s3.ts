// Global policy
import * as cdk from "@aws-cdk/core";
// s3 libs
import * as s3 from "@aws-cdk/aws-s3";
import * as s3deploy from "@aws-cdk/aws-s3-deployment";
import {
	BlockPublicAccess,
	BucketPolicy,
	BucketAccessControl,
} from "@aws-cdk/aws-s3";
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

// Interfaces for s3
export interface S3StackProps extends cdk.Stack {
	websiteIndexDocument: string;
	websiteErrorDocument: string;
}

// s3 initizlization
export class S3Stack extends cdk.Stack {
	constructor(scope: cdk.Construct, id: string, props: S3StackProps) {
		super(scope, id);
		const getRandomInt = (max: number) => {
			return Math.floor(Math.random() * Math.floor(max));
		};

		/* S3 Objects */
		//Todo - grant access to cloudfront user and uncomment block all
		/* Assets Source Bucket will be used as a codebuild source for the react code */
		const sourceAssetBucket = new s3.Bucket(this, "SourceAssetBucket", {
			bucketName: `aws-fullstack-template-source-assets-${getRandomInt(
				1000000
			)}`,
			blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
			removalPolicy: cdk.RemovalPolicy.DESTROY,
			versioned: true,
		});

		/* Website Bucket is the target bucket for the react application */
		const websiteBucket = new s3.Bucket(this, "WebsiteBucket", {
			bucketName: `aws-fullstack-template-website-${getRandomInt(1000000)}`,
			removalPolicy: cdk.RemovalPolicy.DESTROY,
			websiteIndexDocument: props.websiteIndexDocument,
			websiteErrorDocument: props.websiteErrorDocument,
		});

		/* Pipleine Artifacts Bucket is used by CodePipeline during Builds */
		const pipelineArtifactsBucket = new s3.Bucket(
			this,
			"PipelineArtifactsBucket",
			{
				bucketName: `aws-fullstack-template-codepipeline-artifacts-${getRandomInt(
					1000000
				)}`,
				blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
				removalPolicy: cdk.RemovalPolicy.DESTROY,
			}
		);

		/* S3 Website Deployment */
		/* Seed the website bucket with the react source */
		const s3WebsiteDeploy = new s3deploy.BucketDeployment(
			this,
			"S3WebsiteDeploy",
			{
				sources: [s3deploy.Source.asset("../assets/archive")],
				destinationBucket: sourceAssetBucket,
			}
		);

		/* Set Website Bucket Allow Policy */
		websiteBucket.addToResourcePolicy(
			new iam.PolicyStatement({
				resources: [`${websiteBucket.bucketArn}/*`],
				actions: ["s3:Get*"],
				principals: [new iam.AnyPrincipal()],
			})
		);
	}
}
