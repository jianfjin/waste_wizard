# Deployment Guide for Google Cloud

This guide covers deploying the Waste Separation Game to Google Cloud Platform.

## Prerequisites

1. **Google Cloud Account**: Create one at https://cloud.google.com/
2. **Google Cloud SDK**: Install from https://cloud.google.com/sdk/docs/install
3. **Docker**: Install from https://docs.docker.com/get-docker/
4. **Project Setup**: Create a new Google Cloud project

## Quick Start

### 1. Initialize Google Cloud SDK

```bash
# Login to Google Cloud
gcloud auth login

# Set your project ID
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### 2. Deploy to Google Cloud Run (Recommended)

Cloud Run is the easiest and most cost-effective option:

```bash
# Build and deploy in one command
gcloud builds submit --config cloudbuild.yaml

# Or manually:
# Build the Docker image
docker build -t gcr.io/YOUR_PROJECT_ID/waste-separation:latest .

# Push to Google Container Registry
docker push gcr.io/YOUR_PROJECT_ID/waste-separation:latest

# Deploy to Cloud Run
gcloud run deploy waste-separation \
  --image gcr.io/YOUR_PROJECT_ID/waste-separation:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1
```

### 3. Access Your Application

After deployment, Cloud Run will provide a URL like:
```
https://waste-separation-xxxxx-uc.a.run.app
```

## Deployment Options

### Option 1: Cloud Run (Recommended)

**Pros:**
- Automatic scaling (including to zero)
- Pay only for actual usage
- Managed SSL certificates
- Easy deployment
- Fast cold starts

**Pricing:**
- Free tier: 2 million requests/month
- $0.00002400 per request after free tier
- $0.00001800 per vCPU-second
- $0.00000250 per GiB-second

**Deploy:**
```bash
gcloud builds submit --config cloudbuild.yaml
```

### Option 2: Google App Engine Flexible

**Pros:**
- More control over environment
- Integrated with Google Cloud services
- Traffic splitting

**Pricing:**
- Starts at ~$60/month for 1 instance

**Deploy:**
```bash
gcloud app deploy
```

### Option 3: Google Kubernetes Engine (GKE)

For more complex deployments with multiple services.

**Deploy:**
```bash
# Create cluster
gcloud container clusters create waste-separation-cluster \
  --num-nodes=1 \
  --machine-type=e2-small

# Deploy application
kubectl apply -f kubernetes-deployment.yaml
```

## Local Testing

Test the Docker image locally before deploying:

```bash
# Build the image
docker build -t waste-separation:local .

# Run locally
docker run -p 8080:8080 waste-separation:local

# Or use docker-compose
docker-compose up
```

Visit http://localhost:8080 to test.

## Environment Configuration

### Firebase Configuration (Optional)

If using Firebase for leaderboard:

1. Update `shootwaste.html` lines 440-446 with your Firebase credentials
2. Rebuild the Docker image
3. Redeploy

### Custom Domain

To use a custom domain:

```bash
# Map domain to Cloud Run
gcloud run domain-mappings create \
  --service waste-separation \
  --domain www.yourdomain.com \
  --region us-central1
```

## Monitoring and Logs

### View Logs

```bash
# Cloud Run logs
gcloud run services logs read waste-separation --region us-central1

# Or in Cloud Console
https://console.cloud.google.com/logs
```

### Monitoring

Access metrics in Google Cloud Console:
- Requests per second
- Response times
- Error rates
- Memory usage
- CPU usage

## Cost Optimization

### Cloud Run Cost Optimization

1. **Use minimum instances = 0** for auto-scaling to zero
2. **Set appropriate memory limits** (512Mi is usually sufficient)
3. **Configure timeout** appropriately (300s default)
4. **Monitor usage** through Cloud Console

### Expected Costs

For a small to medium traffic site:
- **Cloud Run**: $0 - $20/month (likely free tier)
- **Cloud Storage (for images)**: $1 - $5/month
- **Cloud Build**: Free tier (120 build-minutes/day)

## Continuous Deployment

### Setup with GitHub

1. **Connect repository to Cloud Build:**
```bash
gcloud builds triggers create github \
  --repo-name=waste_separation \
  --repo-owner=YOUR_GITHUB_USERNAME \
  --branch-pattern="^main$" \
  --build-config=cloudbuild.yaml
```

2. **Push to main branch** triggers automatic deployment

## Troubleshooting

### Build Fails

```bash
# Check build logs
gcloud builds list
gcloud builds log BUILD_ID
```

### Container Won't Start

```bash
# Check service logs
gcloud run services logs read waste-separation --limit 50

# Describe the service
gcloud run services describe waste-separation --region us-central1
```

### Out of Memory

Increase memory allocation:
```bash
gcloud run services update waste-separation \
  --memory 1Gi \
  --region us-central1
```

### Slow Performance

1. Enable Cloud CDN for static assets
2. Increase CPU allocation
3. Set minimum instances > 0 to avoid cold starts

## Security Best Practices

1. **Use Secret Manager** for sensitive data:
```bash
echo -n "your-secret" | gcloud secrets create firebase-api-key --data-file=-
```

2. **Enable Cloud Armor** for DDoS protection
3. **Configure IAM** properly
4. **Use VPC** for network isolation (if needed)
5. **Enable audit logging**

## Backup and Recovery

### Database Backup (if using Firebase)

Firebase handles backups automatically with paid plans.

### Container Images

Images are stored in Container Registry with versioning:
```bash
# List all images
gcloud container images list --repository=gcr.io/YOUR_PROJECT_ID

# Delete old images
gcloud container images delete gcr.io/YOUR_PROJECT_ID/waste-separation:OLD_TAG
```

## Performance Tuning

### Nginx Optimization

The included `nginx.conf` already has:
- Gzip compression
- Static asset caching
- Connection keep-alive
- Security headers

### Docker Optimization

Multi-stage build reduces image size:
- Builder stage: ~1GB
- Final image: ~50MB (Alpine + nginx)

## Scaling Configuration

### Auto-scaling

Cloud Run automatically scales based on:
- Request volume
- CPU utilization
- Memory usage

Configure limits:
```bash
gcloud run services update waste-separation \
  --min-instances 0 \
  --max-instances 100 \
  --region us-central1
```

### Traffic Splitting

Test new versions with traffic splitting:
```bash
gcloud run services update-traffic waste-separation \
  --to-revisions=new-version=10,old-version=90
```

## Health Checks

The application includes health check endpoint:
- **URL**: `/health`
- **Expected Response**: 200 OK with "healthy"
- **Check Interval**: 30 seconds

## Clean Up

To avoid charges, delete resources:

```bash
# Delete Cloud Run service
gcloud run services delete waste-separation --region us-central1

# Delete container images
gcloud container images delete gcr.io/YOUR_PROJECT_ID/waste-separation:latest

# Delete entire project (be careful!)
gcloud projects delete YOUR_PROJECT_ID
```

## Support

- **Google Cloud Documentation**: https://cloud.google.com/docs
- **Cloud Run Documentation**: https://cloud.google.com/run/docs
- **Pricing Calculator**: https://cloud.google.com/products/calculator

## Next Steps

1. ✅ Deploy to Cloud Run
2. ✅ Configure custom domain
3. ✅ Set up monitoring alerts
4. ✅ Enable Cloud CDN
5. ✅ Configure Firebase (if needed)
6. ✅ Set up CI/CD with GitHub
7. ✅ Monitor costs and optimize

---

**Estimated Deployment Time**: 10-15 minutes

**Estimated Monthly Cost**: $0 - $20 (likely free tier)

**Last Updated**: 2025-10-17
