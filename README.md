<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1-l6SfyYnKtidLbi-QvhaKkRRCHP_yNu2

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`


## Execute the following command in your terminal, replacing YOUR_GEMINI_API_KEY with your actual Gemini API key:
### directly set the environment variable in the Cloud Run service.
gcloud run services update waste-wizard \
  --update-env-vars=API_KEY=YOUR_GEMINI_API_KEY \
  --region=europe-west4 \
  --project=glass-oath-459720-m8

### For better security, you should use Google Cloud Secret Manager to store your API key and then grant your Cloud Run service access to it.
1. Create a secret in Secret Manager:
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic" --project=glass-oath-459720-m8

2. Add your API key as a secret version:
Replace YOUR_GEMINI_API_KEY with your actual key in this command.
echo "YOUR_GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=- --project=glass-oath-459720-m8

3. Grant your Cloud Run service access to the secret:
First, you need to find the service account email your Cloud Run service is using. You can find this in the Google Cloud Console on the service details page. Then, run the following command, 
replacing SERVICE_ACCOUNT_EMAIL with the email you found:
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:SERVICE_ACCOUNT_EMAIL" \
  --role="roles/secretmanager.secretAccessor" \
  --project=glass-oath-459720-m8

4. Update your Cloud Run service to use the secret:
This command tells Cloud Run to expose the latest version of the GEMINI_API_KEY secret as an environment variable named API_KEY in your container.
grant the Secret Manager Secret Accessor role to the service account 303319709599-compute@developer.gserviceaccount.com.
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:303319709599-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --project=glass-oath-459720-m8
  
gcloud run services update waste-wizard \
  --update-secrets=API_KEY=GEMINI_API_KEY:latest \
  --region=europe-west1 \
  --project=glass-oath-459720-m8


## Here's how to set it up and trigger the build:

You need to create a Cloud Build trigger that connects your GitHub repository to your Google Cloud project. This will tell Cloud Build to run your cloudbuild.yaml file whenever you push a change to your repository.
1. Set up the Cloud Build Trigger
Run the following command in your terminal, replacing YOUR_GITHUB_USERNAME with your actual GitHub username:
gcloud builds triggers create github \
  --repo-name=waste_separation \
  --repo-owner=YOUR_GITHUB_USERNAME \
  --branch-pattern="^main$" \
  --build-config=cloudbuild.yaml
2. Commit and push your changes
Now, you need to commit the change I made to your index.html file and push it to your main branch on GitHub. This will trigger the build and deployment process.

## deploy in firebase

firebase use game20250601
firebase deploy