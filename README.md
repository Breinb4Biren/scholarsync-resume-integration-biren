This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app).

## Getting Started

# ScholarSync – Resume Integration

ScholarSync is a web application designed to scrape Google Scholar profiles, extract user publications and resume data, and integrate them into a clean, structured backend for future academic or research-oriented platforms.

---

## 📌 Features

- 🔍 Fetch and parse Google Scholar profiles using Puppeteer
- 📄 Resume upload via file input (PDF/Docx)
- 🔒 Secure backend API using Express
- 🧠 Extract publication data using Cheerio
- 📦 Store structured metadata in a PostgreSQL database
- 📤 File upload support with Multer
- 🛡️ Rate-limiting, CSRF protection, CORS configuration
- 🧪 Unit & E2E tests using Jest and Cypress
- 🧹 Linting with ESLint + Prettier
- 🔄 Git pre-commit hooks with Husky

---

## 🛠 Tech Stack

**Frontend:**
- Next.js
- Tailwind CSS
- Cypress (E2E Testing)

**Backend:**
- Node.js (Express)
- PostgreSQL
- Puppeteer
- Cheerio
- Multer

**Dev Tools:**
- ESLint
- Prettier
- Husky
- dotenv

---

## 🔐 Security Measures

- ✅ **CSRF Protection**
- ✅ **Rate Limiting** using `express-rate-limit`
- ✅ **CORS Configuration**
- ✅ **Secure File Uploads** with type/size checks via Multer

---

## 🧪 Testing

- Cypress tests cover:
  - Scholar URL edge cases
  - Resume upload failure/success
- Jest unit tests for:
  - Resume parsing logic
  - Scholar scraping module
- Sample test files are in `__tests__` and `tests` folders

---

## 🧼 Linting & Formatting

- ESLint rules enforced:
  - No unused variables
  - Consistent function naming
- Auto-format on save with Prettier
- Pre-commit hooks enabled using Husky

### Run locally:
```bash
npm run lint
npm run format

# 1. Clone the repo
git clone https://github.com/<your-username>/scholarsync-resume-integration-biren.git

# 2. Install dependencies
cd scholarsync-resume-integration-biren
npm install

# 3. Set up your .env file
cp .env.example .env
# Fill in required keys (e.g., DB credentials, PORT)

# 4. Start development server
npm run dev
