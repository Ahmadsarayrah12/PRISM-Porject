#!/bin/bash

# 📋 سكريبت نشر التطبيق على Google Cloud Run
# 
# الاستخدام:
# chmod +x deploy.sh
# ./deploy.sh

set -e

echo "🚀 بدء نشر التطبيق على Google Cloud Run..."

# ألوان الطباعة
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# إعدادات Google Cloud
PROJECT_ID="antigravity-media-12345"
SERVICE_NAME="prism-app"
REGION="us-central1"

echo -e "${YELLOW}1️⃣ التحقق من تثبيت gcloud CLI...${NC}"
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}gcloud CLI غير مثبت. يرجى تثبيته أولاً من: https://cloud.google.com/sdk/docs/install${NC}"
    exit 1
fi

echo -e "${GREEN}✅ gcloud مثبت${NC}"

echo -e "${YELLOW}2️⃣ تسجيل الدخول إلى Google Cloud...${NC}"
gcloud auth login

echo -e "${YELLOW}3️⃣ تحديد المشروع...${NC}"
gcloud config set project $PROJECT_ID

echo -e "${YELLOW}4️⃣ تمكين الخدمات المطلوبة...${NC}"
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com

echo -e "${YELLOW}5️⃣ إنشاء الأسرار (Secrets)...${NC}"

# قراءة MONGO_URI من المستخدم
read -p "أدخل MongoDB URI: " MONGO_URI
gcloud secrets create mongo-uri --data-file=- --replication-policy="automatic" <<< "$MONGO_URI" 2>/dev/null || echo "السر موجود بالفعل"

# قراءة Gemini API Key
read -sp "أدخل Gemini API Key: " GEMINI_API_KEY
echo ""
gcloud secrets create gemini-api-key --data-file=- --replication-policy="automatic" <<< "$GEMINI_API_KEY" 2>/dev/null || echo "السر موجود بالفعل"

echo -e "${YELLOW}6️⃣ النشر على Cloud Run...${NC}"
gcloud run deploy $SERVICE_NAME \
  --source . \
  --region $REGION \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --timeout 3600 \
  --max-instances 100 \
  --set-env-vars \
    PORT=8080,\
    NODE_ENV=production,\
    GOOGLE_CLOUD_PROJECT=$PROJECT_ID,\
    GOOGLE_CLOUD_LOCATION=$REGION

echo ""
echo -e "${GREEN}✅ تم النشر بنجاح!${NC}"

# الحصول على رابط الخدمة
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format='value(status.url)')
echo -e "${GREEN}رابط التطبيق: $SERVICE_URL${NC}"

echo -e "${YELLOW}7️⃣ عرض السجلات...${NC}"
echo "للحصول على السجلات في الوقت الفعلي، استخدم:"
echo "gcloud run logs read $SERVICE_NAME --region $REGION --limit 50 --follow"
