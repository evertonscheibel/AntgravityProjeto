const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const ADMIN_EMAIL = 'admin@gestao.com';
const ADMIN_PASSWORD = 'admin123';

async function verify() {
    try {
        // 1. Login
        console.log('1. Logging in...');
        const loginRes = await axios.post(`${API_URL}/users/login`, {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
        });
        const token = loginRes.data.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        console.log('   Login successful.');

        // 2. Create Network Asset
        console.log('2. Creating Network Asset...');
        const uniqueId = Date.now();
        const assetData = {
            assetId: `NET-TEST-${uniqueId}`,
            description: 'Test Network Switch',
            type: 'rede', // or legacy type
            category: 'network',
            network: {
                deviceType: 'switch',
                hostname: `sw-test-${uniqueId}`,
                mgmtIp: `192.168.99.${Math.floor(Math.random() * 250)}`, // Random IP
                snmpEnabled: true,
                snmpVersion: 'v2c'
            }
        };

        const createRes = await axios.post(`${API_URL}/assets`, assetData, config);
        console.log('   Asset created:', createRes.data.assetId);
        const assetId = createRes.data._id;

        // 3. Verify Filtering
        console.log('3. Verifying Filtering...');
        const listRes = await axios.get(`${API_URL}/assets?category=network&search=NET-TEST-${uniqueId}`, config);
        const found = listRes.data.find(a => a._id === assetId);
        if (found) console.log('   Asset found in filtered list.');
        else console.error('   Asset NOT found in filtered list.');

        // 4. Test Validation (Duplicate IP)
        console.log('4. Testing Duplicate IP Validation...');
        try {
            await axios.post(`${API_URL}/assets`, {
                ...assetData,
                assetId: `NET-TEST-DUP-${uniqueId}`,
                network: {
                    ...assetData.network // Same IP
                }
            }, config);
            console.error('   FAILED: Duplicate IP should have been rejected.');
        } catch (err) {
            if (err.response && err.response.status === 400) {
                console.log('   Success: Duplicate IP rejected as expected.');
            } else {
                console.error('   Unexpected error:', err.message);
            }
        }

        // 5. Test Missing Device Type
        console.log('5. Testing Missing Device Type...');
        try {
            await axios.post(`${API_URL}/assets`, {
                assetId: `NET-TEST-FAIL-${uniqueId}`,
                description: 'Fail Asset',
                category: 'network',
                network: {
                    mgmtIp: '10.0.0.99'
                    // Missing deviceType
                }
            }, config);
            console.error('   FAILED: Missing deviceType should have been rejected.');
        } catch (err) {
            if (err.response && err.response.status === 400) {
                console.log('   Success: Missing deviceType rejected as expected.');
            } else {
                console.error('   Unexpected error:', err.message);
            }
        }

        console.log('Verification Complete.');

    } catch (error) {
        console.error('Verification Failed:', error.message);
        if (error.response) console.error(error.response.data);
    }
}

verify();
