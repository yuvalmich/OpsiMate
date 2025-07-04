const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/v1';

async function testTagsController() {
  try {
    console.log('Testing Tags Controller...\n');

    // Test 1: Get all tags (should be empty initially)
    console.log('1. Getting all tags (initial state)...');
    const initialTagsResponse = await axios.get(`${BASE_URL}/tags`);
    console.log('Initial tags:', initialTagsResponse.data);
    if (initialTagsResponse.data.success && initialTagsResponse.data.data.length === 0) {
      console.log('✅ Initial tags retrieved successfully - database is empty\n');
    } else {
      console.log('⚠️  Database contains existing tags\n');
    }

    // Test 2: Create a new tag
    console.log('2. Creating a new tag...');
    const tagData = {
      name: 'Production',
      color: '#EF4444'
    };
    const createTagResponse = await axios.post(`${BASE_URL}/tags`, tagData);
    console.log('Tag created:', createTagResponse.data);
    const tagId = createTagResponse.data.data.id;
    console.log('✅ Tag created successfully\n');

    // Verify tag exists in database
    console.log('2a. Verifying tag exists in database...');
    const verifyTagResponse = await axios.get(`${BASE_URL}/tags/${tagId}`);
    if (verifyTagResponse.data.success && verifyTagResponse.data.data.id === tagId) {
      console.log('✅ Tag verified in database\n');
    } else {
      console.log('❌ Tag not found in database\n');
    }

    // Test 3: Get all tags (should now have one tag)
    console.log('3. Getting all tags (after creation)...');
    const tagsAfterCreateResponse = await axios.get(`${BASE_URL}/tags`);
    console.log('Tags after creation:', tagsAfterCreateResponse.data);
    if (tagsAfterCreateResponse.data.success && tagsAfterCreateResponse.data.data.length === 1) {
      console.log('✅ Tags retrieved successfully after creation - database contains 1 tag\n');
    } else {
      console.log('❌ Database state incorrect after creation\n');
    }

    // Test 4: Get tag by ID
    console.log('4. Getting tag by ID...');
    const getTagByIdResponse = await axios.get(`${BASE_URL}/tags/${tagId}`);
    console.log('Tag by ID:', getTagByIdResponse.data);
    if (getTagByIdResponse.data.success && getTagByIdResponse.data.data.name === 'Production') {
      console.log('✅ Tag retrieved by ID successfully\n');
    } else {
      console.log('❌ Tag by ID retrieval failed\n');
    }

    // Test 5: Update tag
    console.log('5. Updating tag...');
    const updateData = {
      name: 'Production-Updated',
      color: '#10B981'
    };
    const updateTagResponse = await axios.put(`${BASE_URL}/tags/${tagId}`, updateData);
    console.log('Tag updated:', updateTagResponse.data);
    console.log('✅ Tag updated successfully\n');

    // Verify update in database
    console.log('5a. Verifying update in database...');
    const verifyUpdateResponse = await axios.get(`${BASE_URL}/tags/${tagId}`);
    if (verifyUpdateResponse.data.success && 
        verifyUpdateResponse.data.data.name === 'Production-Updated' && 
        verifyUpdateResponse.data.data.color === '#10B981') {
      console.log('✅ Tag update verified in database\n');
    } else {
      console.log('❌ Tag update not reflected in database\n');
    }

    // Test 6: Create another tag for service association tests
    console.log('6. Creating second tag for service tests...');
    const secondTagData = {
      name: 'Development',
      color: '#3B82F6'
    };
    const secondTagResponse = await axios.post(`${BASE_URL}/tags`, secondTagData);
    console.log('Second tag created:', secondTagResponse.data);
    const secondTagId = secondTagResponse.data.data.id;
    console.log('✅ Second tag created successfully\n');

    // Verify both tags exist in database
    console.log('6a. Verifying both tags exist in database...');
    const allTagsResponse = await axios.get(`${BASE_URL}/tags`);
    if (allTagsResponse.data.success && allTagsResponse.data.data.length === 2) {
      console.log('✅ Both tags verified in database\n');
    } else {
      console.log('❌ Database state incorrect - should have 2 tags\n');
    }

    // Test 7: Create a test service to associate with tags
    console.log('7. Creating a test service...');
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
      console.log('Service created:', createServiceResponse.data);
      serviceId = createServiceResponse.data.data.id;
      console.log('✅ Test service created successfully\n');
    } catch (error) {
      console.log('⚠️  Could not create test service (provider might not exist):', error.response?.data || error.message);
      console.log('⚠️  Skipping service-tag association tests\n');
      
      // Test cleanup without service
      console.log('8. Cleaning up - deleting tags...');
      await axios.delete(`${BASE_URL}/tags/${tagId}`);
      console.log('✅ First tag deleted successfully');
      
      // Verify first tag is deleted
      try {
        await axios.get(`${BASE_URL}/tags/${tagId}`);
        console.log('❌ First tag still exists in database');
      } catch (error) {
        if (error.response?.status === 404) {
          console.log('✅ First tag deletion verified in database');
        }
      }
      
      await axios.delete(`${BASE_URL}/tags/${secondTagId}`);
      console.log('✅ Second tag deleted successfully');
      
      // Verify second tag is deleted
      try {
        await axios.get(`${BASE_URL}/tags/${secondTagId}`);
        console.log('❌ Second tag still exists in database');
      } catch (error) {
        if (error.response?.status === 404) {
          console.log('✅ Second tag deletion verified in database');
        }
      }
      
      // Verify database is empty
      const finalTagsResponse = await axios.get(`${BASE_URL}/tags`);
      if (finalTagsResponse.data.success && finalTagsResponse.data.data.length === 0) {
        console.log('✅ Database cleanup verified - no tags remaining\n');
      } else {
        console.log('❌ Database cleanup failed - tags still exist\n');
      }
      
      console.log('✅ All tag controller tests completed (without service association tests)');
      return;
    }

    // Test 8: Get service tags (should be empty initially)
    console.log('8. Getting service tags (initial state)...');
    const initialServiceTagsResponse = await axios.get(`${BASE_URL}/tags/service/${serviceId}`);
    console.log('Initial service tags:', initialServiceTagsResponse.data);
    if (initialServiceTagsResponse.data.success && initialServiceTagsResponse.data.data.length === 0) {
      console.log('✅ Initial service tags retrieved successfully - no tags assigned\n');
    } else {
      console.log('❌ Service should have no tags initially\n');
    }

    // Test 9: Add tag to service
    console.log('9. Adding tag to service...');
    const addTagToServiceData = {
      serviceId: serviceId,
      tagId: tagId
    };
    const addTagToServiceResponse = await axios.post(`${BASE_URL}/tags/service`, addTagToServiceData);
    console.log('Tag added to service:', addTagToServiceResponse.data);
    console.log('✅ Tag added to service successfully\n');

    // Verify tag is associated with service
    console.log('9a. Verifying tag association in database...');
    const serviceTagsAfterAddResponse = await axios.get(`${BASE_URL}/tags/service/${serviceId}`);
    if (serviceTagsAfterAddResponse.data.success && 
        serviceTagsAfterAddResponse.data.data.length === 1 && 
        serviceTagsAfterAddResponse.data.data[0].id === tagId) {
      console.log('✅ Tag association verified in database\n');
    } else {
      console.log('❌ Tag association not found in database\n');
    }

    // Test 10: Add second tag to service
    console.log('10. Adding second tag to service...');
    const addSecondTagData = {
      serviceId: serviceId,
      tagId: secondTagId
    };
    const addSecondTagResponse = await axios.post(`${BASE_URL}/tags/service`, addSecondTagData);
    console.log('Second tag added to service:', addSecondTagResponse.data);
    console.log('✅ Second tag added to service successfully\n');

    // Verify both tags are associated with service
    console.log('10a. Verifying both tag associations in database...');
    const serviceTagsAfterSecondAddResponse = await axios.get(`${BASE_URL}/tags/service/${serviceId}`);
    if (serviceTagsAfterSecondAddResponse.data.success && 
        serviceTagsAfterSecondAddResponse.data.data.length === 2) {
      console.log('✅ Both tag associations verified in database\n');
    } else {
      console.log('❌ Both tag associations not found in database\n');
    }

    // Test 11: Remove tag from service
    console.log('11. Removing tag from service...');
    const removeTagData = {
      serviceId: serviceId,
      tagId: tagId
    };
    const removeTagResponse = await axios.delete(`${BASE_URL}/tags/service`, { data: removeTagData });
    console.log('Tag removed from service:', removeTagResponse.data);
    console.log('✅ Tag removed from service successfully\n');

    // Verify tag removal from service
    console.log('11a. Verifying tag removal from service in database...');
    const serviceTagsAfterRemoveResponse = await axios.get(`${BASE_URL}/tags/service/${serviceId}`);
    if (serviceTagsAfterRemoveResponse.data.success && 
        serviceTagsAfterRemoveResponse.data.data.length === 1 && 
        serviceTagsAfterRemoveResponse.data.data[0].id === secondTagId) {
      console.log('✅ Tag removal from service verified in database\n');
    } else {
      console.log('❌ Tag removal from service not reflected in database\n');
    }

    // Test 12: Test validation errors
    console.log('12. Testing validation errors...');
    
    // Test invalid tag creation (missing name)
    try {
      await axios.post(`${BASE_URL}/tags`, { color: '#EF4444' });
      console.log('❌ Should have failed - missing name');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Validation error caught for missing name:', error.response?.data?.error);
      } else {
        console.log('❌ Unexpected error for missing name:', error.response?.status);
      }
    }

    // Test invalid tag creation (invalid color)
    try {
      await axios.post(`${BASE_URL}/tags`, { name: 'Invalid Tag', color: 'invalid-color' });
      console.log('❌ Should have failed - invalid color');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Validation error caught for invalid color:', error.response?.data?.error);
      } else {
        console.log('❌ Unexpected error for invalid color:', error.response?.status);
      }
    }

    // Test invalid tag ID
    try {
      await axios.get(`${BASE_URL}/tags/999999`);
      console.log('❌ Should have failed - tag not found');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ 404 error caught for non-existent tag');
      } else {
        console.log('❌ Unexpected error for non-existent tag:', error.response?.status);
      }
    }

    console.log('✅ Validation error tests completed\n');

    // Test 13: Cleanup - delete tags and service
    console.log('13. Cleaning up...');
    await axios.delete(`${BASE_URL}/tags/${tagId}`);
    console.log('✅ First tag deleted successfully');
    
    // Verify first tag is deleted
    try {
      await axios.get(`${BASE_URL}/tags/${tagId}`);
      console.log('❌ First tag still exists in database');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ First tag deletion verified in database');
      }
    }
    
    await axios.delete(`${BASE_URL}/tags/${secondTagId}`);
    console.log('✅ Second tag deleted successfully');
    
    // Verify second tag is deleted
    try {
      await axios.get(`${BASE_URL}/tags/${secondTagId}`);
      console.log('❌ Second tag still exists in database');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Second tag deletion verified in database');
      }
    }
    
    await axios.delete(`${BASE_URL}/services/${serviceId}`);
    console.log('✅ Test service deleted successfully');
    
    // Verify database is empty
    const finalTagsResponse = await axios.get(`${BASE_URL}/tags`);
    if (finalTagsResponse.data.success && finalTagsResponse.data.data.length === 0) {
      console.log('✅ Database cleanup verified - no tags remaining\n');
    } else {
      console.log('❌ Database cleanup failed - tags still exist\n');
    }

    console.log('✅ All tags controller tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testTagsController(); 