#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { DatabaseStack } from "../lib/stack/db/database";
import { S3Stack } from "../lib/stack/s3/s3";

const app = new cdk.App();

const props = {
	projectName: "MyCdkGoals",
	tableName: "CDKGoals",
	websiteIndexDocument: "index.html",
	websiteErrorDocument: "index.html",
};

const DatabaseAppStack = new DatabaseStack(app, "DatabaseAppStack", props);
const S3AppStack = new S3Stack(app, "S3AppStack", props);
