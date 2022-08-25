// Global policy
import * as cdk from "@aws-cdk/core";
// Lambda libs
import * as lambda from "@aws-cdk/aws-lambda";
// Import path
import * as path from "path";

// Interfaces for Lambda
export interface LambdaStackProps extends cdk.StackProps {
	org: string;
	environment: string;
	projectName: string;
	tableName: string;
}

// Lambda Objects
export class LambdaStack extends cdk.Stack {
	public readonly functionListGoals: lambda.Function;
	public readonly functionCreateGoal: lambda.Function;
	public readonly functionDeleteGoal: lambda.Function;
	public readonly functionUpdateGoal: lambda.Function;
	public readonly functionGetGoal: lambda.Function;

	constructor(scope: cdk.Construct, id: string, props: LambdaStackProps) {
		super(scope, id);

		this.functionListGoals = new lambda.Function(this, "FunctionListGoals", {
			functionName: `${props.projectName}-ListGoals`,
			runtime: lambda.Runtime.NODEJS_12_X,
			description: "Get list of goals for userId",
			handler: "ListGoals.handler",
			memorySize: 256,
			timeout: cdk.Duration.seconds(120),
			role: dynamoDbRole,
			environment: { TABLE_NAME: goalsTable.tableName },
			code: lambda.Code.fromAsset(path.dirname("../functions/ListGoals.js")),
		});

		this.functionCreateGoal = new lambda.Function(this, "FunctionCreateGoal", {
			functionName: `${props.projectName}-CreateGoal`,
			runtime: lambda.Runtime.NODEJS_12_X,
			description: "Create goal for user id",
			handler: "CreateGoal.handler",
			memorySize: 256,
			timeout: cdk.Duration.seconds(120),
			role: dynamoDbRole,
			environment: { TABLE_NAME: goalsTable.tableName },
			code: lambda.Code.fromAsset(path.dirname("../functions/CreateGoal.js")),
		});

		this.functionDeleteGoal = new lambda.Function(this, "FunctionDeleteGoal", {
			functionName: `${props.projectName}-DeleteGoal`,
			runtime: lambda.Runtime.NODEJS_12_X,
			description: "Delete goal for user id",
			handler: "DeleteGoal.handler",
			memorySize: 256,
			timeout: cdk.Duration.seconds(120),
			role: dynamoDbRole,
			environment: { TABLE_NAME: goalsTable.tableName },
			code: lambda.Code.fromAsset(path.dirname("../functions/DeleteGoal.js")),
		});

		this.functionUpdateGoal = new lambda.Function(this, "FunctionUpdateGoal", {
			functionName: `${props.projectName}-UpdateGoal`,
			runtime: lambda.Runtime.NODEJS_12_X,
			description: "Update goal for user id",
			handler: "UpdateGoal.handler",
			memorySize: 256,
			timeout: cdk.Duration.seconds(120),
			role: dynamoDbRole,
			environment: { TABLE_NAME: goalsTable.tableName },
			code: lambda.Code.fromAsset(path.dirname("../functions/UpdateGoal.js")),
		});

		this.functionGetGoal = new lambda.Function(this, "FunctionGetGoal", {
			functionName: `${props.projectName}-GetGoal`,
			runtime: lambda.Runtime.NODEJS_12_X,
			description: "Get goal for user id",
			handler: "GetGoal.handler",
			memorySize: 256,
			timeout: cdk.Duration.seconds(120),
			//role: dynamoDbRole,
			environment: { TABLE_NAME: goalsTable.tableName },
			code: lambda.Code.fromAsset(path.dirname("../functions/GetGoal.js")),
		});

		goalsTable.grantReadWriteData(this.functionListGoals);
		goalsTable.grantReadWriteData(this.functionCreateGoal);
		goalsTable.grantReadWriteData(this.functionDeleteGoal);
		goalsTable.grantReadWriteData(this.functionUpdateGoal);
		goalsTable.grantReadWriteData(this.functionGetGoal);
	}
}
