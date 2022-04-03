import {Fn, Stack, StackProps} from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecsPatterns from "aws-cdk-lib/aws-ecs-patterns";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as targets from "aws-cdk-lib/aws-elasticloadbalancingv2-targets";
import * as s3 from "aws-cdk-lib/aws-s3";
import {Construct} from 'constructs';
import {EXPORT_NAME_ECR_REPOSITORY_URI, IP_ADDR} from "./constants";
import * as path from "path";

const ServicePrincipals = {
    ECS_TASKS: "ecs-tasks.amazonaws.com",
}

export class CdkSampleInfraStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);
        const vpc = new ec2.Vpc(this, "VPC");
        const cluster = new ecs.Cluster(this, "Cluster", {vpc});
        const taskExecutionRole = new iam.Role(this, "TaskExecutionRole", {
            assumedBy: new iam.ServicePrincipal(ServicePrincipals.ECS_TASKS),
        });
        const taskExecutionManagedPolicy = "service-role/AmazonECSTaskExecutionRolePolicy";
        taskExecutionRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName(taskExecutionManagedPolicy));
        const taskRole = new iam.Role(this, "TaskRole", {
            assumedBy: new iam.ServicePrincipal(ServicePrincipals.ECS_TASKS),
        });
        // Add policies to run the application
        // taskRole.addManagedPolicy()
        const fargateService = new ecsPatterns.ApplicationLoadBalancedFargateService(this, "ECSService", {
            cluster,
            cpu: 256,
            memoryLimitMiB: 512,
            openListener: false,
            taskImageOptions: {
                image: ecs.ContainerImage.fromRegistry(Fn.importValue(EXPORT_NAME_ECR_REPOSITORY_URI)),
                containerPort: 8080,
                executionRole: taskExecutionRole,
                taskRole: taskRole,
            },
        });

        // Apply a security group to LoadBalancer
        const securityGroup = new ec2.SecurityGroup(this, "ECSSecurityGroup", {vpc});
        securityGroup.addIngressRule(ec2.Peer.ipv4(IP_ADDR), ec2.Port.tcp(80));
        fargateService.loadBalancer.addSecurityGroup(securityGroup)

        // Settings on the target group for API
        fargateService.targetGroup.configureHealthCheck({
            path: "/api/v1/healthCheck",
        });
        new elbv2.ApplicationListenerRule(this, "ListenerRuleForApi", {
            listener: fargateService.listener,
            action: elbv2.ListenerAction.forward([fargateService.targetGroup]),
            conditions: [
                elbv2.ListenerCondition.pathPatterns(["/api/*"]),
            ],
            priority: 1,
        });

        const staticResourceBucket = new s3.Bucket(this, "StaticResourceBucket");
        const staticResourceFunc = new lambda.Function(this, "StaticResourceFunction", {
            runtime: lambda.Runtime.NODEJS_14_X,
            code: lambda.Code.fromAsset(path.join(__dirname, "resources")),
            handler: "staticResourceHandler.handler",
            environment: {
                "FRONTEND_BUCKET": staticResourceBucket.bucketName,
            },
        });
        staticResourceBucket.grantRead(staticResourceFunc);

        // Settings on the target group for Frontend
        const frontendTargetGroup = new elbv2.ApplicationTargetGroup(this, "FrontendTargetGroup", {
            targetType: elbv2.TargetType.LAMBDA,
            targets: [
                new targets.LambdaTarget(staticResourceFunc),
            ],
        });
        new elbv2.ApplicationListenerRule(this, "ListenerRuleForFront", {
            listener: fargateService.listener,
            action: elbv2.ListenerAction.forward([frontendTargetGroup]),
            conditions: [
                elbv2.ListenerCondition.pathPatterns(["*"]),
            ],
            priority: 2,
        });
    }
}
