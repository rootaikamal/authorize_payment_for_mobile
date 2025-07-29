'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const ApiContracts = require('authorizenet').APIContracts;
const ApiControllers = require('authorizenet').APIControllers;

const app = express();
const PORT = 3000;

// Your credentials
const API_LOGIN_ID = '8nTEhg6Z6X';
const TRANSACTION_KEY = '46T8as7G645vfAQG';

// Middleware
app.use(bodyParser.json());

// Payment form page
app.get('/payment-form', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>Payment Form</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 400px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .form-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 8px; font-weight: bold; color: #333; }
        input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 16px; box-sizing: border-box; }
        button { width: 100%; background: #007bff; color: white; padding: 15px; border: none; border-radius: 6px; font-size: 16px; cursor: pointer; }
        button:disabled { background: #ccc; }
        .result { margin-top: 20px; padding: 15px; border-radius: 6px; }
        .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        h2 { text-align: center; color: #333; margin-bottom: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <h2>💳 Payment Form</h2>
        
        <form id="paymentForm">
            <div class="form-group">
                <label>Card Number:</label>
                <input type="text" id="cardNumber" placeholder="4242424242424242" maxlength="16" required>
            </div>
            
            <div class="form-group">
                <label>Expiration (MMYY):</label>
                <input type="text" id="expirationDate" placeholder="1230" maxlength="4" required>
            </div>
            
            <div class="form-group">
                <label>CVV:</label>
                <input type="text" id="cardCode" placeholder="123" maxlength="4" required>
            </div>
            
            <div class="form-group">
                <label>Amount ($):</label>
                <input type="number" id="amount" placeholder="10.00" step="0.01" min="0.01" required>
            </div>
            
            <div class="form-group">
                <label>First Name:</label>
                <input type="text" id="firstName" placeholder="John" required>
            </div>
            
            <div class="form-group">
                <label>Last Name:</label>
                <input type="text" id="lastName" placeholder="Doe" required>
            </div>
            
            <button type="submit" id="submitBtn">💳 Process Payment</button>
        </form>
        
        <div id="result"></div>
    </div>

    <script>
        document.getElementById('paymentForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submitBtn');
            const resultDiv = document.getElementById('result');
            
            submitBtn.disabled = true;
            submitBtn.textContent = 'Processing...';
            resultDiv.innerHTML = '';
            
            const paymentData = {
                cardNumber: document.getElementById('cardNumber').value,
                expirationDate: document.getElementById('expirationDate').value,
                cardCode: document.getElementById('cardCode').value,
                amount: document.getElementById('amount').value,
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value
            };
            
            try {
                const response = await fetch('/api/process-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(paymentData)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    resultDiv.innerHTML = \`
                        <div class="result success">
                            <h3>✅ Payment Successful!</h3>
                            <p><strong>Transaction ID:</strong> \${result.transactionId}</p>
                            <p><strong>Message:</strong> \${result.message}</p>
                            <p><strong>Auth Code:</strong> \${result.authCode}</p>
                        </div>
                    \`;
                } else {
                    resultDiv.innerHTML = \`
                        <div class="result error">
                            <h3>❌ Payment Failed</h3>
                            <p><strong>Error:</strong> \${result.error}</p>
                        </div>
                    \`;
                }
            } catch (error) {
                resultDiv.innerHTML = \`
                    <div class="result error">
                        <h3>❌ Error</h3>
                        <p>Failed to process payment</p>
                    </div>
                \`;
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = '💳 Process Payment';
            }
        });
    </script>
</body>
</html>
    `);
});

// Payment API endpoint
app.post('/api/process-payment', async (req, res) => {
    try {
        const { cardNumber, expirationDate, cardCode, amount, firstName, lastName } = req.body;
        
        if (!cardNumber || !expirationDate || !cardCode || !amount) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }
        
        const result = await processPayment({
            cardNumber,
            expirationDate,
            cardCode,
            amount: parseFloat(amount),
            firstName: firstName || 'Test',
            lastName: lastName || 'User'
        });
        
        res.json(result);
    } catch (error) {
        console.error('Payment error:', error);
        res.status(500).json({
            success: false,
            error: 'Payment processing failed'
        });
    }
});

function processPayment(paymentData) {
    return new Promise((resolve, reject) => {
        const merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
        merchantAuthenticationType.setName(API_LOGIN_ID);
        merchantAuthenticationType.setTransactionKey(TRANSACTION_KEY);

        const creditCard = new ApiContracts.CreditCardType();
        creditCard.setCardNumber(paymentData.cardNumber);
        creditCard.setExpirationDate(paymentData.expirationDate);
        creditCard.setCardCode(paymentData.cardCode);

        const paymentType = new ApiContracts.PaymentType();
        paymentType.setCreditCard(creditCard);

        const billTo = new ApiContracts.CustomerAddressType();
        billTo.setFirstName(paymentData.firstName);
        billTo.setLastName(paymentData.lastName);

        const transactionRequestType = new ApiContracts.TransactionRequestType();
        transactionRequestType.setTransactionType(ApiContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION);
        transactionRequestType.setPayment(paymentType);
        transactionRequestType.setAmount(paymentData.amount);
        transactionRequestType.setBillTo(billTo);

        const createRequest = new ApiContracts.CreateTransactionRequest();
        createRequest.setMerchantAuthentication(merchantAuthenticationType);
        createRequest.setTransactionRequest(transactionRequestType);

        const ctrl = new ApiControllers.CreateTransactionController(createRequest.getJSON());

        ctrl.execute(function() {
            const apiResponse = ctrl.getResponse();
            if (apiResponse != null) {
                const response = new ApiContracts.CreateTransactionResponse(apiResponse);
                
                if (response.getMessages().getResultCode() === ApiContracts.MessageTypeEnum.OK) {
                    if (response.getTransactionResponse() && response.getTransactionResponse().getMessages()) {
                        resolve({
                            success: true,
                            transactionId: response.getTransactionResponse().getTransId(),
                            responseCode: response.getTransactionResponse().getResponseCode(),
                            message: response.getTransactionResponse().getMessages().getMessage()[0].getDescription(),
                            authCode: response.getTransactionResponse().getAuthCode()
                        });
                    } else {
                        resolve({
                            success: false,
                            error: 'Transaction failed'
                        });
                    }
                } else {
                    resolve({
                        success: false,
                        error: 'Payment processing failed'
                    });
                }
            } else {
                reject(new Error('No response from Authorize.net'));
            }
        });
    });
}

app.listen(PORT, () => {
    console.log(`🚀 Payment Form running on http://localhost:${PORT}/payment-form`);
    console.log(`🔑 API Login ID: ${API_LOGIN_ID}`);
    console.log(`💳 Test Card: 4242424242424242`);
}); 