
import fetch from 'node-fetch';

async function simulateCallback() {
    const url = 'https://gonuts.vn/api/bank/acb-callback';
    const apiKey = 'acb_gonuts_callback_2026_secure_key';

    const payload = {
        tranId: 'TEST_' + Date.now(),
        tranAmount: 372200,
        tranContent: 'THANH TOAN DON HANG GOEEBE03',
        tranDateTime: new Date().toISOString()
    };

    console.log('--- SIMULATING EXTERNAL CALLBACK ---');
    console.log('URL:', url);
    console.log('Payload:', JSON.stringify(payload, null, 2));

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey
            },
            body: JSON.stringify(payload)
        });

        const status = response.status;
        const text = await response.text();

        console.log('Response Status:', status);
        console.log('Response Body:', text);

        if (status === 200) {
            console.log('\n✅ Server returned 200. Checking DB now...');
        } else {
            console.log('\n❌ Server returned error status.');
        }
    } catch (error) {
        console.error('Error simulating callback:', error);
    }
}

simulateCallback();
