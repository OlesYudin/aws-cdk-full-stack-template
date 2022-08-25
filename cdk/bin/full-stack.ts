#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { DatabaseStack } from "../lib/stack/db/database";
import { S3Stack } from "../lib/stack/s3/s3";
import { CDNStack } from "../lib/stack/cdn/cloudfront";
import { LambdaStack } from "../lib/stack/lambda/lambda";
import { CognitoStack } from "../lib/stack/cognito/cognito";
import { ApiGatewayStack } from "../lib/stack/apigw/api-gateway";
import { CodeStack } from "../lib/stack/code/code";

const app = new cdk.App();

const props = {
	projectName: "MyCdkGoals",
	tableName: "CDKGoals",
	websiteIndexDocument: "index.html",
	websiteErrorDocument: "index.html",
	cdnWebsiteIndexDocument: "index.html",
	useCdn: true,
};

const DatabaseAppStack = new DatabaseStack(app, "DatabaseAppStack", props);
const S3AppStack = new S3Stack(app, "S3AppStack", props);

if (props.useCdn) {
	const CDNAppStack = new CDNStack(
		app,
		"CDNAppStack",
		S3AppStack.websiteBucket,
		props
	);
}

const LambdaAppStack = new LambdaStack(
	app,
	"LambdaAppStack",
	DatabaseAppStack.goalsTable,
	DatabaseAppStack.dynamoDbRole,
	props
);
const CognitoAppStack = new CognitoStack(app, "CognitoAppStack", props);
const ApiGatewayAppStack = new ApiGatewayStack(
	app,
	"ApiGatewayAppStack",
	LambdaAppStack,
	CognitoAppStack,
	props
);
const CodeAppStack = new CodeStack(
	app,
	"CodeAppStack",
	CognitoAppStack,
	S3AppStack,
	ApiGatewayAppStack,
	props
);
