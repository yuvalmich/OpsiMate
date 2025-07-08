const axios = require('axios');
const {Logger} = require("@service-peek/shared");

const BASE_URL = 'http://localhost:3001/api/v1';
const logger = new Logger('test-tags');

async function testTagsController() {
  try {
    logger.info('Testing Tags Controller...\n');

    // Test 1: Get all tags (should be empty initially)
    logger.info('1. Getting all tags (initial state)...');
    const initialTagsResponse = await axios.get(`${BASE_URL}/tags`);
    logger.info('Initial tags:', initialTagsResponse.data);
    if (initialTagsResponse.data.success && initialTagsResponse.data.data.length === 0) {
      logger.info('✅ Initial tags retrieved successfully - database is empty\n');
    } else {
      logger.info('⚠️  Database contains existing tags\n');
    }

    // Test 2: Create a new tag
    logger.info('2. Creating a new tag...');
    const tagData = {
      name: 'Production',
      color: '#EF4444'
    };
    const createTagResponse = await axios.post(`${BASE_URL}/tags`, tagData);
    logger.info('Tag created:', createTagResponse.data);
    const tagId = createTagResponse.data.data.id;
    logger.info('✅ Tag created successfully\n');

    // Verify tag exists in database
    logger.info('2a. Verifying tag exists in database...');
    const verifyTagResponse = await axios.get(`${BASE_URL}/tags/${tagId}`);
    if (verifyTagResponse.data.success && verifyTagResponse.data.data.id === tagId) {
      logger.info('✅ Tag verified in database\n');
    } else {
      logger.info('❌ Tag not found in database\n');
    }

    // Test 3: Get all tags (should now have one tag)
    logger.info('3. Getting all tags (after creation)...');
    const tagsAfterCreateResponse = await axios.get(`${BASE_URL}/tags`);
    logger.info('Tags after creation:', tagsAfterCreateResponse.data);
    if (tagsAfterCreateResponse.data.success && tagsAfterCreateResponse.data.data.length === 1) {
      logger.info('✅ Tags retrieved successfully after creation - database contains 1 tag\n');
    } else {
      logger.info('❌ Database state incorrect after creation\n');
    }

    // Test 4: Get tag by ID
    logger.info('4. Getting tag by ID...');
    const getTagByIdResponse = await axios.get(`${BASE_URL}/tags/${tagId}`);
    logger.info('Tag by ID:', getTagByIdResponse.data);
    if (getTagByIdResponse.data.success && getTagByIdResponse.data.data.name === 'Production') {
      logger.info('✅ Tag retrieved by ID successfully\n');
    } else {
      logger.info('❌ Tag by ID retrieval failed\n');
    }

    // Test 5: Update tag
    logger.info('5. Updating tag...');
    const updateData = {
      name: 'Production-Updated',
      color: '#10B981'
    };
    const updateTagResponse = await axios.put(`${BASE_URL}/tags/${tagId}`, updateData);
    logger.info('Tag updated:', updateTagResponse.data);
    logger.info('✅ Tag updated successfully\n');

    // Verify update in database
    logger.info('5a. Verifying update in database...');
    const verifyUpdateResponse = await axios.get(`${BASE_URL}/tags/${tagId}`);
    if (verifyUpdateResponse.data.success && 
        verifyUpdateResponse.data.data.name === 'Production-Updated' && 
        verifyUpdateResponse.data.data.color === '#10B981') {
      logger.info('✅ Tag update verified in database\n');
    } else {
      logger.info('❌ Tag update not reflected in database\n');
    }

    // Test 6: Create another tag for service association tests
    logger.info('6. Creating second tag for service tests...');
    const secondTagData = {
      name: 'Development',
      color: '#3B82F6'
    };
    const secondTagResponse = await axios.post(`${BASE_URL}/tags`, secondTagData);
    logger.info('Second tag created:', secondTagResponse.data);
    const secondTagId = secondTagResponse.data.data.id;
    logger.info('✅ Second tag created successfully\n');

    // Verify both tags exist in database
    logger.info('6a. Verifying both tags exist in database...');
    const allTagsResponse = await axios.get(`${BASE_URL}/tags`);
    if (allTagsResponse.data.success && allTagsResponse.data.data.length === 2) {
      logger.info('✅ Both tags verified in database\n');
    } else {
      logger.info('❌ Database state incorrect - should have 2 tags\n');
    }

    // Test 7: Create a test service to associate with tags
    logger.info('7. Creating a test service...');
    const serviceData = {
      providerId: 1, // Assuming provider ID 1 exists
      name: 'Test Service',
      serviceIP: '192.168.1.100',
      serviceStatus: 'running',
      serviceType: 'DOCKER'
    };
    
    let serviceId;
    try {
      const createServiceResponse = await axios.post(`${BASE_URL}/services`, serviceData);
      logger.info('Service created:', createServiceResponse.data);
      serviceId = createServiceResponse.data.data.id;
      logger.info('✅ Test service created successfully\n');
    } catch (error) {
      logger.info('⚠️  Could not create test service (provider might not exist):', error.response?.data || error.message);
      logger.info('⚠️  Skipping service-tag association tests\n');
      
      // Test cleanup without service
      logger.info('8. Cleaning up - deleting tags...');
      await axios.delete(`${BASE_URL}/tags/${tagId}`);
      logger.info('✅ First tag deleted successfully');
      
      // Verify first tag is deleted
      try {
        await axios.get(`${BASE_URL}/tags/${tagId}`);
        logger.info('❌ First tag still exists in database');
      } catch (error) {
        if (error.response?.status === 404) {
          logger.info('✅ First tag deletion verified in database');
        }
      }
      
      await axios.delete(`${BASE_URL}/tags/${secondTagId}`);
      logger.info('✅ Second tag deleted successfully');
      
      // Verify second tag is deleted
      try {
        await axios.get(`${BASE_URL}/tags/${secondTagId}`);
        logger.info('❌ Second tag still exists in database');
      } catch (error) {
        if (error.response?.status === 404) {
          logger.info('✅ Second tag deletion verified in database');
        }
      }
      
      // Verify database is empty
      const finalTagsResponse = await axios.get(`${BASE_URL}/tags`);
      if (finalTagsResponse.data.success && finalTagsResponse.data.data.length === 0) {
        logger.info('✅ Database cleanup verified - no tags remaining\n');
      } else {
        logger.info('❌ Database cleanup failed - tags still exist\n');
      }
      
      logger.info('✅ All tag controller tests completed (without service association tests)');
      return;
    }

    // Test 8: Get service tags (should be empty initially)
    logger.info('8. Getting service tags (initial state)...');
    const initialServiceTagsResponse = await axios.get(`${BASE_URL}/tags/service/${serviceId}`);
    logger.info('Initial service tags:', initialServiceTagsResponse.data);
    if (initialServiceTagsResponse.data.success && initialServiceTagsResponse.data.data.length === 0) {
      logger.info('✅ Initial service tags retrieved successfully - no tags assigned\n');
    } else {
      logger.info('❌ Service should have no tags initially\n');
    }

    // Test 9: Add tag to service
    logger.info('9. Adding tag to service...');
    const addTagToServiceData = {
      serviceId: serviceId,
      tagId: tagId
    };
    const addTagToServiceResponse = await axios.post(`${BASE_URL}/tags/service`, addTagToServiceData);
    logger.info('Tag added to service:', addTagToServiceResponse.data);
    logger.info('✅ Tag added to service successfully\n');

    // Verify tag is associated with service
    logger.info('9a. Verifying tag association in database...');
    const serviceTagsAfterAddResponse = await axios.get(`${BASE_URL}/tags/service/${serviceId}`);
    if (serviceTagsAfterAddResponse.data.success && 
        serviceTagsAfterAddResponse.data.data.length === 1 && 
        serviceTagsAfterAddResponse.data.data[0].id === tagId) {
      logger.info('✅ Tag association verified in database\n');
    } else {
      logger.info('❌ Tag association not found in database\n');
    }

    // Test 10: Add second tag to service
    logger.info('10. Adding second tag to service...');
    const addSecondTagData = {
      serviceId: serviceId,
      tagId: secondTagId
    };
    const addSecondTagResponse = await axios.post(`${BASE_URL}/tags/service`, addSecondTagData);
    logger.info('Second tag added to service:', addSecondTagResponse.data);
    logger.info('✅ Second tag added to service successfully\n');

    // Verify both tags are associated with service
    logger.info('10a. Verifying both tag associations in database...');
    const serviceTagsAfterSecondAddResponse = await axios.get(`${BASE_URL}/tags/service/${serviceId}`);
    if (serviceTagsAfterSecondAddResponse.data.success && 
        serviceTagsAfterSecondAddResponse.data.data.length === 2) {
      logger.info('✅ Both tag associations verified in database\n');
    } else {
      logger.info('❌ Both tag associations not found in database\n');
    }

    // Test 11: Remove tag from service
    logger.info('11. Removing tag from service...');
    const removeTagData = {
      serviceId: serviceId,
      tagId: tagId
    };
    const removeTagResponse = await axios.delete(`${BASE_URL}/tags/service`, { data: removeTagData });
    logger.info('Tag removed from service:', removeTagResponse.data);
    logger.info('✅ Tag removed from service successfully\n');

    // Verify tag removal from service
    logger.info('11a. Verifying tag removal from service in database...');
    const serviceTagsAfterRemoveResponse = await axios.get(`${BASE_URL}/tags/service/${serviceId}`);
    if (serviceTagsAfterRemoveResponse.data.success && 
        serviceTagsAfterRemoveResponse.data.data.length === 1 && 
        serviceTagsAfterRemoveResponse.data.data[0].id === secondTagId) {
      logger.info('✅ Tag removal from service verified in database\n');
    } else {
      logger.info('❌ Tag removal from service not reflected in database\n');
    }

    // Test 12: Test validation errors
    logger.info('12. Testing validation errors...');
    
    // Test invalid tag creation (missing name)
    try {
      await axios.post(`${BASE_URL}/tags`, { color: '#EF4444' });
      logger.info('❌ Should have failed - missing name');
    } catch (error) {
      if (error.response?.status === 400) {
        logger.info('✅ Validation error caught for missing name:', error.response?.data?.error);
      } else {
        logger.info('❌ Unexpected error for missing name:', error.response?.status);
      }
    }

    // Test invalid tag creation (invalid color)
    try {
      await axios.post(`${BASE_URL}/tags`, { name: 'Invalid Tag', color: 'invalid-color' });
      logger.info('❌ Should have failed - invalid color');
    } catch (error) {
      if (error.response?.status === 400) {
        logger.info('✅ Validation error caught for invalid color:', error.response?.data?.error);
      } else {
        logger.info('❌ Unexpected error for invalid color:', error.response?.status);
      }
    }

    // Test invalid tag ID
    try {
      await axios.get(`${BASE_URL}/tags/999999`);
      logger.info('❌ Should have failed - tag not found');
    } catch (error) {
      if (error.response?.status === 404) {
        logger.info('✅ 404 error caught for non-existent tag');
      } else {
        logger.info('❌ Unexpected error for non-existent tag:', error.response?.status);
      }
    }

    logger.info('✅ Validation error tests completed\n');

    // Test 13: Cleanup - delete tags and service
    logger.info('13. Cleaning up...');
    await axios.delete(`${BASE_URL}/tags/${tagId}`);
    logger.info('✅ First tag deleted successfully');
    
    // Verify first tag is deleted
    try {
      await axios.get(`${BASE_URL}/tags/${tagId}`);
      logger.info('❌ First tag still exists in database');
    } catch (error) {
      if (error.response?.status === 404) {
        logger.info('✅ First tag deletion verified in database');
      }
    }
    
    await axios.delete(`${BASE_URL}/tags/${secondTagId}`);
    logger.info('✅ Second tag deleted successfully');
    
    // Verify second tag is deleted
    try {
      await axios.get(`${BASE_URL}/tags/${secondTagId}`);
      logger.info('❌ Second tag still exists in database');
    } catch (error) {
      if (error.response?.status === 404) {
        logger.info('✅ Second tag deletion verified in database');
      }
    }
    
    await axios.delete(`${BASE_URL}/services/${serviceId}`);
    logger.info('✅ Test service deleted successfully');
    
    // Verify database is empty
    const finalTagsResponse = await axios.get(`${BASE_URL}/tags`);
    if (finalTagsResponse.data.success && finalTagsResponse.data.data.length === 0) {
      logger.info('✅ Database cleanup verified - no tags remaining\n');
    } else {
      logger.info('❌ Database cleanup failed - tags still exist\n');
    }

    logger.info('✅ All tags controller tests completed successfully!');

  } catch (error) {
    logger.error('❌ Test failed:', error.response?.data || error.message);
    logger.error('Stack trace:', error.stack);
  }
}

// Run the test
testTagsController(); 