module.exports = (sls) => {
  if (process.env.AWS_CERTIFICATE_ARN == null) {
    throw new Error('Environment variable AWS_CERTIFICATE_ARN is missing');
  }

  const stage = process.env.STAGE || process.env.NODE_ENV || 'development';
  const cloudFrontDomain =
    stage === 'production' ? 'images.sjofartstidningen.se' : `${stage}.images.sjofartstidningen.se`;

  return {
    defaultStage: stage,
    defaultRegion: 'eu-north-1',
    apigwBinary: {
      types: ['*/*', 'image/*', 'image/apng', 'image/gif', 'image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'],
    },
    apiCloudFront: {
      domain: cloudFrontDomain,
      certificate: process.env.AWS_CERTIFICATE_ARN,
      compress: true,
      cookies: 'none',
      headers: ['Accept'],
      querystring: 'all',
    },
  };
};
