#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {CdkSampleBootstrapStack} from '../lib/cdk-sample-bootstrap-stack';

const app = new cdk.App();
new CdkSampleBootstrapStack(app, 'CdkSampleBootstrapStack', {
    env: {account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION},
});
