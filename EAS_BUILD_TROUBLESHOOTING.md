# EAS Build Troubleshooting Guide

## App Crashes on Launch

If your app crashes immediately after installation, the most common cause is **missing environment variables** (EAS secrets).

### Problem

**Important:** `.env` files work for local development (`expo start`) but are NOT included in EAS builds!

When building with EAS, environment variables referenced in `eas.json` must be set as **EAS secrets**, not `.env` files. If they're missing, the Appwrite client will fail to initialize, causing the app to crash on startup.

### Common Mistake

If you set environment variables in a `.env` file for local development, they won't be available in your EAS build. You need to copy those values to EAS secrets.

### Solution: Set EAS Environment Variables

You need to set all required environment variables in EAS. **Copy the values from your `.env` file** and set them:

**Important:** `EXPO_PUBLIC_*` variables are public (embedded in your app), so use `--type plain` instead of secret:

```bash
# Required Appwrite configuration
# Replace the values below with the actual values from your .env file
eas secret:create --scope project --name EXPO_PUBLIC_APPWRITE_ENDPOINT --value https://cloud.appwrite.io/v1 --type plain
eas secret:create --scope project --name EXPO_PUBLIC_APPWRITE_PROJECT_ID --value YOUR_PROJECT_ID_FROM_ENV --type plain
eas secret:create --scope project --name EXPO_PUBLIC_APPWRITE_DATABASE_ID --value YOUR_DATABASE_ID_FROM_ENV --type plain
eas secret:create --scope project --name EXPO_PUBLIC_APPWRITE_COLLECTION_ACCOUNTS --value YOUR_ACCOUNTS_COLLECTION_ID --type plain
eas secret:create --scope project --name EXPO_PUBLIC_APPWRITE_COLLECTION_TRANSACTIONS --value YOUR_TRANSACTIONS_COLLECTION_ID --type plain
eas secret:create --scope project --name EXPO_PUBLIC_APPWRITE_COLLECTION_MONTHLY_PLANS --value YOUR_MONTHLY_PLANS_COLLECTION_ID --type plain

# Optional (for AI features - only if you have these in your .env)
eas secret:create --scope project --name EXPO_PUBLIC_OPENROUTER_API_KEY --value YOUR_OPENROUTER_KEY --type plain
eas secret:create --scope project --name EXPO_PUBLIC_APP_URL --value YOUR_APP_URL --type plain
```

**Note:** The `--type plain` flag tells EAS these are public variables (not secrets). This is correct because `EXPO_PUBLIC_*` variables are embedded in your compiled app and visible to anyone who inspects it.

**Quick Migration from .env:**
1. Open your `.env` file
2. Copy each value
3. Run the `eas secret:create` commands above, replacing the placeholder values with your actual `.env` values

### Verify Secrets Are Set

To check if your secrets are set:

```bash
eas secret:list
```

### Get Your Appwrite Values

1. **Project ID**: Go to [Appwrite Cloud Dashboard](https://cloud.appwrite.io) → Your Project → Settings → General → Project ID
2. **Database ID**: Go to Database → Settings → Database ID
3. **Collection IDs**: Go to each collection → Settings → Collection ID

### After Setting Secrets

1. Rebuild your app:
   ```bash
   eas build --platform android --profile preview
   ```

2. The app should now launch without crashing.

## Other Common Issues

### Issue: Build Fails

- **Check**: Make sure you're logged in to EAS: `eas login`
- **Check**: Verify your `app.json` and `eas.json` are valid JSON
- **Check**: Ensure all required plugins are installed

### Issue: App Builds But Crashes on Specific Actions

- **Check**: Look at device logs using `adb logcat` (Android) or Xcode Console (iOS)
- **Check**: Verify all environment variables are set correctly
- **Check**: Ensure your Appwrite project has the correct permissions set

### Issue: Network Errors

- **Check**: Verify `EXPO_PUBLIC_APPWRITE_ENDPOINT` is correct
- **Check**: Ensure your Appwrite project allows requests from your app
- **Check**: Verify API keys and permissions in Appwrite dashboard

## Debugging Tips

### View Build Logs

```bash
eas build:list
eas build:view [build-id]
```

### Test Locally First

Before building with EAS, test locally:

```bash
# Set up .env file
cp .env.example .env
# Edit .env with your values
npm start
```

### Check Device Logs

**Android:**
```bash
adb logcat | grep -i "react\|expo\|appwrite"
```

**iOS:**
- Open Xcode → Window → Devices and Simulators
- Select your device
- View Console logs

## Need Help?

If the issue persists:
1. Check the EAS build logs for errors
2. Verify all secrets are set correctly
3. Test the app in development mode first
4. Check Appwrite dashboard for any configuration issues

