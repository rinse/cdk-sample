import {CfnOutput, Stack, StackProps} from "aws-cdk-lib";
import * as ecr from 'aws-cdk-lib/aws-ecr';
import {Construct} from "constructs";

export class CdkSampleBootstrapStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);
        const repository = new ecr.Repository(this, "repository", {
            repositoryName: "cdk-sample",
            encryption: ecr.RepositoryEncryption.AES_256,
        });
        new CfnOutput(this, "ECRRepositoryName", {
            value: repository.repositoryName,
            exportName: "ECRRepositoryName",
        });
    }
}
