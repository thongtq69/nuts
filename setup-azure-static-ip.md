# Plan: Setup Static IP Proxy with Azure for Banking Callback

## Objective
Provide a dedicated, static IP address for the banking callback (ACB) to satisfy the bank's security policy, while keeping the main application on Vercel.

## Architecture
- **Inbound:** Bank -> `https://api-bank.gonuts.vn` (Azure VM Static IP) -> Nginx Proxy -> `https://gonuts.vn` (Vercel)
- **Security:**
  - Azure VM with fixed Static Public IP.
  - Nginx handling SSL (HTTPS) via Let's Encrypt.
  - Proxy header forwarding to maintain original request data.

## Phase 1: Resource Creation (User Action)
1. **Login to Azure Portal:** Use Education account.
2. **Create Virtual Machine:**
   - **Image:** Ubuntu 22.04 LTS.
   - **Size:** `Standard_B1s` (minimum cost).
   - **Region:** `Southeast Asia` (Singapore).
   - **Authentication:** Password.
3. **Networking Configuration:**
   - **Public IP:** Create new, set assignment to **Static**.
   - **Security Group:** Open ports 80, 443, and 22.
4. **Get IP:** Provide the static Public IP to the assistant.

## Phase 2: Domain Setup (User Action)
1. **Subdomain:** Create an A record for `api-bank.gonuts.vn` pointing to the Azure Static IP.

## Phase 3: Proxy Configuration (Assistant Guided)
1. **SSH into Server:** Connect via terminal.
2. **Execute Setup Script:** (To be provided by Assistant)
   - Install Nginx.
   - Install Certbot for SSL.
   - Configure Nginx reverse proxy.
3. **Verify:** Test the connection from Bank Simulator to the new URL.

## Phase 4: Bank Update
1. Provide the new URL and Static IP to the bank.
   - URL: `https://api-bank.gonuts.vn/api/bank/acb-callback`
   - IP: [Azure_Static_IP]
