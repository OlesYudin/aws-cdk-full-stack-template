// Global policy
import * as cdk from "@aws-cdk/core";
import { RemovalPolicy, CfnOutput, CustomResource } from "@aws-cdk/core";
// IAM
import * as iam from "@aws-cdk/aws-iam";
import {
	FederatedPrincipal,
	PolicyDocument,
	User,
	Policy,
	ManagedPolicy,
	PolicyStatement,
} from "@aws-cdk/aws-iam";
// DynamoDB
import * as dynamodb from "@aws-cdk/aws-dynamodb";

// Interfaces for DynamoDB
export interface DatabaseStackProps extends cdk.Stack {
	ProjectName: string;
	TableName: string;
}

// DynamoDB initizlization
export class DatabaseStack extends cdk.Stack {
	constructor(scope: cdk.Construct, id: string, props: DatabaseStackProps) {
		super(scope, id);

		/* Dynamo Objects */
		//#region
		/* Create DynamoDB Goals Table */
		const goalsTable = new dynamodb.Table(this, "TGoals", {
			tableName: `${props.ProjectName}-${props.TableName}`,
			partitionKey: { name: "userId", type: dynamodb.AttributeType.STRING },
			sortKey: { name: "goalId", type: dynamodb.AttributeType.STRING },
			readCapacity: 1,
			writeCapacity: 1,
			removalPolicy: RemovalPolicy.DESTROY,
		});

		/* Create DynamoDB Role/Policy */
		const dynamoDbRole = new iam.Role(this, "DynamoDbRole", {
			assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
		});

		const goalsPolicy = new Policy(this, "GoalsPolicy", {
			policyName: "GoalsPolicy",
			roles: [dynamoDbRole],
			statements: [
				new iam.PolicyStatement({
					effect: iam.Effect.ALLOW,
					actions: ["dynamodb:*"],
					resources: [goalsTable.tableArn],
				}),
			],
		});
	}
}
