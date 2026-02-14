# Deploy script for vestolog-app (PowerShell version)

Write-Host "Building React application..." -ForegroundColor Green
npm run build

Write-Host "Deploying infrastructure to AWS..." -ForegroundColor Green
sam deploy --template-file deploy-template.yaml --stack-name vestolog-app-stack --capabilities CAPABILITY_IAM --region us-east-1

Write-Host "Getting S3 bucket name..." -ForegroundColor Green
$bucketName = aws cloudformation describe-stacks --stack-name vestolog-app-stack --query 'Stacks[0].Outputs[?OutputKey==`BucketName`].OutputValue' --output text

Write-Host "Uploading build files to S3 bucket: $bucketName" -ForegroundColor Green
aws s3 sync build/ s3://$bucketName --delete

Write-Host "Invalidating CloudFront cache..." -ForegroundColor Green
$distributionId = aws cloudfront describe-stacks --stack-name vestolog-app-stack --query 'Stacks[0].Outputs[?OutputKey==`WebURL`].OutputValue' --output text | ForEach-Object { $_.Split('.')[0] }
aws cloudfront create-invalidation --distribution-id $distributionId --paths "/*"

Write-Host "Deployment complete!" -ForegroundColor Green
$webUrl = aws cloudformation describe-stacks --stack-name vestolog-app-stack --query 'Stacks[0].Outputs[?OutputKey==`WebURL`].OutputValue' --output text
Write-Host "Your app is available at: https://$webUrl" -ForegroundColor Yellow
