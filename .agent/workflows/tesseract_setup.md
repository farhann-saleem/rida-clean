---
description: How to install Tesseract OCR on Windows
---

# Installing Tesseract OCR on Windows

Since you are on Windows, you need to install the Tesseract binary and add it to your system PATH so Python can find it.

## Step 1: Download the Installer
1. Go to the **UB Mannheim Tesseract Wiki**:  
   [https://github.com/UB-Mannheim/tesseract/wiki](https://github.com/UB-Mannheim/tesseract/wiki)
2. Scroll down to "The latest installers can be downloaded here".
3. Click the link for **`tesseract-ocr-w64-setup-v5.x.x.xxxx.exe`** (64-bit version) to download it.

## Step 2: Run the Installer
1. Run the downloaded `.exe` file.
2. Click **Yes** if asked for permission.
3. Follow the wizard (English -> Next -> I Agree).
4. **Choose Components**: You can leave the defaults. If you need other languages, expand "Additional script data" or "Additional language data" and select them.
5. **Destination Folder**:  
   > [!IMPORTANT]
   > Note down this path! It is usually:  
   > `C:\Program Files\Tesseract-OCR`
6. Click **Install** and wait for it to finish.

## Step 3: Add to System PATH (Critical)
This step allows you to run `tesseract` from any terminal.

1. Press `Win` key and type **"env"**.
2. Select **"Edit the system environment variables"**.
3. Click the **"Environment Variables..."** button (bottom right).
4. Under **"System variables"** (the bottom list), find the variable named **`Path`** and select it.
5. Click **"Edit..."**.
6. Click **"New"** on the right side.
7. Paste the installation path you noted earlier:  
   `C:\Program Files\Tesseract-OCR`
8. Click **OK** -> **OK** -> **OK** to close all windows.

## Step 4: Verify Installation
1. **Restart your terminal** (close VS Code terminal and open a new one).
2. Run this command:
   ```powershell
   tesseract --version
   ```
3. You should see output like `tesseract v5.3.3...`.

## Step 5: Restart Backend
1. Stop your running `uvicorn` server (Ctrl+C).
2. Start it again:
   ```powershell
   uvicorn main:app --reload
   ```
3. Now the OCR endpoint should return actual text!
