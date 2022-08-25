#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { MasterFullStackSingleStack } from "../lib/master-fullstack-single-stack";

const app = new cdk.App();
new MasterFullStackSingleStack(app, "FullStackCdkStack");
