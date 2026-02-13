
// Mocking the extraction logic to prove it works with ACB Portal payload
const body = {
    "requestTrace": "d8b3080c-fcc7-4e59-b31f-02ee1ce83d23",
    "requestDateTime": "2026-02-13T01:00:00.000Z",
    "requestParameters": {
        "transactionAmount": 372200,
        "description": "THANH TOAN DON HANG GOEEBE03",
        "numberOfTransaction": 1
    }
};

const params = body.requestParameters || {};
const transactionId = body.transactionId || body.referenceCode || body.tranId || body.requestTrace || params.requestTrace || params.referenceCode;
const amount = Number(body.amount || body.tranAmount || params.transactionAmount || params.amount || params.tranAmount || 0);
const description = body.description || body.tranContent || params.description || params.tranContent || body.content || '';

console.log('--- EXTRACTED DATA ---');
console.log('Transaction ID:', transactionId);
console.log('Amount:', amount);
console.log('Description:', description);

const paymentRefMatch = description.match(/GO[A-Z0-9]{6}/i);
if (paymentRefMatch) {
    console.log('Matched Ref:', paymentRefMatch[0].toUpperCase());
} else {
    console.log('No match found in description');
}
