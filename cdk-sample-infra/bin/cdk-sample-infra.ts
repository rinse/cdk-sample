#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {CdkSampleInfraStack} from '../lib/cdk-sample-infra-stack';

const app = new cdk.App();
new CdkSampleInfraStack(app, 'CdkSampleInfraStack', {
    env: {account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION},
});
