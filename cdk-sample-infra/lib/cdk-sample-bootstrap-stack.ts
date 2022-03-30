import {CfnOutput, Stack, StackProps} from "aws-cdk-lib";
import * as ecr from 'aws-cdk-lib/aws-ecr';
import {Construct} from "constructs";
import {EXPORT_NAME_ECR_REPOSITORY_URI} from "./constants";

export class CdkSampleBootstrapStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);
        const repository = new ecr.Repository(this, "repository", {
            repositoryName: "cdk-sample",
            encryption: ecr.RepositoryEncryption.AES_256,
        });
        new CfnOutput(this, "ECRRepositoryUri", {
            value: repository.repositoryUri,
            exportName: EXPORT_NAME_ECR_REPOSITORY_URI,
        });
    }
}
