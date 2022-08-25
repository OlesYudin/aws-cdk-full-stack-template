// Global policy
import * as cdk from "@aws-cdk/core";
// CDN libs
import * as cf from "@aws-cdk/aws-cloudfront";
import {
	CloudFrontWebDistribution,
	OriginAccessIdentity,
	ViewerProtocolPolicy,
	S3OriginConfig,
} from "@aws-cdk/aws-cloudfront";
// S3 libs
import s3 = require("@aws-cdk/aws-s3");
import s3deploy = require("@aws-cdk/aws-s3-deployment");

// Interfaces for CDN (CloudFront)
export interface CDNStackProps extends cdk.Stack {
	websiteBucket: string;
	websiteErrorDocument: string;
}

// Cloudfront CDN Distribution
export class CDNStack extends cdk.Stack {
	constructor(scope: cdk.Construct, id: string, props: CDNStackProps) {
		super(scope, id);

		const assetsCdn = new CloudFrontWebDistribution(this, "AssetsCDN", {
			defaultRootObject: "index.html",
			comment: `CDN for ${props.websiteBucket}`,
			originConfigs: [
				{
					s3OriginSource: {
						s3BucketSource: props.websiteBucket,
						originAccessIdentity: new OriginAccessIdentity(
							this,
							"WebsiteBucketOriginAccessIdentity",
							{
								comment: `OriginAccessIdentity for ${props.websiteBucket}`,
							}
						),
					},
					behaviors: [{ isDefaultBehavior: true }],
				},
			],
		});
	}
}
