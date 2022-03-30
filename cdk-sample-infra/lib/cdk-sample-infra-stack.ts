import {Fn, Stack, StackProps} from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecsPatterns from "aws-cdk-lib/aws-ecs-patterns";
import * as iam from "aws-cdk-lib/aws-iam";
import {Construct} from 'constructs';
import {EXPORT_NAME_ECR_REPOSITORY_URI, IP_ADDR} from "./constants";

export class CdkSampleInfraStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);
        const vpc = new ec2.Vpc(this, "VPC");
        const cluster = new ecs.Cluster(this, "Cluster", {vpc});
        const taskExecutionRole = new iam.Role(this, "TaskExecutionRole", {
            assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
        });
        const taskExecutionManagedPolicy = "service-role/AmazonECSTaskExecutionRolePolicy";
        taskExecutionRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName(taskExecutionManagedPolicy));
        const fargateService = new ecsPatterns.ApplicationLoadBalancedFargateService(this, "ECSService", {
            cluster,
            cpu: 256,
            memoryLimitMiB: 512,
            openListener: false,
            taskImageOptions: {
                image: ecs.ContainerImage.fromRegistry(Fn.importValue(EXPORT_NAME_ECR_REPOSITORY_URI)),
                containerPort: 8080,
                executionRole: taskExecutionRole,
            },
        });
        fargateService.targetGroup.configureHealthCheck({
            path: "/api/v1/healthCheck",
        });
        const securityGroup = new ec2.SecurityGroup(this, "ECSSecurityGroup", {
            vpc,
        });
        securityGroup.addIngressRule(ec2.Peer.ipv4(IP_ADDR), ec2.Port.tcp(80));
        fargateService.loadBalancer.addSecurityGroup(securityGroup)
    }
}
