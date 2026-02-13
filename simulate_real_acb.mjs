
import fetch from 'node-fetch';

async function simulateRealACB() {
    const url = 'http://localhost:3001/api/bank/acb-callback';

    // Exact format from ACB's real webhook
    const payload = {
        "requestMeta": {
            "clientRequestId": "test-real-format-9d5c03",
            "checksum": "abc123"
        },
        "requests": [
            {
                "requestMeta": {
                    "requestType": "NOTIFICATION",
                    "requestCode": "TRANSACTION_UPDATE"
                },
                "requestParams": {
                    "transactions": [
                        {
                            "transactionStatus": "COMPLETED",
                            "transactionChannel": "MAPP",
                            "transactionCode": 12345,
                            "accountNumber": 156626599,
                            "transactionDate": "2026-02-13T08:35:06.000Z",
                            "effectiveDate": "2026-02-12T17:00:00.000Z",
                            "debitOrCredit": "credit",
                            "virtualAccountInfo": null,
                            "amount": 372200,
                            "transactionEntityAttribute": {
                                "issuerBankName": "ACB - NH TMCP A CHAU",
                                "receiverBankName": "ACB - NH TMCP A CHAU",
                                "remitterName": "TEST USER",
                                "remitterAccountNumber": "12345678"
                            },
                            "transactionContent": "THANH TOAN DON HANG GO9D5C03"
                        }
                    ],
                    "pagination": {
                        "page": 1,
                        "pageSize": 1,
                        "totalPage": 1
                    }
                }
            }
        ]
    };

    console.log('--- SIMULATING REAL ACB WEBHOOK FORMAT (GO9D5C03) ---');

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'acb_gonuts_callback_2026_secure_key'
        },
        body: JSON.stringify(payload)
    });

    console.log('Response Status:', response.status);
    const result = await response.text();
    console.log('Response Body:', result);
}

simulateRealACB();
