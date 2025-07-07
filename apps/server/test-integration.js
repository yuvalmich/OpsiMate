const axios = require('axios');
const {Logger} = require("@service-peek/shared");

const BASE_URL = 'http://localhost:3001/api/v1';
const logger = new Logger('test-integration');

async function testIntegration() {
  try {
    logger.info('Testing Integration Router...\n');

    // Test 1: Create a provider
    logger.info('1. Creating a provider...');
    const providerData = {
      provider_name: 'Test Azure VM',
      provider_ip: '192.168.1.100',
      username: 'azureuser',
      public_key: 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC...',
      ssh_port: 22
    };

    const createResponse = await axios.post(`${BASE_URL}/providers`, providerData);
    logger.info('Provider created:', createResponse.data);
    const providerId = createResponse.data.data.id;

    // Test 2: Get all providers
    logger.info('\n2. Getting all providers...');
    const providersResponse = await axios.get(`${BASE_URL}/providers`);
    logger.info('Providers:', providersResponse.data);

    // Test 3: Get provider instances (this will fail SSH connection but test the endpoint)
    logger.info('\n3. Getting provider instances...');
    try {
      const instancesResponse = await axios.get(`${BASE_URL}/providers/${providerId}/instance`);
      logger.info('Instances:', instancesResponse.data);
    } catch (error) {
      logger.info('Expected SSH error:', error.response?.data || error.message);
    }

    // Test 4: Store services in bulk
    logger.info('\n4. Storing services in bulk...');
    const servicesData = {
      serviceNames: ['nginx', 'postgresql', 'redis']
    };

    const bulkResponse = await axios.post(`${BASE_URL}/providers/${providerId}/instance/bulk`, servicesData);
    logger.info('Services stored:', bulkResponse.data);

    // Test 5: Get services for provider
    logger.info('\n5. Getting services for provider...');
    const servicesResponse = await axios.get(`${BASE_URL}/providers/${providerId}/services`);
    logger.info('Services:', servicesResponse.data);

    logger.info('\n✅ All tests completed!');

  } catch (error) {
    logger.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testIntegration();