# 🔄 Customer Churn Prediction

A machine learning web application that predicts whether a telecom customer will churn (leave the service), built with **XGBoost** and **Streamlit**.

---

## 📌 Overview

Customer churn is one of the biggest challenges for telecom companies. This project uses historical customer data to predict churn probability, helping businesses take proactive retention actions before losing a customer.

---

## 🚀 Live Demo

Run locally with:
```bash
streamlit run Churn_app.py
```

---

## 🖼️ App Preview

The app takes 19 customer attributes as input and outputs:
- ✅ Churn / No Churn prediction
- 📊 Confidence percentage
- ⚠️ Risk level (High / Medium / Low)
- 📉 Probability bar chart

---

## 🧠 Model Details

| Property | Value |
|---|---|
| Algorithm | XGBoost Classifier |
| Test Accuracy | ~77% |
| Training Samples | 7,063 customers |
| Features Used | 19 attributes |
| Class Imbalance Fix | SMOTE (oversampling) |

---

## 📂 Project Structure

```
Customer-Churn-Prediction/
├── Churn_app.py                    # Streamlit web app
├── Customer_Churn_Prediction.pkl   # Trained XGBoost model
├── Churn_Encoders.pkl              # Label encoders for categorical features
├── Customer Churn Prediction.ipynb # Full ML pipeline notebook
├── Telco_Customer_Dataset.csv      # Dataset used for training
└── README.md
```

---

## 📊 Input Features

### 👤 Demographic
- Gender, Senior Citizen, Partner, Dependents

### 📱 Services
- Phone Service, Multiple Lines, Internet Service
- Online Security, Online Backup, Device Protection
- Tech Support, Streaming TV, Streaming Movies

### 💳 Account
- Tenure, Contract Type, Paperless Billing
- Payment Method, Monthly Charges, Total Charges

---

## 🔑 Top Churn Predictors

1. **Contract Type** — Month-to-month customers churn the most
2. **Tenure** — New customers are at higher risk
3. **Monthly Charges** — Higher bills increase churn likelihood
4. **Internet Service** — Fiber optic customers churn more
5. **Payment Method** — Electronic check users show highest churn

---

## 🛠️ Tech Stack

| Category | Tools |
|---|---|
| Language | Python 3 |
| ML Model | XGBoost, Scikit-learn |
| Data Handling | Pandas, NumPy |
| Imbalance Fix | imbalanced-learn (SMOTE) |
| Web App | Streamlit |
| Visualization | Plotly |
| Model Saving | Joblib |

---

## ⚙️ How to Run Locally

### 1. Clone the repository
```bash
git clone https://github.com/Krish2005-bot/Projects.git
cd Projects/Customer-Churn-Prediction
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Run the app
```bash
streamlit run Churn_app.py
```

---

## 📦 Requirements

```
streamlit
pandas
numpy
xgboost
scikit-learn
imbalanced-learn
plotly
joblib
```

Or install all at once:
```bash
pip install streamlit pandas numpy xgboost scikit-learn imbalanced-learn plotly joblib
```

---

## 📈 ML Pipeline (Notebook)

The Jupyter notebook covers the full pipeline:
1. Data loading & exploration
2. Data cleaning & preprocessing
3. Label encoding categorical features
4. Handling class imbalance with SMOTE
5. Model training with XGBoost
6. Evaluation — Accuracy, Confusion Matrix, ROC-AUC
7. Saving model and encoders with Joblib

---

## 👨‍💻 Author

**Krish** — [@Krish2005-bot](https://github.com/Krish2005-bot)

---

## 📄 Dataset

[Telco Customer Churn Dataset](https://www.kaggle.com/datasets/blastchar/telco-customer-churn) — IBM Sample Dataset via Kaggle

---

*Built as part of a Machine Learning & Full Stack Development portfolio project.*
