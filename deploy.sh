#!/bin/bash

# Deploy script for vestolog-app
echo "Building React application..."
npm run build

echo "Deploying infrastructure to AWS..."
sam deploy --template-file template.yaml --stack-name vestolog-app-stack --capabilities CAPABILITY_IAM --region us-east-1

echo "Getting S3 bucket name..."
BUCKET_NAME=$(aws cloudformation describe-stacks --stack-name vestolog-app-stack --query 'Stacks[0].Outputs[?OutputKey==`BucketName`].OutputValue' --output text)

echo "Uploading build files to S3 bucket: $BUCKET_NAME"
aws s3 sync build/ s3://$BUCKET_NAME --delete

echo "Invalidating CloudFront cache..."
DISTRIBUTION_ID=$(aws cloudformation describe-stacks --stack-name vestolog-app-stack --query 'Stacks[0].Outputs[?OutputKey==`WebURL`].OutputValue' --output text | cut -d'.' -f1)
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"

echo "Deployment complete!"
echo "Your app is available at: https://$(aws cloudformation describe-stacks --stack-name vestolog-app-stack --query 'Stacks[0].Outputs[?OutputKey==`WebURL`].OutputValue' --output text)"
