const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/v1/integration';

async function testIntegration() {
  try {
    console.log('Testing Integration Router...\n');

    // Test 1: Create a provider
    console.log('1. Creating a provider...');
    const providerData = {
      provider_name: 'Test Azure VM',
      provider_ip: '192.168.1.100',
      username: 'azureuser',
      public_key: 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC...',
      ssh_port: 22
    };

    const createResponse = await axios.post(`${BASE_URL}/providers`, providerData);
    console.log('Provider created:', createResponse.data);
    const providerId = createResponse.data.data.id;

    // Test 2: Get all providers
    console.log('\n2. Getting all providers...');
    const providersResponse = await axios.get(`${BASE_URL}/providers`);
    console.log('Providers:', providersResponse.data);

    // Test 3: Get provider instances (this will fail SSH connection but test the endpoint)
    console.log('\n3. Getting provider instances...');
    try {
      const instancesResponse = await axios.get(`${BASE_URL}/providers/${providerId}/instance`);
      console.log('Instances:', instancesResponse.data);
    } catch (error) {
      console.log('Expected SSH error:', error.response?.data || error.message);
    }

    // Test 4: Store services in bulk
    console.log('\n4. Storing services in bulk...');
    const servicesData = {
      service_names: ['nginx', 'postgresql', 'redis']
    };

    const bulkResponse = await axios.post(`${BASE_URL}/providers/${providerId}/instance/bulk`, servicesData);
    console.log('Services stored:', bulkResponse.data);

    // Test 5: Get services for provider
    console.log('\n5. Getting services for provider...');
    const servicesResponse = await axios.get(`${BASE_URL}/providers/${providerId}/services`);
    console.log('Services:', servicesResponse.data);

    console.log('\n✅ All tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testIntegration(); 