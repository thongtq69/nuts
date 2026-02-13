
import fetch from 'node-fetch';

async function simulateLocal() {
    // Calling LOCALHOST to test the latest code changes directly on the user's machine
    const url = 'http://localhost:3001/api/bank/acb-callback';
    const apiKey = 'acb_gonuts_callback_2026_secure_key';

    const payload = {
        "requestTrace": "LOCAL_" + Date.now(),
        "requestDateTime": new Date().toISOString(),
        "requestParameters": {
            "transactionAmount": 372200,
            "description": "THANH TOAN DON HANG GOEEBE03",
            "numberOfTransaction": 1
        }
    };

    console.log('--- SIMULATING LOCAL ACB CALLBACK ---');
    console.log('URL:', url);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey
            },
            body: JSON.stringify(payload)
        });

        console.log('Response Status:', response.status);
        console.log('Response Body:', await response.text());
    } catch (error) {
        console.error('Error:', error);
    }
}

simulateLocal();
